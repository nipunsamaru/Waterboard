import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, update, push } from 'firebase/database';
import { useAuth } from '../AuthContext';

const EngineerDashboard = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRecommendations, setMyRecommendations] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [recommendation, setRecommendation] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'recommendations'

  useEffect(() => {
    if (currentUser) {
      // Fetch requests
      const requestsRef = ref(rtdb, 'requests');
      onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedRequests = [];
        for (const key in data) {
          const request = { id: key, ...data[key] };
          // Filter out completed requests
          if (request.status !== 'Completed') {
            loadedRequests.push(request);
          }
        }
        setRequests(loadedRequests);
      });

      // Fetch engineer's recommendations
      const recommendationsRef = ref(rtdb, 'recommendations');
      onValue(recommendationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const engineerRecommendations = Object.entries(data)
            .map(([id, rec]) => ({ id, ...rec }))
            .filter(rec => rec.engineerId === currentUser.uid)
            .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
          setMyRecommendations(engineerRecommendations);
        } else {
          setMyRecommendations([]);
        }
      });
    }
  }, [currentUser]);

  const handleAddRecommendation = async (requestId) => {
    if (!recommendation.trim()) {
      setMessage('Recommendation cannot be empty.');
      return;
    }

    try {
      // Get request details for the recommendation
      const requestRef = ref(rtdb, `requests/${requestId}`);
      const requestSnapshot = await new Promise((resolve) => {
        onValue(requestRef, resolve, { onlyOnce: true });
      });
      const requestData = requestSnapshot.val();

      // Create recommendation object with approval status
      const recommendationData = {
        recommendationText: recommendation.trim(),
        engineerEmail: currentUser.email,
        engineerId: currentUser.uid,
        engineerName: currentUser.displayName || currentUser.email,
        approvalStatus: 'pending',
        submittedAt: new Date().toISOString(),
        requestId: requestId,
        deviceType: requestData?.deviceType || 'Unknown',
        issueDescription: requestData?.problemDescription || 'No description'
      };

      // Save to recommendations collection for manager approval
      const recommendationsRef = ref(rtdb, 'recommendations');
      await push(recommendationsRef, recommendationData);

      // Also update the request with pending recommendation status
      await update(ref(rtdb, `requests/${requestId}`), {
        hasRecommendation: true,
        recommendationStatus: 'pending',
        lastUpdated: new Date().toISOString()
      });

      setMessage('Recommendation submitted for manager approval!');
      setRecommendation('');
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error adding recommendation: ', error);
      setMessage('Error adding recommendation: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'PENDING APPROVAL';
      case 'approved': return 'APPROVED';
      case 'rejected': return 'REJECTED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Engineer Dashboard</h2>
      {message && <p style={styles.message}>{message}</p>}
      
      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === 'requests' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('requests')}
        >
          Active Requests
        </button>
        <button 
          style={activeTab === 'recommendations' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('recommendations')}
        >
          My Recommendations ({myRecommendations.length})
        </button>
      </div>

      {activeTab === 'requests' ? (
        <>
          <div style={styles.sortContainer}>
            <label style={styles.sortLabel}>Sort by: </label>
            <select 
              style={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
              <option value="deviceType">Device Type</option>
            </select>
          </div>
          <div style={styles.requestsGrid}>
            {requests.length > 0 ? (
              [...requests]
                .sort((a, b) => {
                  if (sortBy === 'date') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                  } else if (sortBy === 'status') {
                    return a.status.localeCompare(b.status);
                  } else {
                    return a.deviceType.localeCompare(b.deviceType);
                  }
                })
                .map((request) => (
                <div key={request.id} style={styles.requestCard}>
                  <h3 style={styles.cardTitle}>Request ID: {request.id}</h3>
                  <p><strong>Device Type:</strong> {request.deviceType}</p>
                  <p><strong>Problem:</strong> {request.problemDescription}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                  
                  {/* Show recommendation status */}
                  {request.hasRecommendation && (
                    <div style={styles.recommendationStatus}>
                      <p><strong>Recommendation Status:</strong> 
                        <span style={{
                          color: getStatusColor(request.recommendationStatus),
                          fontWeight: 'bold',
                          marginLeft: '5px'
                        }}>
                          {getStatusText(request.recommendationStatus)}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {/* Show approved recommendation */}
                  {request.approvedRecommendation && (
                    <div style={styles.approvedRecommendation}>
                      <p><strong>Approved Recommendation:</strong> {request.approvedRecommendation}</p>
                    </div>
                  )}
                  
                  {selectedRequestId === request.id ? (
                    <div style={styles.recommendationForm}>
                      <textarea
                        style={styles.textarea}
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        placeholder="Add your recommendation here..."
                        rows="4"
                      ></textarea>
                      <button style={styles.button} onClick={() => handleAddRecommendation(request.id)}>Submit for Approval</button>
                      <button style={styles.cancelButton} onClick={() => setSelectedRequestId(null)}>Cancel</button>
                    </div>
                  ) : (
                    !request.hasRecommendation && (
                      <button style={styles.button} onClick={() => setSelectedRequestId(request.id)}>Add Recommendation</button>
                    )
                  )}
                </div>
              ))
            ) : (
              <p>No requests available.</p>
            )}
          </div>
        </>
      ) : (
        // My Recommendations Tab
        <div style={styles.recommendationsSection}>
          <h3>My Submitted Recommendations</h3>
          {myRecommendations.length > 0 ? (
            <div style={styles.recommendationsGrid}>
              {myRecommendations.map((rec) => (
                <div key={rec.id} style={styles.recommendationCard}>
                  <div style={styles.recommendationHeader}>
                    <h4 style={styles.recommendationTitle}>Request #{rec.requestId}</h4>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(rec.approvalStatus),
                      color: 'white'
                    }}>
                      {getStatusText(rec.approvalStatus)}
                    </span>
                  </div>
                  
                  <div style={styles.recommendationDetails}>
                    <p><strong>Device:</strong> {rec.deviceType}</p>
                    <p><strong>Issue:</strong> {rec.issueDescription}</p>
                    <p><strong>Submitted:</strong> {new Date(rec.submittedAt || rec.createdAt).toLocaleString()}</p>
                    
                    {rec.approvedAt && (
                      <p><strong>Approved:</strong> {new Date(rec.approvedAt).toLocaleString()}</p>
                    )}
                    
                    {rec.rejectedAt && (
                      <p><strong>Rejected:</strong> {new Date(rec.rejectedAt).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div style={styles.recommendationContent}>
                    <strong>My Recommendation:</strong>
                    <p style={styles.recommendationText}>{rec.recommendationText}</p>
                  </div>
                  
                  {rec.approvalStatus === 'rejected' && (
                    <div style={styles.rejectionNote}>
                      <strong>Note:</strong> This recommendation was rejected. You may submit a new one for this request.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noRecommendations}>
              <p>You haven't submitted any recommendations yet.</p>
              <p>Switch to the "Active Requests" tab to add recommendations to repair requests.</p>
            </div>
          )}
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
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  message: {
    textAlign: 'center',
    color: 'green',
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
  requestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  requestCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTitle: {
    marginBottom: '10px',
    color: '#007bff',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '15px',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  },
  recommendationForm: {
    marginTop: '15px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px',
    resize: 'vertical',
  },
  sortContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
    alignItems: 'center',
  },
  sortLabel: {
    marginRight: '10px',
    fontWeight: 'bold',
  },
  sortSelect: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  recommendationStatus: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    border: '1px solid #dee2e6'
  },
  approvedRecommendation: {
    backgroundColor: '#d4edda',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    border: '1px solid #c3e6cb'
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
  recommendationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  recommendationTitle: {
    color: '#007bff',
    margin: 0
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  recommendationDetails: {
    marginBottom: '15px',
    fontSize: '14px'
  },
  recommendationContent: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #e9ecef'
  },
  recommendationText: {
    fontStyle: 'italic',
    lineHeight: '1.5',
    margin: '10px 0 0 0'
  },
  rejectionNote: {
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '15px',
    border: '1px solid #f5c6cb',
    color: '#721c24'
  },
  noRecommendations: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '16px',
    marginTop: '40px',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  }
};

export default EngineerDashboard;