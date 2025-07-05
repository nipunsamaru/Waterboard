import React, { useState } from 'react';
import { rtdb } from '../firebase';
import { ref, push } from 'firebase/database';
import { useAuth } from '../AuthContext';
import './RequestForm.css';

const RequestForm = ({ onFormSubmit }) => {
  const { currentUser } = useAuth();
  const [deviceType, setDeviceType] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage('You must be logged in to submit a request.');
      return;
    }

    try {
      await push(ref(rtdb, 'requests'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        deviceType,
        problemDescription,
        imageUrl: image ? 'placeholder_for_image_url' : null, // Placeholder for image upload logic
        status: 'Pending',
        priority: 'Low', // Default priority
        createdAt: new Date().toISOString(),
        device_id: deviceId,
        technician_id: null, // Will be assigned later
        vendor_id: null, // Will be assigned later
      });
      setMessage('Request submitted successfully!');
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