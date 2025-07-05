import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const [totalRequests, setTotalRequests] = useState(0);

  const [requestsByMonth, setRequestsByMonth] = useState({});
  const [requestsByDeviceType, setRequestsByDeviceType] = useState({});
  const [requestsByPriority, setRequestsByPriority] = useState({});
  const [requestsByStatusDetailed, setRequestsByStatusDetailed] = useState({});

  useEffect(() => {
    const requestsRef = ref(rtdb, 'requests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests = Object.values(data);
        setTotalRequests(requests.length);
        


        // Process requests by month
        const monthlyCounts = requests.reduce((acc, req) => {
          if (req.dateSubmitted) {
            const month = new Date(req.dateSubmitted).toLocaleString('default', { month: 'short', year: 'numeric' });
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
  }, []);

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