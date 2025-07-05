import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../AuthContext';
import './EditRequestForm.css';

const EditRequestForm = ({ request, onFormSubmit, onCancelEdit }) => {
  const { userRole } = useAuth();
  const [deviceType, setDeviceType] = useState(request.deviceType || '');
  const [problemDescription, setProblemDescription] = useState(request.problemDescription || '');
  const [status, setStatus] = useState(request.status || 'Pending');
  const [priority, setPriority] = useState(request.priority || 'Medium');
  const [technician, setTechnician] = useState(request.technician || '');
  const [technicians, setTechnicians] = useState([]);
  const [vendor, setVendor] = useState(request.vendor || '');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (request) {
      setDeviceType(request.deviceType || '');
      setProblemDescription(request.problemDescription || '');
      setStatus(request.status || 'Pending');
      setPriority(request.priority || 'Medium');
      setTechnician(request.technician || '');
      setVendor(request.vendor || '');
    }

    const techniciansQuery = query(ref(rtdb, 'users'), orderByChild('role'), equalTo('technician'));
    const unsubscribe = onValue(techniciansQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const technicianList = Object.values(data).map(user => user.email);
        setTechnicians(technicianList);
      } else {
        setTechnicians([]);
      }
    });

    const vendorsRef = ref(rtdb, 'vendors');
    const unsubscribeVendors = onValue(vendorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vendorList = Object.values(data).map(vendor => vendor.name);
        setVendors(vendorList);
      } else {
        setVendors([]);
      }
    });

    return () => { 
      unsubscribe();
      unsubscribeVendors();
    };
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestRef = ref(rtdb, `requests/${request.id}`);
      await update(requestRef, {
        deviceType,
        problemDescription,
        status,
        priority,
        technician,
        vendor,
        updatedAt: new Date(),
      });
      onFormSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-request-container">
      <h3 className="edit-request-title">Edit Request: {request.id}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="deviceType">Device Type:</label>
          <input
            id="deviceType"
            type="text"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            required
            className="form-control"
            disabled={userRole === 'admin'}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="problemDescription">Problem Description:</label>
          <textarea
            id="problemDescription"
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            required
            className="form-control"
            disabled={userRole === 'admin'}
            rows="5"
          ></textarea>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="status">Status:</label>
          <select 
            id="status"
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="form-control" 
            disabled={userRole !== 'admin'}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="priority">Priority:</label>
          <select 
            id="priority"
            value={priority} 
            onChange={(e) => setPriority(e.target.value)} 
            className="form-control" 
            disabled={userRole !== 'admin'}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="technician">Technician:</label>
          <select
            id="technician"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="form-control"
            disabled={userRole !== 'admin'}
          >
            <option value="">Select Technician</option>
            {technicians.map((techEmail) => (
              <option key={techEmail} value={techEmail}>
                {techEmail}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="vendor">Vendor:</label>
          <select
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="form-control"
            disabled={userRole !== 'admin'}
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendorEmail) => (
              <option key={vendorEmail} value={vendorEmail}>
                {vendorEmail}
              </option>
            ))}
          </select>
        </div>
        <div className="d-grid">
          <button type="submit" disabled={loading} className="update-button">
            {loading ? 'Updating...' : 'Update Request'}
          </button>
          <button type="button" onClick={onCancelEdit} className="cancel-edit-button">
            Cancel Edit
          </button>
        </div>
        {error && <p className="message error">Error: {error}</p>}
      </form>
    </div>
  );
};



export default EditRequestForm;