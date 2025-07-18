import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../pagestyles/AdminPage.module.css';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  post_id: number;
  is_inappropriate: boolean;
}

// Create an Axios instance to automatically handle the token
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'unflagged'>('all');
  const navigate = useNavigate();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/admin/comments/';
      if (filter === 'flagged') {
        url += '?is_inappropriate=true';
      } else if (filter === 'unflagged') {
        url += '?is_inappropriate=false';
      }
      const response = await api.get<Comment[]>(url);
      setComments(response.data);
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('accessToken');
        navigate('/signin');
      }
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleFlag = async (commentId: number) => {
    if (window.confirm('Are you sure you want to flag this comment as inappropriate?')) {
      try {
        await api.patch(`/admin/comments/${commentId}/flag`);
        fetchComments(); // Refresh list
      } catch (err) {
        alert('Failed to flag comment.');
        console.error(err);
      }
    }
  };

  const handleUnflag = async (commentId: number) => {
    if (window.confirm('Are you sure you want to unflag this comment?')) {
      try {
        await api.patch(`/admin/comments/${commentId}/unflag`);
        fetchComments(); // Refresh list
      } catch (err) {
        alert('Failed to unflag comment.');
        console.error(err);
      }
    }
  };

  const handleDelete = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/comments/${commentId}`);
        fetchComments(); // Refresh list
      } catch (err) {
        alert('Failed to delete comment.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className={styles.adminContainer}><h2>Loading comments...</h2></div>;
  }

  if (error) {
    return <div className={styles.adminContainer}><h2 className={styles.error}>Error: {error}</h2></div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Manage Comments</h1>
        <div className={styles.filterGroup}>
          <label htmlFor="commentFilter">Show:</label>
          <select id="commentFilter" value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'flagged' | 'unflagged')} className={styles.formGroup}>
            <option value="all">All Comments</option>
            <option value="flagged">Flagged Comments</option>
            <option value="unflagged">Unflagged Comments</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {comments.length > 0 ? (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Post ID</th>
                <th>Author</th>
                <th>Content</th>
                <th>Flagged</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td>{comment.id}</td>
                  <td>{comment.post_id}</td>
                  <td>{comment.author_name}</td>
                  <td>{comment.content}</td>
                  <td>{comment.is_inappropriate ? 'Yes' : 'No'}</td>
                  <td>{new Date(comment.created_at).toLocaleString()}</td>
                  <td className={styles.actionCell}>
                    {comment.is_inappropriate ? (
                      <button onClick={() => handleUnflag(comment.id)} className={`${styles.actionButton} ${styles.complete}`}>Unflag</button>
                    ) : (
                      <button onClick={() => handleFlag(comment.id)} className={`${styles.actionButton} ${styles.edit}`}>Flag</button>
                    )}
                    <button onClick={() => handleDelete(comment.id)} className={`${styles.actionButton} ${styles.reject}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No comments found for the selected filter.</p>
        )}
      </div>
    </div>
  );
};

export default AdminComments;