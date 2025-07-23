import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../pagestyles/SignInPage.module.css'; // Reusing styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // ADD 'display_name' to the data sent to the API
    const userData = { username, email, password, display_name: displayName };

    try {
      // *** MODIFIED: Use API_BASE_URL ***
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create account.');
      }
      
      setSuccess('Account created successfully! An admin will approve your request.');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.signinContainer}>
      <form className={styles.signinForm} onSubmit={handleSignUp}>
        <h2>Create Admin Account</h2>
        
        {/* NEW INPUT FIELD ADDED HERE */}
        <div className={styles.formGroup}>
          <label htmlFor="displayName">Display Name (Optional)</label>
          <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p style={{color: 'green', textAlign: 'center'}}>{success}</p>}

        <button type="submit" className={styles.submitBtn}>Create Account</button>

        <p className={styles.signupLink}>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;