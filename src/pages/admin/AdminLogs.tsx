import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../pagestyles/AdminPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

interface ActivityLog {
  id: number;
  timestamp: string;
  user: {
    username: string;
    display_name: string;
  };
  action: string;
  details: string | null;
}

// Create an Axios instance to automatically handle the token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [sortBy, setSortBy] = useState<'timestamp' | 'user' | 'action'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const logsPerPage = 20; // As requested

  const navigate = useNavigate();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ActivityLog[]>(`/admin/logs/`, {
        params: {
          skip: (currentPage - 1) * logsPerPage,
          limit: logsPerPage,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      setLogs(response.data);
      // For total pages, you would ideally get a total count from the API
      // For now, let's assume we fetch all and calculate or use a dummy total.
      // In a real app, the backend would provide total_count.
      // Placeholder: Assume total items is at least enough for current page to show buttons
      // Calculate total pages based on whether there might be more items
      setTotalPages(currentPage + (response.data.length === logsPerPage ? 1 : 0));

    } catch (err: any) {
      console.error('Failed to fetch activity logs:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('accessToken');
        navigate('/signin');
      }
      setError('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, navigate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (column: 'timestamp' | 'user' | 'action') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to descending for new sort column
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const getSortIndicator = (column: 'timestamp' | 'user' | 'action') => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  if (loading) {
    return <div className={styles.adminContainer}><h2>Loading activity logs...</h2></div>;
  }

  if (error) {
    return <div className={styles.adminContainer}><h2 className={styles.error}>Error: {error}</h2></div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Admin Activity Logs</h1>
      </div>

      <div className={styles.tableContainer}>
        {logs.length > 0 ? (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>Timestamp{getSortIndicator('timestamp')}</th>
                <th onClick={() => handleSort('user')} style={{ cursor: 'pointer' }}>User{getSortIndicator('user')}</th>
                <th onClick={() => handleSort('action')} style={{ cursor: 'pointer' }}>Action{getSortIndicator('action')}</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user.display_name || log.user.username}</td>
                  <td>{log.action}</td>
                  <td>{log.details || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activity logs found.</p>
        )}
        
        <div className={styles.paginationControls} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className={`${styles.actionButton}`}
          >
            Previous
          </button>
          {/* MODIFIED: Display currentPage and totalPages */}
          <span style={{color: '#333'}}>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            // MODIFIED: Correctly disable Next button using totalPages and logs.length
            disabled={currentPage >= totalPages || logs.length === 0} 
            className={`${styles.actionButton}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;