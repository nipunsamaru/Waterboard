import React, { useEffect, useState } from 'react';
import { rtdb } from '../firebase';
import { ref, get, child, update, remove } from 'firebase/database';
import { useAuth } from '../AuthContext';
import AddUserForm from '../components/AddUserForm';
import { getAuth, deleteUser as firebaseDeleteUser } from "firebase/auth";

const UsersByRolePage = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddUserForm, setShowAddUserForm] = useState(null);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const availableRoles = ['user', 'admin', 'manager', 'engineer', 'technician'];

  const fetchUsers = async () => {
    try {
      const usersRef = ref(rtdb, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const groupedUsers = {};
        let countAll = 0;
        const counts = {};

        for (const uid in usersData) {
          const user = usersData[uid];
          if (user.role) {
            if (!groupedUsers[user.role]) {
              groupedUsers[user.role] = [];
            }
            groupedUsers[user.role].push({ uid, ...user });
            countAll++;
            counts[user.role] = (counts[user.role] || 0) + 1;
          }
        }
        setUsers(groupedUsers);
        setTotalUsersCount(countAll);
        setRoleCounts(counts);
      } else {
        setUsers({});
        setTotalUsersCount(0);
        setRoleCounts({});
      }
    } catch (err) {
      console.error("Error fetching users: ", err);
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole, selectedRole) => {
    if (selectedRole === currentRole) {
      setEditingUser(null);
      return;
    }

    try {
      await update(ref(rtdb, `users/${userId}`), {
        role: selectedRole
      });
      
      alert(`User role updated to ${selectedRole} successfully!`);
      setEditingUser(null);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      try {
        // Delete from Realtime Database
        await remove(ref(rtdb, `users/${userId}`));

        // Delete from Firebase Authentication (requires admin SDK or callable function)
        // For client-side, this is generally handled by a backend function.
        // If you are running this in a client-side context, direct deletion of other users
        // from Firebase Auth is not possible without re-authentication of the *current* user
        // or using a Cloud Function/Admin SDK.
        // For demonstration, we'll assume a mechanism (like a Cloud Function) handles Auth deletion.
        // If this were a real app, you'd trigger a Cloud Function here.
        alert(`User ${userEmail} deleted successfully! (Auth deletion might require backend)`);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('Access Denied: Only administrators can view this page.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [userRole]);

  const roles = Object.keys(users).sort();

  if (loading) {
    return <div style={styles.container}><p>Loading users...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><p style={styles.errorMessage}>{error}</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Management - Assign Roles</h2>

      <div style={styles.summaryContainer}>
        <div style={styles.summaryBox}>
          <p style={styles.summaryLabel}>Total Users:</p>
          <p style={styles.summaryValue}>{totalUsersCount}</p>
        </div>
        {roles.map(role => (
          <div key={role} style={styles.summaryBox}>
            <p style={styles.summaryLabel}>{role.charAt(0).toUpperCase() + role.slice(1)}s:</p>
            <p style={styles.summaryValue}>{roleCounts[role] || 0}</p>
            <button
              style={styles.addButton}
              onClick={() => setShowAddUserForm(showAddUserForm === role ? null : role)}
            >
              {showAddUserForm === role ? `Hide Add ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.tabsContainer}>
        <button
          style={activeTab === 'all' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('all')}
        >
          All Users ({totalUsersCount})
        </button>
        {roles.map(role => (
          <button
            key={role}
            style={activeTab === role ? styles.activeTabButton : styles.tabButton}
            onClick={() => setActiveTab(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}s ({roleCounts[role] || 0})
          </button>
        ))}
      </div>

      {Object.keys(users).length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={styles.userListContainer}>
          {activeTab === 'all' ? (
            roles.map(role => (
              <div key={role} style={styles.roleSection}>
                <h3 style={styles.roleTitle}>{role.charAt(0).toUpperCase() + role.slice(1)}s</h3>
                {showAddUserForm === role && (
                  <AddUserForm roleToAdd={role} onUserAdded={fetchUsers} />
                )}
                <ul style={styles.userList}>
                  {users[role].map(user => (
                    <li key={user.uid} style={styles.userItem}>
                      <div style={styles.userInfo}>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Current Role:</strong> {user.role}</p>
                        <p><strong>UID:</strong> {user.uid}</p>
                      </div>
                      <div style={styles.userActions}>
                        {editingUser === user.uid ? (
                          <div style={styles.roleEditContainer}>
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              style={styles.roleSelect}
                            >
                              <option value="">Select Role</option>
                              {availableRoles.map(roleOption => (
                                <option key={roleOption} value={roleOption}>
                                  {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleChange(user.uid, user.role, newRole)}
                              style={styles.saveButton}
                              disabled={!newRole}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              style={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user.uid);
                                setNewRole(user.role);
                              }}
                              style={styles.editButton}
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.uid, user.email)}
                              style={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div style={styles.roleSection}>
              <h3 style={styles.roleTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s</h3>
              {showAddUserForm === activeTab && (
                <AddUserForm roleToAdd={activeTab} onUserAdded={fetchUsers} />
              )}
              <ul style={styles.userList}>
                {users[activeTab].map(user => (
                  <li key={user.uid} style={styles.userItem}>
                    <div style={styles.userInfo}>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Current Role:</strong> {user.role}</p>
                      <p><strong>UID:</strong> {user.uid}</p>
                    </div>
                    <div style={styles.userActions}>
                      {editingUser === user.uid ? (
                        <div style={styles.roleEditContainer}>
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            style={styles.roleSelect}
                          >
                            <option value="">Select Role</option>
                            {availableRoles.map(roleOption => (
                              <option key={roleOption} value={roleOption}>
                                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRoleChange(user.uid, user.role, newRole)}
                            style={styles.saveButton}
                            disabled={!newRole}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user.uid);
                              setNewRole(user.role);
                            }}
                            style={styles.editButton}
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid, user.email)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Fixed: Changed from 'newStyles' to 'styles' and added missing style properties
const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '25px',
    fontSize: '2.2em',
    fontWeight: '600',
  },
  summaryContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: '30px',
    backgroundColor: '#e9ecef',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  summaryBox: {
    textAlign: 'center',
    margin: '10px',
    padding: '15px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    minWidth: '150px',
  },
  summaryLabel: {
    fontSize: '0.9em',
    color: '#555',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: '1.8em',
    color: '#007bff',
    fontWeight: 'bold',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '5px',
    overflowX: 'auto',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 12px',
    marginTop: '10px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.2s ease-in-out',
  },
  tabButton: {
    padding: '12px 20px',
    margin: '0 5px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1.05em',
    fontWeight: '500',
    color: '#495057',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
  },
  activeTabButton: {
    padding: '12px 20px',
    margin: '0 5px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1.05em',
    fontWeight: '600',
    color: '#007bff',
    borderBottom: '3px solid #007bff',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
  },
  userListContainer: {
    marginTop: '20px',
  },
  roleSection: {
    marginBottom: '20px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  roleTitle: {
    color: '#343a40',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontSize: '1.6em',
    fontWeight: '600',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
  },
  userItem: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '12px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.03)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userActions: {
    marginLeft: '20px',
  },
  roleEditContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  roleSelect: {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.1em',
    padding: '20px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
  },
};

export default UsersByRolePage;