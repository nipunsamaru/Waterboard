import React, { useState } from 'react';
<<<<<<< HEAD
import { auth, rtdb } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role for new sign-ups
  const userRoles = ['user', 'manager', 'engineer', 'admin', 'technician'];

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
=======
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from '../firebase';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('User'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);
  const database = getDatabase(app);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Realtime Database
<<<<<<< HEAD
      await set(ref(rtdb, 'users/' + user.uid), {
        email: email,
        role: role,
      });

      navigate('/login'); // Redirect to login page on successful signup
    } catch (error) {
      setError(error.message);
    }
  };

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

  return (
    <div style={styles.container}>
      <form style={{...styles.form, gap: '10px'}} onSubmit={handleSignUp}>
        <h3 style={{...styles.title, marginBottom: '15px'}}>Sign Up</h3>
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

        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            {userRoles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={styles.button}>
          Sign Up
        </button>

        <p style={styles.link}>
          Already registered? <a href="/login" style={styles.linkText}>Sign In</a>
        </p>
      </form>
    </div>
  );
};
=======
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        username: username,
        role: role,
        createdAt: new Date().toISOString()
      });

      alert('Sign up successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Sign up error:', err.code, err.message);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('The email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak.');
          break;
        default:
          setError('Sign up failed. Please try again.');
          break;
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Technician">Technician</option>
              <option value="Engineer">Engineer</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="button primary">Sign Up</button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e

export default SignUpPage;