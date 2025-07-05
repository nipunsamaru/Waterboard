import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { PieChart, Pie, Cell, BarChart, Bar, Rectangle, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const ManagerDashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRepairs, setCompletedRepairs] = useState(0);
  const [activeTechnicians, setActiveTechnicians] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

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
        

        
        const monthlyStats = {};
        const currentYear = new Date().getFullYear();
        
        requests.forEach(req => {
          if (req.dateSubmitted) {
            const date = new Date(req.dateSubmitted);
            if (date.getFullYear() === currentYear) {
              const month = date.getMonth();
              if (!monthlyStats[month]) {
                monthlyStats[month] = { month: month, total: 0, completed: 0 };
              }
              monthlyStats[month].total += 1;
              
              if (req.status === 'Completed') {
                monthlyStats[month].completed += 1;
              }
            }
          }
        });
        
        const monthlyDataArray = Object.values(monthlyStats).sort((a, b) => a.month - b.month);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthlyData = monthlyDataArray.map(item => ({
          ...item,
          name: monthNames[item.month]
        }));
        


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
  }, []);
  
  return (
    <div style={styles.container}>
      <h2 style={styles.dashboardTitle}>Manager Dashboard</h2>
      
      
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
};

export default ManagerDashboard;