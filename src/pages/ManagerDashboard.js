import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { PieChart, Pie, Cell, BarChart, Bar, Rectangle, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const ManagerDashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRepairs, setCompletedRepairs] = useState(0);
  const [activeTechnicians, setActiveTechnicians] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingRecommendations, setPendingRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'recommendations'

  const [requestsByDevice, setRequestsByDevice] = useState([]);
  const [requestsByPriority, setRequestsByPriority] = useState([]);
  const [requestsByStatus, setRequestsByStatus] = useState([]);

  useEffect(() => {
    const requestsRef = ref(rtdb, 'requests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests = Object.values(data);
        setTotalRequests(requests.length);
        
        const completed = requests.filter(req => req.status === 'Completed').length;
        const pending = requests.filter(req => req.status === 'Pending' || req.status === 'In Progress').length;
        setCompletedRepairs(completed);
        setPendingRequests(pending);
        
        // Process requests by device type
        const deviceTypeCounts = requests.reduce((acc, req) => {
          if (req.deviceType) {
            acc[req.deviceType] = (acc[req.deviceType] || 0) + 1;
          }
          return acc;
        }, {});
        const deviceData = Object.keys(deviceTypeCounts).map(type => ({
          name: type,
          value: deviceTypeCounts[type]
        }));
        setRequestsByDevice(deviceData);

        // Process requests by priority
        const priorityCounts = requests.reduce((acc, req) => {
          if (req.priority) {
            acc[req.priority] = (acc[req.priority] || 0) + 1;
          }
          return acc;
        }, {});
        const priorityData = Object.keys(priorityCounts).map(priority => ({
          name: priority,
          value: priorityCounts[priority]
        }));
        setRequestsByPriority(priorityData);

        // Process requests by status
        const statusCounts = requests.reduce((acc, req) => {
          if (req.status) {
            acc[req.status] = (acc[req.status] || 0) + 1;
          }
          return acc;
        }, {});
        const statusData = Object.keys(statusCounts).map(status => ({
          name: status,
          value: statusCounts[status]
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
      }
    });

    // Fetch pending recommendations
    const recommendationsRef = ref(rtdb, 'recommendations');
    onValue(recommendationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recommendations = Object.entries(data)
          .map(([id, rec]) => ({ id, ...rec }))
          .filter(rec => rec.approvalStatus === 'pending');
        setPendingRecommendations(recommendations);
      } else {
        setPendingRecommendations([]);
      }
    });
  }, []);

  const handleApproveRecommendation = async (recommendationId, recommendation) => {
    try {
      // Update recommendation status to approved
      await update(ref(rtdb, `recommendations/${recommendationId}`), {
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Manager' // You can get actual manager info from auth context
      });

      // Update the original request status to completed
      if (recommendation.requestId) {
        await update(ref(rtdb, `requests/${recommendation.requestId}`), {
          status: 'Completed',
          completedAt: new Date().toISOString(),
          finalRecommendation: recommendation.recommendationText
        });
      }

      alert('Recommendation approved successfully!');
    } catch (error) {
      console.error('Error approving recommendation:', error);
      alert('Error approving recommendation. Please try again.');
    }
  };

  const handleRejectRecommendation = async (recommendationId, recommendation) => {
    try {
      // Update recommendation status to rejected
      await update(ref(rtdb, `recommendations/${recommendationId}`), {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'Manager' // You can get actual manager info from auth context
      });

      // Update the original request status back to pending for further review
      if (recommendation.requestId) {
        await update(ref(rtdb, `requests/${recommendation.requestId}`), {
          status: 'Pending',
          rejectionNote: 'Recommendation rejected by manager'
        });
      }

      alert('Recommendation rejected.');
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      alert('Error rejecting recommendation. Please try again.');
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.dashboardTitle}>Manager Dashboard</h2>
      
      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === 'dashboard' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard Overview
        </button>
        <button 
          style={activeTab === 'recommendations' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('recommendations')}
        >
          Pending Recommendations ({pendingRecommendations.length})
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
                <h4>Pending Recommendations</h4>
                <p style={styles.statNumber}>{pendingRecommendations.length}</p>
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
        // Recommendations Tab
        <div style={styles.recommendationsSection}>
          <h3>Pending Recommendations for Approval</h3>
          {pendingRecommendations.length > 0 ? (
            <div style={styles.recommendationsGrid}>
              {pendingRecommendations.map((recommendation) => (
                <div key={recommendation.id} style={styles.recommendationCard}>
                  <h4 style={styles.cardTitle}>Request #{recommendation.requestId}</h4>
                  <p><strong>Device:</strong> {recommendation.deviceType}</p>
                  <p><strong>Issue:</strong> {recommendation.issueDescription}</p>
                  <p><strong>Engineer:</strong> {recommendation.engineerName}</p>
                  <p><strong>Submitted:</strong> {new Date(recommendation.submittedAt).toLocaleString()}</p>
                  
                  <div style={styles.recommendationContent}>
                    <strong>Recommendation:</strong>
                    <p style={styles.recommendationText}>{recommendation.recommendationText}</p>
                  </div>
                  
                  <div style={styles.actionButtons}>
                    <button 
                      style={styles.approveButton}
                      onClick={() => handleApproveRecommendation(recommendation.id, recommendation)}
                    >
                      Approve
                    </button>
                    <button 
                      style={styles.rejectButton}
                      onClick={() => handleRejectRecommendation(recommendation.id, recommendation)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noRecommendations}>No pending recommendations at this time.</p>
          )}
        </div>
      )}
    </div>
  );
};

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
  statusSection: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#007bff',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  chartContainer: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  recommendationsSection: {
    marginTop: '20px'
  },
  recommendationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  recommendationCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #dee2e6'
  },
  cardTitle: {
    color: '#007bff',
    marginBottom: '15px'
  },
  recommendationContent: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    margin: '15px 0',
    border: '1px solid #e9ecef'
  },
  recommendationText: {
    fontStyle: 'italic',
    lineHeight: '1.5',
    margin: '10px 0 0 0'
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
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  noRecommendations: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '18px',
    marginTop: '40px'
  }
};

export default ManagerDashboard;