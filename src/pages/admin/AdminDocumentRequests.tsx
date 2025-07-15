import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pagestyles/AdminPage.module.css';

interface DocumentRequest {
  id: number;
  requester_name: string;
  document_type: string;
  status: string;
  created_at: string;
}

const AdminPage = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/admin/requests/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }

        const data = await response.json();
        setRequests(data);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
        localStorage.removeItem('accessToken');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/signin');
  };

  // --- The rest of your JSX remains the same ---
  if (loading) {
    return <div className={styles.loadingContainer}><h2>Loading dashboard...</h2></div>;
  }

  if (error) {
    return <div className={styles.loadingContainer}><h2>Error: {error}</h2></div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </div>
      <div className={styles.tableContainer}>
        <h2>Document Requests</h2>
        <table className={styles.requestsTable}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Requester Name</th>
              <th>Document Type</th>
              <th>Status</th>
              <th>Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.requester_name}</td>
                  <td>{req.document_type}</td>
                  <td>
                    <span className={`${styles.status} ${styles[req.status] || ''}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{new Date(req.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No document requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;