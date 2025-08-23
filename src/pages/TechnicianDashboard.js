import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { useAuth } from '../AuthContext';
import { update } from 'firebase/database';
import PartsRequestForm from '../components/PartsRequestForm';

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'in_progress', 'completed'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inProgressRequests, setInProgressRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [partsRequests, setPartsRequests] = useState([]); // New state for parts requests
  const [showPartsForm, setShowPartsForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
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

  // Function to get processed parts requests for a specific repair request
  const getProcessedPartsForRequest = (requestId) => {
    return partsRequests.filter(part => 
      part.requestId === requestId && part.status === 'processed'
    );
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

      // Fetch parts requests
      const partsRequestsRef = ref(rtdb, 'partsRequests');
      const unsubscribeParts = onValue(partsRequestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const allPartsRequests = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          // Filter parts requests for this technician
          const technicianPartsRequests = allPartsRequests.filter(part => 
            part.technicianEmail === technicianEmail
          );
          
          setPartsRequests(technicianPartsRequests);
        } else {
          setPartsRequests([]);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeParts();
      };
    }
  }, [currentUser]);

  const handleRequestParts = (requestId) => {
    setSelectedRequestId(requestId);
    setShowPartsForm(true);
  };

  const handleClosePartsForm = () => {
    setShowPartsForm(false);
    setSelectedRequestId(null);
  };

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
              pendingRequests.map(request => {
                const processedParts = getProcessedPartsForRequest(request.id);
                return (
                  <div key={request.id} style={styles.requestCard}>
                    <p><strong>Problem:</strong> {request.problemDescription}</p>
                    <p><strong>Device Type:</strong> {request.deviceType}</p>
                    <p><strong>Device ID:</strong> {request.device_id}</p>
                    <p><strong>Priority:</strong> {request.priority}</p>
                    {request.recommendation && <p><strong>Recommendation:</strong> {request.recommendation}</p>}
                    <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                    
                    {/* Show processed parts requests */}
                    {processedParts.length > 0 && (
                      <div style={styles.partsSection}>
                        <h4 style={styles.partsSectionTitle}>Processed Parts Requests:</h4>
                        {processedParts.map(part => (
                          <div key={part.id} style={styles.partCard}>
                            <p><strong>Request ID:</strong> {part.requestId}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                              {part.items.map((item, index) => (
                                <li key={index}>
                                  {item.name} - Quantity: {item.quantity}
                                </li>
                              ))}
                            </ul>
                            <p><strong>Status:</strong> <span style={styles.processedStatus}>Processed</span></p>
                            <p><strong>Processed At:</strong> {new Date(part.processedAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      style={styles.actionButton}
                      onClick={() => handleUpdateStatus(request.id, 'In Progress')}
                    >
                      Start Work
                    </button>
                  </div>
                );
              })
            ) : (
              <p>No pending requests.</p>
            )}
          </div>
        )}

        {activeTab === 'in_progress' && (
          <div>
            <h3>In Progress Requests</h3>
            {inProgressRequests.length > 0 ? (
              inProgressRequests.map(request => {
                const processedParts = getProcessedPartsForRequest(request.id);
                return (
                  <div key={request.id} style={styles.requestCard}>
                    <p><strong>Problem:</strong> {request.problemDescription}</p>
                    <p><strong>Device Type:</strong> {request.deviceType}</p>
                    <p><strong>Device ID:</strong> {request.device_id}</p>
                    <p><strong>Priority:</strong> {request.priority}</p>
                    <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                    {request.recommendation && <p><strong>Recommendation:</strong> {request.recommendation}</p>}
                    
                    {/* Show processed parts requests */}
                    {processedParts.length > 0 && (
                      <div style={styles.partsSection}>
                        <h4 style={styles.partsSectionTitle}>Processed Parts Requests:</h4>
                        {processedParts.map(part => (
                          <div key={part.id} style={styles.partCard}>
                            <p><strong>Request ID:</strong> {part.requestId}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                              {part.items.map((item, index) => (
                                <li key={index}>
                                  {item.name} - Quantity: {item.quantity}
                                </li>
                              ))}
                            </ul>
                            <p><strong>Status:</strong> <span style={styles.processedStatus}>Processed</span></p>
                            <p><strong>Processed At:</strong> {new Date(part.processedAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={styles.buttonGroup}>
                      <button
                        style={styles.partsButton}
                        onClick={() => handleRequestParts(request.id)}
                      >
                        Request Parts
                      </button>
                      <button
                        style={styles.actionButton}
                        onClick={() => handleUpdateStatus(request.id, 'Completed')}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No in progress requests.</p>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h3>Completed Requests</h3>
            {completedRequests.length > 0 ? (
              completedRequests.map(request => {
                const processedParts = getProcessedPartsForRequest(request.id);
                return (
                  <div key={request.id} style={styles.requestCard}>
                    <p><strong>Problem:</strong> {request.problemDescription}</p>
                    <p><strong>Device Type:</strong> {request.deviceType}</p>
                    <p><strong>Device ID:</strong> {request.device_id}</p>
                    <p><strong>Priority:</strong> {request.priority}</p>
                    
                    {/* Show processed parts requests */}
                    {processedParts.length > 0 && (
                      <div style={styles.partsSection}>
                        <h4 style={styles.partsSectionTitle}>Processed Parts Requests:</h4>
                        {processedParts.map(part => (
                          <div key={part.id} style={styles.partCard}>
                            <p><strong>Request ID:</strong> {part.requestId}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                              {part.items.map((item, index) => (
                                <li key={index}>
                                  {item.name} - Quantity: {item.quantity}
                                </li>
                              ))}
                            </ul>
                            <p><strong>Status:</strong> <span style={styles.processedStatus}>Processed</span></p>
                            <p><strong>Processed At:</strong> {new Date(part.processedAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No completed requests.</p>
            )}
          </div>
        )}
      </div>

      {showPartsForm && (
        <PartsRequestForm
          requestId={selectedRequestId}
          onClose={handleClosePartsForm}
          onSubmit={handleClosePartsForm}
        />
      )}
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
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  partsButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  // New styles for parts requests display
  partsSection: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#e8f5e8',
    borderRadius: '5px',
    border: '1px solid #c3e6c3'
  },
  partsSectionTitle: {
    margin: '0 0 10px 0',
    color: '#2d5a2d',
    fontSize: '16px'
  },
  partCard: {
    backgroundColor: '#f0f8f0',
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '4px',
    border: '1px solid #d4edda'
  },
  processedStatus: {
    color: '#28a745',
    fontWeight: 'bold'
  }
};

export default TechnicianDashboard;