import React, { useState } from 'react';
import { rtdb } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { useAuth } from '../AuthContext';
import './RequestForm.css';

const RequestForm = ({ onFormSubmit }) => {
  const { currentUser } = useAuth();
  const [deviceType, setDeviceType] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');

  // Function to generate user-friendly request ID
  const generateRequestId = (userEmail) => {
    const emailPrefix = userEmail.split('@')[0]; // Get part before @
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
    return `REQ-${emailPrefix}-${dateStr}-${timestamp.toString().slice(-6)}`; // Last 6 digits of timestamp
  };

  // Function to ensure unique request ID
  const generateUniqueRequestId = async (userEmail) => {
    let requestId = generateRequestId(userEmail);
    let counter = 1;
    
    // Check if ID already exists and increment if needed
    while (true) {
      const requestRef = ref(rtdb, `requests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) {
        return requestId;
      }
      
      // If ID exists, add counter suffix
      const baseId = generateRequestId(userEmail);
      requestId = `${baseId}-${counter.toString().padStart(2, '0')}`;
      counter++;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage('You must be logged in to submit a request.');
      return;
    }

    try {
      // Generate unique user-friendly request ID
      const customRequestId = await generateUniqueRequestId(currentUser.email);
      
      // Use set() with custom ID instead of push()
      await set(ref(rtdb, `requests/${customRequestId}`), {
        requestId: customRequestId, // Store the custom ID in the data as well
        userId: currentUser.uid,
        userEmail: currentUser.email,
        deviceType,
        problemDescription,
        imageUrl: image ? 'placeholder_for_image_url' : null,
        status: 'Pending',
        priority: 'Low',
        createdAt: new Date().toISOString(),
        device_id: deviceId,
        technician_id: null,
        vendor_id: null,
      });
      
      setMessage(`Request submitted successfully! Request ID: ${customRequestId}`);
      setDeviceType('');
      setProblemDescription('');
      setImage(null);
      setDeviceId('');
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage('Error submitting request: ' + error.message);
    }
  };

  return (
    <div className="request-form-container">
      <form onSubmit={handleSubmit}>
            <h3 className="request-form-title">Submit a Repair Request</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="deviceType">Device Type:</label>
              <select
                id="deviceType"
                className="form-control"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                required
              >
                <option value="">Select Device Type</option>
                <option value="PC">PC</option>
                <option value="Laptop">Laptop</option>
                <option value="Printer">Printer</option>
                <option value="Photocopier">Photocopier</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="deviceId">Device ID:</label>
              <input
                type="text"
                id="deviceId"
                className="form-control"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="problemDescription">Problem Description:</label>
              <textarea
                id="problemDescription"
                className="form-control"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="image">Attach Image (Optional):</label>
              <input
                type="file"
                id="image"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="submit-button">
                Submit Request
              </button>
            </div>
            {message && <p className="message">{message}</p>}
          </form>
        </div>
  );
};

export default RequestForm;