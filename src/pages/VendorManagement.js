import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [editingVendorName, setEditingVendorName] = useState('');
  const [editingVendorContact, setEditingVendorContact] = useState('');

  useEffect(() => {
    const vendorsRef = ref(rtdb, 'vendors');
    const unsubscribe = onValue(vendorsRef, (snapshot) => {
      const fetchedVendors = [];
      snapshot.forEach((childSnapshot) => {
        fetchedVendors.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setVendors(fetchedVendors);
    });

    return () => unsubscribe();
  }, []);

  const handleAddVendor = () => {
    if (newVendorName.trim() === '' || newVendorContact.trim() === '') return;
    push(ref(rtdb, 'vendors'), {
      name: newVendorName,
      contact: newVendorContact,
    });
    setNewVendorName('');
    setNewVendorContact('');
  };

  const handleEditClick = (vendor) => {
    setEditingVendorId(vendor.id);
    setEditingVendorName(vendor.name);
    setEditingVendorContact(vendor.contact);
  };

  const handleSaveEdit = (id) => {
    update(ref(rtdb, `vendors/${id}`), {
      name: editingVendorName,
      contact: editingVendorContact,
    });
    setEditingVendorId(null);
    setEditingVendorName('');
    setEditingVendorContact('');
  };

  const handleDeleteVendor = (id) => {
    remove(ref(rtdb, `vendors/${id}`));
  };

  return (
    <div style={styles.container}>
      <h2>Vendor Management</h2>

      <div style={styles.addVendorSection}>
        <h3>Add New Vendor</h3>
        <input
          type="text"
          placeholder="Vendor Name"
          value={newVendorName}
          onChange={(e) => setNewVendorName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={newVendorContact}
          onChange={(e) => setNewVendorContact(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddVendor} style={styles.button}>Add Vendor</button>
      </div>

      <h3 style={styles.listHeading}>Existing Vendors</h3>
      <div style={styles.vendorList}>
        {vendors.length === 0 ? (
          <p>No vendors added yet.</p>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} style={styles.vendorCard}>
              {editingVendorId === vendor.id ? (
                <div style={styles.editForm}>
                  <input
                    type="text"
                    value={editingVendorName}
                    onChange={(e) => setEditingVendorName(e.target.value)}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editingVendorContact}
                    onChange={(e) => setEditingVendorContact(e.target.value)}
                    style={styles.input}
                  />
                  <button onClick={() => handleSaveEdit(vendor.id)} style={styles.saveButton}>Save</button>
                  <button onClick={() => setEditingVendorId(null)} style={styles.cancelButton}>Cancel</button>
                </div>
              ) : (
                <div>
                  <p><strong>ID:</strong> {vendor.id}</p>
                  <p><strong>Name:</strong> {vendor.name}</p>
                  <p><strong>Contact:</strong> {vendor.contact}</p>
                  <div style={styles.cardButtons}>
                    <button onClick={() => handleEditClick(vendor)} style={styles.editButton}>Edit</button>
                    <button onClick={() => handleDeleteVendor(vendor.id)} style={styles.deleteButton}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  addVendorSection: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  listHeading: {
    marginTop: '40px',
    marginBottom: '20px',
  },
  vendorList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  vendorCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  cardButtons: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 12px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  cancelButton: {
    padding: '8px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
  },
};

export default VendorManagement;