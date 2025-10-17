import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, rtdb as database } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("user"); // Default role for new sign-ups
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user data to Realtime Database with default 'user' role
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      alert(
        "Sign up successful! You can now log in. An admin will assign your role."
      );
      navigate("/login");
    } catch (err) {
      console.error("Sign up error:", err.code, err.message);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("The email address is already in use by another account.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        case "auth/operation-not-allowed":
          setError(
            "Email/password accounts are not enabled. Please contact support."
          );
          break;
        case "auth/weak-password":
          setError("The password is too weak.");
          break;
        default:
          setError("Sign up failed. Please try again.");
          break;
      }
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
    },
    form: {
      width: "100%",
      maxWidth: "400px",
      padding: "40px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    logo: {
      width: "100px",
      height: "auto",
      margin: "0 auto 10px",
      display: "block",
    },
    title: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#333",
      fontSize: "28px",
      fontWeight: "bold",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "500",
      color: "#555",
      textAlign: "left",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ced4da",
      borderRadius: "5px",
      fontSize: "16px",
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontSize: "18px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s ease-in-out",
    },
    link: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "15px",
    },
    linkText: {
      color: "#007bff",
      textDecoration: "none",
      fontWeight: "500",
    },
    errorMessage: {
      color: "#dc3545",
      textAlign: "center",
      marginBottom: "15px",
      fontSize: "14px",
    },
    roleInfo: {
      textAlign: "center",
      color: "#666",
      fontSize: "14px",
      marginBottom: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <form style={{ ...styles.form, gap: "10px" }} onSubmit={handleSignUp}>
        <img src="/logo.png" alt="Company Logo" style={styles.logo} />
        <h3 style={{ ...styles.title, marginBottom: "15px" }}>Sign Up</h3>

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

        <p style={styles.roleInfo}>
          Note: You will be registered as a user. An administrator will assign
          your specific role.
        </p>

        <button type="submit" style={styles.button}>
          Sign Up
        </button>

        <p style={styles.link}>
          Already registered?{" "}
          <Link to="/login" style={styles.linkText}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
