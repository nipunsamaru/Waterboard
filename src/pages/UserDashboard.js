import React, { useEffect, useState } from 'react';
import { rtdb } from '../firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const requestsRef = ref(rtdb, 'requests');
    const q = query(
      requestsRef,
      orderByChild('userId'),
      equalTo(currentUser.uid)
    );

    const unsubscribe = onValue(q, (snapshot) => {
      const fetchedRequests = [];
      snapshot.forEach((childSnapshot) => {
        fetchedRequests.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setRequests(fetchedRequests.filter(req => req.userId === currentUser.uid).reverse()); // Filter by userId and then reverse for createdAt desc order
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return <div className="UserDashboard-container">Loading requests...</div>;
  }

  if (error) {
    return <div className="UserDashboard-container">Error: {error}</div>;
  }

  // Group requests by status
  const groupedRequests = requests.reduce((acc, request) => {
    const status = request.status || 'Pending';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {});

  // Define status order for display
  const statusOrder = ['Pending', 'In Progress', 'Completed', 'Rejected'];

  return (
    <div className="UserDashboard-container" style={styles.container}>
      <div style={styles.headerContainer}>
        <h2>My Repair Requests</h2>
        <button style={styles.createButton} onClick={() => navigate('/request-form')}>Create New Request</button>
      </div>

      {requests.length === 0 ? (
        <p style={styles.noRequests}>No repair requests submitted yet.</p>
      ) : (
        <div style={styles.statusSections}>
          {statusOrder.map(status => {
            const statusRequests = groupedRequests[status] || [];
            if (statusRequests.length === 0) return null;

            return (
              <div key={status} style={styles.statusSection}>
                <h3 style={styles.statusTitle}>
                  {status} ({statusRequests.length})
                  <div style={{
                    ...styles.statusIndicator,
                    backgroundColor: status === 'Completed' ? '#4CAF50' :
                                   status === 'In Progress' ? '#2196F3' :
                                   status === 'Rejected' ? '#f44336' : '#FF9800'
                  }} />
                </h3>
                <div style={styles.requestsList}>
                  {statusRequests.map((request) => (
                    <div key={request.id} style={styles.requestCard}>
                      <div style={styles.requestHeader}>
                        <h4 style={styles.requestId}>Request ID: {request.id}</h4>
                        <span style={styles.date}>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={styles.requestDetails}>
                        <p><strong>Device:</strong> {request.deviceType}</p>
                        <p><strong>Problem:</strong> {request.problemDescription}</p>
                        {request.technician && <p><strong>Technician:</strong> {request.technician}</p>}
                        {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '0 20px',
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  noRequests: {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    margin: '40px 0',
  },
  statusSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  statusSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
  },
  statusTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginLeft: '8px',
  },
  requestsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  requestCard: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  requestId: {
    margin: '0',
    fontSize: '16px',
    color: '#007bff',
  },
  date: {
    color: '#666',
    fontSize: '14px',
  },
  requestDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }
};

export default UserDashboard;