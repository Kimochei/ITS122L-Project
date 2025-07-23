import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../pagestyles/AdminRequestDetails.module.css'; // We'll create this file next

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

interface DocumentRequest {
  id: number;
  requester_name: string;
  requester_age: number;
  date_of_birth: string;
  address: string;
  document_type: string;
  purpose: string;
  status: string;
  created_at: string;
  updated_at: string | null; // Added based on schema for completeness
  admin_message: string | null;
}

const AdminRequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/signin'); return; }
      
      try {
        // *** MODIFIED: Use API_BASE_URL ***
        const response = await fetch(`${API_BASE_URL}/admin/requests/${requestId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch request details.');
        }
        const data = await response.json();
        setRequest(data);
        setStatus(data.status);
        setAdminMessage(data.admin_message || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestDetails();
  }, [requestId, navigate]); // Add navigate to dependencies as it's used in useEffect

  const handleUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/signin'); return; } // Ensure token exists before trying to update

    try {
      // *** MODIFIED: Use API_BASE_URL ***
      await fetch(`${API_BASE_URL}/admin/document-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, admin_message: adminMessage }),
      });
      alert('Status updated successfully!');
      navigate('/admin/requests'); // Go back to the list after updating
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!request) return <div>Request not found.</div>;

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.header}>
        <h1>Request Details</h1>
        <button onClick={() => navigate('/admin/requests')} className={styles.backButton}>‹ Back to List</button>
      </div>

      <div className={styles.grid}>
        <div className={styles.requestInfo}>
          <h2>Submission Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><strong>Requester Name:</strong> {request.requester_name}</div>
            <div className={styles.infoItem}><strong>Age:</strong> {request.requester_age}</div>
            <div className={styles.infoItem}><strong>Date of Birth:</strong> {request.date_of_birth}</div>
            <div className={styles.infoItem}><strong>Address:</strong> {request.address}</div>
            <div className={styles.infoItem}><strong>Document Type:</strong> {request.document_type}</div>
            <div className={styles.infoItem}><strong>Purpose:</strong> {request.purpose}</div>
            <div className={styles.infoItem}><strong>Date Submitted:</strong> {new Date(request.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <h2>Update Status</h2>
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="adminMessage">Message to Resident (Optional)</label>
            <textarea
              id="adminMessage"
              rows={5}
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="e.g., Your document is ready for pickup."
            />
          </div>
          <button onClick={handleUpdate} className={styles.updateButton}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetails;