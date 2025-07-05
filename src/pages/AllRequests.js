import React, { useEffect, useState, useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import RequestForm from '../components/RequestForm';
import EditRequestForm from '../components/EditRequestForm';

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false); // State to manage form visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [editingRequest, setEditingRequest] = useState(null); // State to hold the request being edited

  const fetchRequests = useCallback(() => {
    const requestsRef = ref(rtdb, 'requests');
    let q = requestsRef;

    if (searchTerm) {
      q = query(requestsRef, orderByChild('problemDescription'), equalTo(searchTerm));
    }

    q = query(q, orderByChild(sortKey));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      const fetchedRequests = [];
      for (let id in data) {
        fetchedRequests.push({ id, ...data[id] });
      }

      fetchedRequests.sort((a, b) => {
        if (sortKey === 'createdAt') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortKey === 'status' || sortKey === 'priority') {
          return a[sortKey].localeCompare(b[sortKey]);
        }
        return 0;
      });

      setRequests(fetchedRequests);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [searchTerm, sortKey, setRequests, setLoading, setError]);

  useEffect(() => {
    const unsubscribe = fetchRequests();
    return () => unsubscribe();
  }, [fetchRequests]);

  const handleEditClick = (request) => {
    setEditingRequest(request);
    setShowRequestForm(false); // Hide request form if open
  };

  const handleFormSubmit = () => {
    setShowRequestForm(false);
    setEditingRequest(null); // Clear editing request after submission
    fetchRequests(); // Refresh requests after form submission
  };

  if (loading) {
    return <div className="AllRequests-container">Loading requests...</div>;
  }

  if (error) {
    return <div className="AllRequests-container">Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>All Repair Requests</h2>
      <button onClick={() => setShowRequestForm(!showRequestForm)} style={styles.button}>
        {showRequestForm ? 'Hide Request Form' : 'Create New Request'}
      </button>

      {showRequestForm && (
        <div style={styles.formSection}>
          <RequestForm onFormSubmit={handleFormSubmit} />
        </div>
      )}

      {editingRequest && (
        <div style={styles.formSection}>
          <EditRequestForm request={editingRequest} onFormSubmit={handleFormSubmit} onCancelEdit={() => setEditingRequest(null)} />
        </div>
      )}

      <div style={styles.filterSortSection}>
        <input
          type="text"
          placeholder="Search by problem description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={styles.selectInput}>
          <option value="createdAt">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <p style={styles.noRequestsMessage}>No repair requests submitted yet.</p>
      ) : (
        <div style={styles.requestsList}>
          {requests.map((request) => (
            <div key={request.id} style={styles.requestCard}>
              <h3 style={styles.cardHeader}>Request ID: {request.id}</h3>
              <p><strong>Device Type:</strong> {request.deviceType}</p>
              <p><strong>Problem:</strong> {request.problemDescription}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p><strong>Priority:</strong> {request.priority}</p>
              <p><strong>Submitted On:</strong> {new Date(request.createdAt).toLocaleString()}</p>
              <button onClick={() => handleEditClick(request)} style={styles.button}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px',
    display: 'block',
    width: 'fit-content',
    margin: '0 auto 20px auto',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
    display: 'block',
    width: 'fit-content',
    margin: '0 auto',
  },
  formSection: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  filterSortSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  searchInput: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    flexGrow: 1,
    maxWidth: '400px',
  },
  selectInput: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
  },
  requestsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  requestCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    color: '#0056b3',
    marginBottom: '10px',
  },
  noRequestsMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
    padding: '20px',
  },
};

export default AllRequests;