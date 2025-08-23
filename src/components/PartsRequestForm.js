import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { rtdb } from '../firebase';
import { useAuth } from '../AuthContext';

const PartsRequestForm = ({ requestId, onClose, onSubmit }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([{ name: '', amount: '', description: '' }]);
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', amount: '', description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const partsRequestData = {
        requestId,
        technicianEmail: currentUser.email,
        technicianName: currentUser.displayName || currentUser.email,
        items: items.filter(item => item.name.trim() !== '' && item.amount.trim() !== ''),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const partsRequestsRef = ref(rtdb, 'partsRequests');
      await push(partsRequestsRef, partsRequestData);

      alert('Parts request submitted successfully!');
      onSubmit && onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting parts request:', error);
      alert('Error submitting parts request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>Request Repair Parts</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.itemsSection}>
            <div style={styles.itemsSectionHeader}>
              <h4>Required Items</h4>
              <button type="button" onClick={addItem} style={styles.addButton}>
                Add Item
              </button>
            </div>
            
            <div style={styles.itemsHeader}>
              <span style={styles.itemHeaderItem}>Item Name</span>
              <span style={styles.itemHeaderItem}>Amount/Quantity</span>
              <span style={styles.itemHeaderItem}>Description (Optional)</span>
              <span style={styles.itemHeaderItem}>Action</span>
            </div>

            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  style={styles.itemInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Amount/Quantity"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  style={styles.itemInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  style={styles.itemInput}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={styles.removeButton}
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  form: {
    padding: '20px'
  },
  itemsSection: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px'
  },
  itemsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  itemsHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 2fr 100px',
    gap: '10px',
    marginBottom: '10px',
    fontWeight: 'bold',
    color: '#666',
    padding: '8px 0',
    borderBottom: '1px solid #eee'
  },
  itemHeaderItem: {
    padding: '8px'
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 2fr 100px',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center'
  },
  itemInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  removeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default PartsRequestForm;