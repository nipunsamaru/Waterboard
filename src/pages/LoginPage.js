import React, { useState } from 'react';
<<<<<<< HEAD
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
=======
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../firebase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);
  const database = getDatabase(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Realtime Database
<<<<<<< HEAD
      const userRef = ref(rtdb, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const role = userData.role;

        // Navigate based on role
        switch (role) {
          case 'user':
            navigate('/user-dashboard');
            break;
          case 'technician':
            navigate('/technician-dashboard');
            break;
          case 'manager':
            navigate('/manager-dashboard');
            break;
          case 'engineer':
            navigate('/engineer-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/'); // Fallback for unknown roles
        }
      } else {
        navigate('/'); // Fallback if user data not found
      }
    } catch (error) {
      setError(error.message);
=======
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userRole = userData.role;

        // Redirect based on role
        switch (userRole) {
          case 'Admin':
            navigate('/admin-dashboard');
            break;
          case 'Manager':
            navigate('/manager-dashboard');
            break;
          case 'Technician':
            navigate('/technician-dashboard');
            break;
          case 'Engineer':
            navigate('/engineer-dashboard');
            break;
          case 'User':
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
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSignIn}>
        <h2 style={styles.title}>Sign In</h2>
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
          Sign In
        </button>
        <p style={styles.signupText}>
          Don't have an account? <a href="/signup" style={styles.signupLink}>Sign Up</a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#e74c3c',
    marginBottom: '15px',
    fontSize: '14px',
  },
  formGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontSize: '15px',
    fontWeight: '600',
  },
  input: {
    width: 'calc(100% - 20px)',
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '17px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
  signupText: {
    marginTop: '25px',
    color: '#777',
    fontSize: '15px',
  },
  signupLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
=======
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="button primary">Login</button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e

export default LoginPage;