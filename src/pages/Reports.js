import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [requestsByMonth, setRequestsByMonth] = useState({});
  const [requestsByDeviceType, setRequestsByDeviceType] = useState({});
  const [requestsByPriority, setRequestsByPriority] = useState({});
  const [requestsByStatusDetailed, setRequestsByStatusDetailed] = useState({});

  useEffect(() => {
    const requestsRef = ref(rtdb, 'requests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let requests = Object.values(data);

        // Filter requests by date range
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          requests = requests.filter(req => {
            const requestDate = new Date(req.createdAt);
            return requestDate >= start && requestDate <= end;
          });
        }

        setTotalRequests(requests.length);


        // Process requests by month
        const monthlyCounts = requests.reduce((acc, req) => {
          if (req.createdAt) {
            const month = new Date(req.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {});
        setRequestsByMonth(monthlyCounts);

        // Process requests by device type
        const deviceTypeCounts = requests.reduce((acc, req) => {
          if (req.deviceType) {
            acc[req.deviceType] = (acc[req.deviceType] || 0) + 1;
          }
          return acc;
        }, {});
        setRequestsByDeviceType(deviceTypeCounts);

        // Process requests by priority
        const priorityCounts = requests.reduce((acc, req) => {
          if (req.priority) {
            acc[req.priority] = (acc[req.priority] || 0) + 1;
          }
          return acc;
        }, {});
        setRequestsByPriority(priorityCounts);

        // Process requests by detailed status
        const statusCounts = requests.reduce((acc, req) => {
          if (req.status) {
            acc[req.status] = (acc[req.status] || 0) + 1;
          }
          return acc;
        }, {});
        setRequestsByStatusDetailed(statusCounts);
      }
    });

    const usersRef = ref(rtdb, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data);
        

      }
    });
  }, [startDate, endDate]);

  const generatePdfReport = () => {
    const input = document.getElementById('report-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('monthly_report.pdf');
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Monthly Report Summary</h2>
      
      <div id="report-container" style={styles.reportsContainer}>
        <div id="report-content">
          <div style={styles.headerSection}>
            <img src="/logo.png" alt="Company Logo" style={styles.logo} />
            <div style={styles.addressContainer}>
              <p style={styles.companyName}>National Water Supply & Drainage Board</p>
              <p style={styles.addressLine}>Regional Office,</p>
              <p style={styles.addressLine}>Siridammarathana Mawatha,</p>
              <p style={styles.addressLine}>Ampara</p>
            </div>
          </div>
          <div style={styles.dateFilter}>
            <label htmlFor="startDate">From:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <label htmlFor="endDate">To:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <div style={styles.reportSection}>
            <div style={styles.reportRow}>
              <div style={styles.reportLabel}>Total Requests:</div>
              <div style={styles.reportValue}>{totalRequests}</div>
            </div>
          </div>

          <div style={styles.reportSection}>
            <h3>Requests by Month</h3>
            {Object.entries(requestsByMonth).map(([month, count]) => (
              <div key={month} style={styles.reportRow}>
                <div style={styles.reportLabel}>{month}:</div>
                <div style={styles.reportValue}>{count}</div>
              </div>
            ))}
          </div>

          <div style={styles.reportSection}>
            <h3>Requests by Device Type</h3>
            {Object.entries(requestsByDeviceType).map(([deviceType, count]) => (
              <div key={deviceType} style={styles.reportRow}>
                <div style={styles.reportLabel}>{deviceType}:</div>
                <div style={styles.reportValue}>{count}</div>
              </div>
            ))}
          </div>

          <div style={styles.reportSection}>
            <h3>Requests by Priority</h3>
            {Object.entries(requestsByPriority).map(([priority, count]) => (
              <div key={priority} style={styles.reportRow}>
                <div style={styles.reportLabel}>{priority}:</div>
                <div style={styles.reportValue}>{count}</div>
              </div>
            ))}
          </div>

          <div style={styles.reportSection}>
            <h3>Requests by Status (Detailed)</h3>
            {Object.entries(requestsByStatusDetailed).map(([status, count]) => (
              <div key={status} style={styles.reportRow}>
                <div style={styles.reportLabel}>{status}:</div>
                <div style={styles.reportValue}>{count}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={styles.generateReportBtn} onClick={generatePdfReport}>Generate Detailed Report</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px',
  },
  reportsContainer: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '100%',
    height: '100px',
    marginBottom: '30px',
  },
  addressContainer: {
    textAlign: 'center',
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0 0 5px 0',
  },
  addressLine: {
    margin: '0 0 2px 0',
    fontSize: '14px',
  },
  dateFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  dateInput: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
  },
  reportSection: {
    marginBottom: '30px',
  },
  reportRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px dashed #e9ecef',
    paddingBottom: '10px',
  },
  reportLabel: {
    flex: '0 0 40%',
    fontWeight: 'bold',
    color: '#555',
  },
  reportValue: {
    flex: '0 0 60%',
  },
  reportSelect: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
  },
  generateReportBtn: {
    backgroundColor: '#0088FE',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'block',
    margin: '0 auto',
    transition: 'background-color 0.3s ease',
  },
};

export default Reports;