import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, rtdb as database } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    },
    form: {
      width: '100%',
      maxWidth: '400px',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
      fontSize: '28px',
      fontWeight: 'bold',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#555',
      textAlign: 'left',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ced4da',
      borderRadius: '5px',
      fontSize: '16px',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
    },
    link: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '15px',
    },
    linkText: {
      color: '#007bff',
      textDecoration: 'none',
      fontWeight: '500',
    },
    errorMessage: {
      color: '#dc3545',
      textAlign: 'center',
      marginBottom: '15px',
      fontSize: '14px',
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userRole = userData.role;

        // Redirect based on role
        switch (userRole) {
          case 'Admin':
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'Manager':
          case 'manager':
            navigate('/manager-dashboard');
            break;
          case 'Technician':
          case 'technician':
            navigate('/technician-dashboard');
            break;
          case 'Engineer':
          case 'engineer':
            navigate('/engineer-dashboard');
            break;
          case 'User':
          case 'user':
            navigate('/user-dashboard');
            break;
          default:
            navigate('/'); // Fallback for undefined roles
        }
      } else {
        setError('User data not found.');
      }
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-disabled':
          setError('Your account has been disabled.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password.');
          break;
        default:
          setError('Failed to login. Please check your credentials.');
          break;
      }
    }
  };

  return (
    <div style={styles.container}>
      <form style={{...styles.form, gap: '10px'}} onSubmit={handleLogin}>
        <h3 style={{...styles.title, marginBottom: '15px'}}>Login</h3>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          Login
        </button>

        <p style={styles.link}>
          Don't have an account? <Link to="/signup" style={styles.linkText}>Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;