import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../pagestyles/SignInPage.module.css';

const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (Your existing handleSignIn logic)
    setError('');

    const details = new URLSearchParams();
    details.append('username', username);
    details.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: details,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid username or password');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.signinContainer}>
      <form className={styles.signinForm} onSubmit={handleSignIn}>
        {}
        <Link to="/" className={styles.backLink}>‹ Back to Site</Link>

        <h2>Admin Sign In</h2>
        {/* ... (The rest of your form JSX) ... */}
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.submitBtn}>Sign In</button>
        <p className={styles.signupLink}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;