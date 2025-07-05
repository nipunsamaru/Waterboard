import React from 'react';
<<<<<<< HEAD
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../App.css';

function HomePage() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="App">
      <h1>Welcome to the Home Page!</h1>
      <p>You are logged in.</p>
      <button onClick={handleSignOut}>Sign Out</button>
=======
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

function HomePage() {
  const auth = getAuth(app);
  const user = auth.currentUser;

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to the Online Computer Repair Monitoring System</h1>
          <p>Your one-stop solution for managing and tracking computer repair requests efficiently.</p>
          {!user && (
            <div className="hero-buttons">
              <Link to="/signup" className="button primary">Get Started</Link>
              <Link to="/login" className="button secondary">Login</Link>
            </div>
          )}
          {user && (
            <div className="hero-buttons">
              <Link to="/dashboard" className="button primary">Go to Dashboard</Link>
            </div>
          )}
        </div>
      </header>

      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Request Submission</h3>
            <p>Submit repair requests quickly and effortlessly with all necessary details.</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Tracking</h3>
            <p>Monitor the status of your repair requests in real-time, from submission to completion.</p>
          </div>
          <div className="feature-card">
            <h3>Role-based Access</h3>
            <p>Different dashboards and functionalities for Admins, Managers, Technicians, and Users.</p>
          </div>
          <div className="feature-card">
            <h3>Comprehensive Reporting</h3>
            <p>Generate detailed reports on repair times, technician performance, and more.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>About Us</h2>
        <p>
          We are dedicated to streamlining the computer repair process for organizations.
          Our system provides a robust platform for managing repair requests, ensuring transparency,
          and improving efficiency across all levels of your IT operations.
        </p>
      </section>

      <footer className="footer-section">
        <p>&copy; 2023 Online Computer Repair Monitoring System. All rights reserved.</p>
      </footer>
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
    </div>
  );
}

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
