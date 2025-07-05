import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { useAuth } from '../AuthContext';
import { update } from 'firebase/database';

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'in_progress', 'completed'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inProgressRequests, setInProgressRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const { currentUser } = useAuth();

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const requestRef = ref(rtdb, `requests/${requestId}`);
      await update(requestRef, { status: newStatus, updatedAt: new Date().toISOString() });
      console.log(`Request ${requestId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.email) {
      const technicianEmail = currentUser.email;
      const requestsRef = ref(rtdb, 'requests');
      
      const unsubscribe = onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const allRequests = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          const filteredRequests = allRequests.filter(req => req.technician === technicianEmail);

          setPendingRequests(filteredRequests.filter(req => req.status === 'Pending'));
          setInProgressRequests(filteredRequests.filter(req => req.status === 'In Progress'));
          setCompletedRequests(filteredRequests.filter(req => req.status === 'Completed'));
        } else {
          setPendingRequests([]);
          setInProgressRequests([]);
          setCompletedRequests([]);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  return (
    <div style={styles.container}>
      <h2>Technician Panel</h2>

      <div style={styles.tabsContainer}>
        <button
          style={activeTab === 'pending' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('pending')}
        >
          Pending Request
        </button>
        <button
          style={activeTab === 'in_progress' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('in_progress')}
        >
          In Progress
        </button>
        <button
          style={activeTab === 'completed' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div style={styles.contentContainer}>
        {activeTab === 'pending' && (
          <div>
            <h3>Pending Requests</h3>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} style={styles.requestCard}>
                  <p><strong>Problem:</strong> {request.problemDescription}</p>
                  <p><strong>Device Type:</strong> {request.deviceType}</p>
                  <p><strong>Device ID:</strong> {request.device_id}</p>
                  <p><strong>Priority:</strong> {request.priority}</p>
                  <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleUpdateStatus(request.id, 'In Progress')}
                  >
                    Start Work
                  </button>
                </div>
              ))
            ) : (
              <p>No pending requests.</p>
            )}
          </div>
        )}

        {activeTab === 'in_progress' && (
          <div>
            <h3>In Progress Requests</h3>
            {inProgressRequests.length > 0 ? (
              inProgressRequests.map(request => (
                <div key={request.id} style={styles.requestCard}>
                  <p><strong>Problem:</strong> {request.problemDescription}</p>
                  <p><strong>Device Type:</strong> {request.deviceType}</p>
                  <p><strong>Device ID:</strong> {request.device_id}</p>
                  <p><strong>Priority:</strong> {request.priority}</p>
                  <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleUpdateStatus(request.id, 'Completed')}
                  >
                    Mark as Completed
                  </button>
                </div>
              ))
            ) : (
              <p>No in progress requests.</p>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h3>Completed Requests</h3>
            {completedRequests.length > 0 ? (
              completedRequests.map(request => (
                <div key={request.id} style={styles.requestCard}>
                  <p><strong>Problem:</strong> {request.problemDescription}</p>
                  <p><strong>Device Type:</strong> {request.deviceType}</p>
                  <p><strong>Device ID:</strong> {request.device_id}</p>
                  <p><strong>Priority:</strong> {request.priority}</p>
                </div>
              ))
            ) : (
              <p>No completed requests.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '20px auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  tabsContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  tabButton: {
    padding: '10px 15px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    outline: 'none',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  activeTabButton: {
    padding: '10px 15px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    outline: 'none',
    borderBottom: '2px solid #007bff',
    color: '#007bff',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: '10px',
  },
  requestCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
  },
  actionButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  }
};

export default TechnicianDashboard;