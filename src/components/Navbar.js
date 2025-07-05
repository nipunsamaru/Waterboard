import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../AuthContext';

import '../App.css';

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarBrand}>
        <Link to="/" style={styles.navbarBrandLink}>Online Repair System</Link>
      </div>
      <div style={styles.navbarNav}>
        {currentUser ? (
          <>
            <button style={styles.navButton} onClick={() => navigate(`/${userRole}-dashboard`)}>Home</button>
            {userRole === 'admin' && (
              <button style={styles.navButton} onClick={() => navigate('/admin/users-by-role')}>Users</button>
            )}
            {userRole === 'admin' && (
              <button style={styles.navButton} onClick={() => navigate('/admin/all-requests')}>Requests</button>
            )}
            
            {userRole === 'admin' && (
              <button style={styles.navButton} onClick={() => navigate('/admin/reports')}>Reports</button>
            )}
            {userRole === 'admin' && (
              <button style={styles.navButton} onClick={() => navigate('/admin/vendor-management')}>Vendor</button>
            )}
            
            <button onClick={handleSignOut} style={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/signup" style={styles.navLink}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#0000FF',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  navbarBrand: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  navbarBrandLink: {
    color: '#fff',
    textDecoration: 'none',
  },
  navbarNav: {
    display: 'flex',
    gap: '10px',
  },
  navButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '17px',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '17px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
};

export default Navbar;