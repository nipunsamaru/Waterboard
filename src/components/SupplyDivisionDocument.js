import React, { useState } from 'react';

const SupplyDivisionDocument = ({ partsRequest, onClose }) => {
  const [documentData, setDocumentData] = useState({
    deviceNo: '',
    quotationTenderNo: '',
    purchaseOrderNo: '',
    grnNo: '',
    items: partsRequest?.items || []
  });

  const handleInputChange = (field, value) => {
    setDocumentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    return documentData.items.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...documentData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setDocumentData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Supply Division Status Document</h2>
          <div style={styles.headerButtons}>
            <button style={styles.printButton} onClick={handlePrint}>
              Print Document
            </button>
            <button style={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div style={styles.documentContent} id="printable-document">
          <div style={styles.documentHeader}>
            <h1 style={styles.documentTitle}>Supply Division Status</h1>
          </div>

          <div style={styles.formSection}>
            <div style={styles.formRow}>
              <label style={styles.label}>• Device No</label>
              <input
                type="text"
                style={styles.input}
                value={documentData.deviceNo}
                onChange={(e) => handleInputChange('deviceNo', e.target.value)}
                placeholder="Enter device number"
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>• Quotation/Tender No</label>
              <input
                type="text"
                style={styles.input}
                value={documentData.quotationTenderNo}
                onChange={(e) => handleInputChange('quotationTenderNo', e.target.value)}
                placeholder="Enter quotation/tender number"
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>• Purchase Order No</label>
              <input
                type="text"
                style={styles.input}
                value={documentData.purchaseOrderNo}
                onChange={(e) => handleInputChange('purchaseOrderNo', e.target.value)}
                placeholder="Enter purchase order number"
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>• GRN No</label>
              <input
                type="text"
                style={styles.input}
                value={documentData.grnNo}
                onChange={(e) => handleInputChange('grnNo', e.target.value)}
                placeholder="Enter GRN number"
              />
            </div>
          </div>

          <div style={styles.itemsSection}>
            <h3 style={styles.sectionTitle}>• Purchased Item Details</h3>
            
            <div style={styles.itemsHeader}>
              <div style={styles.headerCell}>Part Description</div>
              <div style={styles.headerCell}>Amount</div>
            </div>

            {documentData.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <div style={styles.itemCell}>
                  <input
                    type="text"
                    style={styles.itemInput}
                    value={item.name || ''}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Part description"
                  />
                  {item.description && (
                    <div style={styles.itemDescription}>
                      {item.description}
                    </div>
                  )}
                </div>
                <div style={styles.itemCell}>
                  <input
                    type="number"
                    style={styles.itemInput}
                    value={item.amount || ''}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    step="0.01"
                  />
                </div>
              </div>
            ))}

            <div style={styles.totalRow}>
              <div style={styles.totalLabel}>Total</div>
              <div style={styles.totalAmount}>{calculateTotal()}</div>
            </div>
          </div>

          <div style={styles.requestInfo}>
            <p><strong>Request ID:</strong> {partsRequest?.requestId || 'N/A'}</p>
            <p><strong>Technician:</strong> {partsRequest?.technicianEmail || 'N/A'}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
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
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  printButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  closeButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  documentContent: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6'
  },
  documentHeader: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #333',
    paddingBottom: '15px'
  },
  documentTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  formSection: {
    marginBottom: '30px'
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    gap: '15px'
  },
  label: {
    minWidth: '200px',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '2px solid #333',
    borderRadius: '0',
    fontSize: '16px',
    minHeight: '20px'
  },
  itemsSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  itemsHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '10px',
    marginBottom: '10px',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  headerCell: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #333',
    textAlign: 'center'
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '10px',
    marginBottom: '10px'
  },
  itemCell: {
    border: '2px solid #333',
    padding: '5px'
  },
  itemInput: {
    width: '100%',
    border: 'none',
    padding: '5px',
    fontSize: '14px',
    backgroundColor: 'transparent'
  },
  itemDescription: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '5px'
  },
  totalRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '10px',
    marginTop: '15px',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  totalLabel: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #333',
    textAlign: 'right'
  },
  totalAmount: {
    padding: '10px',
    border: '2px solid #333',
    textAlign: 'center',
    backgroundColor: '#fff3cd'
  },
  requestInfo: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '5px'
  }
};

// Print-specific styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-document, #printable-document * {
      visibility: visible;
    }
    #printable-document {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

// Add print styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

export default SupplyDivisionDocument;