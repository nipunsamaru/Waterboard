import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRepairs, setCompletedRepairs] = useState(0);
  const [activeTechnicians, setActiveTechnicians] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

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
  }, []);

  // Removed tab switching handler
  
  return (
    <div style={styles.container}>
      <h2 style={styles.dashboardTitle}>Admin Dashboard</h2>
      
      
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
  // Removed tab styles
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
  // Removed report styles
};

export default AdminDashboard;