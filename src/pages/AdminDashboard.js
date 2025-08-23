import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SupplyDivisionDocument from '../components/SupplyDivisionDocument';

const AdminDashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRepairs, setCompletedRepairs] = useState(0);
  const [activeTechnicians, setActiveTechnicians] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'parts'
  const [partsRequests, setPartsRequests] = useState([]);
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const [selectedPartsRequest, setSelectedPartsRequest] = useState(null);

  const [requestsByDevice, setRequestsByDevice] = useState([]);
  const [requestsByPriority, setRequestsByPriority] = useState([]);
  const [requestsByStatus, setRequestsByStatus] = useState([]);
  // Removed monthly report tab state variables

  useEffect(() => {
    const requestsRef = ref(rtdb, 'requests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests = Object.values(data);
        setTotalRequests(requests.length);
        
        // Count completed and pending requests
        const completed = requests.filter(req => req.status === 'Completed').length;
        const pending = requests.filter(req => req.status === 'Pending' || req.status === 'In Progress').length;
        setCompletedRepairs(completed);
        setPendingRequests(pending);
        
        const completedRequests = requests.filter(req => req.status === 'Completed');
        
        // Generate data for request types pie chart


        const deviceCount = {};
        requests.forEach(req => {
          const device = req.deviceType || 'Other';
          deviceCount[device] = (deviceCount[device] || 0) + 1;
        });

        const deviceData = Object.keys(deviceCount).map(device => ({
          name: device,
          value: deviceCount[device]
        }));
        setRequestsByDevice(deviceData);

        const priorityCount = {};
        requests.forEach(req => {
          const priority = req.priority || 'Other';
          priorityCount[priority] = (priorityCount[priority] || 0) + 1;
        });

        const priorityData = Object.keys(priorityCount).map(priority => ({
          name: priority,
          value: priorityCount[priority]
        }));
        setRequestsByPriority(priorityData);

        const statusCount = {};
        requests.forEach(req => {
          const status = req.status || 'Other';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const statusData = Object.keys(statusCount).map(status => ({
          name: status,
          value: statusCount[status]
        }));
        setRequestsByStatus(statusData);
        

      }
    });

    const usersRef = ref(rtdb, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data);
        const activeTechs = users.filter(user => user.role === 'technician').length;
        setActiveTechnicians(activeTechs);
        
        // Removed technician performance and vendor details data fetching
      }
    });

    // Fetch parts requests
    const partsRequestsRef = ref(rtdb, 'partsRequests');
    onValue(partsRequestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const partsRequestsArray = Object.entries(data).map(([id, request]) => ({
          id,
          ...request
        }));
        setPartsRequests(partsRequestsArray);
      } else {
        setPartsRequests([]);
      }
    });
  }, []);

  const handleProcessPartsRequest = async (requestId, action) => {
    try {
      const requestRef = ref(rtdb, `partsRequests/${requestId}`);
      if (action === 'approve') {
        await update(requestRef, {
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: 'admin'
        });
        alert('Parts request approved successfully!');
      } else if (action === 'reject') {
        await update(requestRef, {
          status: 'rejected',
          processedAt: new Date().toISOString(),
          processedBy: 'admin'
        });
        alert('Parts request rejected.');
      } else if (action === 'delete') {
        await remove(requestRef);
        alert('Parts request deleted.');
      }
    } catch (error) {
      console.error('Error processing parts request:', error);
      alert('Error processing parts request. Please try again.');
    }
  };

  const handleCreateDocument = (partsRequest) => {
    setSelectedPartsRequest(partsRequest);
    setShowDocumentGenerator(true);
  };

  const handleCloseDocument = () => {
    setShowDocumentGenerator(false);
    setSelectedPartsRequest(null);
  };

  const handleMarkAsProcessed = async (requestId) => {
    try {
      const requestRef = ref(rtdb, `partsRequests/${requestId}`);
      await update(requestRef, {
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: 'admin'
      });
      alert('Parts request marked as processed!');
    } catch (error) {
      console.error('Error updating parts request:', error);
      alert('Error updating parts request. Please try again.');
    }
  };

  const renderPartsRequests = () => {
    if (partsRequests.length === 0) {
      return (
        <div style={styles.noRequests}>
          <h3>No parts requests found</h3>
          <p>Technicians haven't submitted any parts requests yet.</p>
        </div>
      );
    }

    return (
      <div style={styles.partsRequestsGrid}>
        {partsRequests.map((request) => (
          <div key={request.id} style={styles.partsRequestCard}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>Request #{request.id.slice(-6)}</h4>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: request.status === 'pending' ? '#ffc107' : 
                                request.status === 'processed' ? '#28a745' : 
                                request.status === 'approved' ? '#17a2b8' : '#dc3545'
              }}>
                {request.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            
            <div style={styles.requestInfo}>
              <p><strong>Repair Request ID:</strong> {request.requestId}</p>
              <p><strong>Technician:</strong> {request.technicianEmail}</p>
              <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}</p>
              {request.processedAt && (
                <p><strong>Processed:</strong> {new Date(request.processedAt).toLocaleString()}</p>
              )}
            </div>

            <div style={styles.itemsSection}>
              <h5>Requested Items:</h5>
              {request.items.map((item, index) => (
                <div key={index} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <strong>{item.name}</strong>
                    <span style={styles.itemAmount}>Qty: {item.amount}</span>
                  </div>
                  {item.description && (
                    <p style={styles.itemDescription}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.actionButtons}>
              <button 
                style={styles.documentButton}
                onClick={() => handleCreateDocument(request)}
              >
                Generate Supply Document
              </button>
              {request.status !== 'processed' && (
                <button 
                  style={styles.processedButton}
                  onClick={() => handleMarkAsProcessed(request.id)}
                >
                  Mark as Processed
                </button>
              )}
              <button 
                style={styles.deleteButton}
                onClick={() => handleProcessPartsRequest(request.id, 'delete')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Removed tab switching handler
  
  return (
    <div style={styles.container}>
      <h2 style={styles.dashboardTitle}>Admin Dashboard</h2>
      
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === 'dashboard' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          style={activeTab === 'parts' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('parts')}
        >
          Parts Requests ({partsRequests.filter(req => req.status === 'pending').length})
        </button>
      </div>
      
      {activeTab === 'dashboard' ? (
        <>
          <div style={styles.statusSection}>
            <h3>Status Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h4>Total Requests</h4>
                <p style={styles.statNumber}>{totalRequests}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Completed Repairs</h4>
                <p style={styles.statNumber}>{completedRepairs}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Pending Requests</h4>
                <p style={styles.statNumber}>{pendingRequests}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Active Technicians</h4>
                <p style={styles.statNumber}>{activeTechnicians}</p>
              </div>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.chartContainer}>
              <h3>Repair Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Repairs', completed: completedRepairs, pending: pendingRequests }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                  <Bar dataKey="pending" name="Pending" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartContainer}>
              <h3>Requests by Device Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestsByDevice}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {requestsByDevice.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartContainer}>
              <h3>Requests by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestsByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {requestsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartContainer}>
              <h3>Requests by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {requestsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div style={styles.partsSection}>
          <h3>Parts Requests Management</h3>
          {renderPartsRequests()}
        </div>
      )}

      {showDocumentGenerator && (
        <SupplyDivisionDocument 
          partsRequest={selectedPartsRequest}
          onClose={handleCloseDocument}
        />
      )}
    </div>
  );
};

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  dashboardTitle: {
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '2px solid #dee2e6'
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6c757d',
    borderBottom: '3px solid transparent'
  },
  activeTab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#007bff',
    borderBottom: '3px solid #007bff'
  },
  statusSection: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0088FE',
    margin: '10px 0',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginBottom: '30px',
  },
  chartContainer: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    height: '400px',
  },
  partsSection: {
    marginTop: '20px'
  },
  partsRequestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  partsRequestCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #dee2e6'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  },
  cardTitle: {
    color: '#007bff',
    margin: '0'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  requestInfo: {
    marginBottom: '15px'
  },
  itemsSection: {
    marginBottom: '15px'
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '8px',
    border: '1px solid #e9ecef'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemAmount: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px'
  },
  itemDescription: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  approveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  deleteButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  documentButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  processedButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default AdminDashboard;