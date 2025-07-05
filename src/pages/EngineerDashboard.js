import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { useAuth } from '../AuthContext';

const EngineerDashboard = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      const requestsRef = ref(rtdb, 'requests');
      onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedRequests = [];
        for (const key in data) {
          const request = { id: key, ...data[key] };
          // Filter requests assigned to the current engineer
          if (request.technician_id === currentUser.uid) {
            loadedRequests.push(request);
          }
        }
        setRequests(loadedRequests);
      });
    }
  }, [currentUser]);

  const handleAddRecommendation = async (requestId) => {
    if (!recommendation.trim()) {
      setMessage('Recommendation cannot be empty.');
      return;
    }

    try {
      await update(ref(rtdb, `requests/${requestId}`), {
        recommendation: recommendation.trim(),
        status: 'Recommended', // Update status to Recommended
      });
      setMessage('Recommendation added successfully!');
      setRecommendation('');
      setSelectedRequestId(null); // Close the recommendation form
    } catch (error) {
      console.error('Error adding recommendation: ', error);
      setMessage('Error adding recommendation: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Engineer Dashboard</h2>
      {message && <p style={styles.message}>{message}</p>}
      <div style={styles.requestsGrid}>
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} style={styles.requestCard}>
              <h3 style={styles.cardTitle}>Request ID: {request.id}</h3>
              <p><strong>Device Type:</strong> {request.deviceType}</p>
              <p><strong>Problem:</strong> {request.problemDescription}</p>
              <p><strong>Status:</strong> {request.status}</p>
              {request.recommendation && <p><strong>Recommendation:</strong> {request.recommendation}</p>}
              {selectedRequestId === request.id ? (
                <div style={styles.recommendationForm}>
                  <textarea
                    style={styles.textarea}
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Add your recommendation here..."
                    rows="4"
                  ></textarea>
                  <button style={styles.button} onClick={() => handleAddRecommendation(request.id)}>Submit Recommendation</button>
                  <button style={styles.cancelButton} onClick={() => setSelectedRequestId(null)}>Cancel</button>
                </div>
              ) : (
                <button style={styles.button} onClick={() => setSelectedRequestId(request.id)}>Add Recommendation</button>
              )}
            </div>
          ))
        ) : (
          <p>No requests assigned to you.</p>
        )}
      </div>
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
};

export default EngineerDashboard;