import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pagestyles/AdminPage.module.css';
import Modal from '../../components/Modal';

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
  updated_at: string | null;
  admin_message: string | null;
}

const AdminDocumentRequests = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DocumentRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'complete' | null>(null);
  const [adminMessage, setAdminMessage] = useState('');

  const fetchRequests = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/signin'); return; }
    try {
      // *** MODIFIED: Use API_BASE_URL ***
      const response = await fetch(`${API_BASE_URL}/admin/requests/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data.');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]); // navigate is a dependency here, good practice.

  const openModal = (e: React.MouseEvent, request: DocumentRequest, action: 'approve' | 'reject' | 'complete') => {
    e.stopPropagation();
    setCurrentRequest(request);
    setModalAction(action);
    setAdminMessage(request.admin_message || (action === 'complete' ? 'Your document is ready for pickup.' : ''));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRequest(null);
    setModalAction(null);
    setAdminMessage('');
  };

  const handleStatusUpdate = async (e: React.MouseEvent | undefined, request: DocumentRequest, newStatus: 'completed' | 'rejected' | 'approved', message?: string) => {
    if (e) e.stopPropagation();
    if (!message || !message.trim()) { alert("A message is required to update the status."); return; }
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/signin'); return; } // Ensure token exists before trying to update

    try {
      // *** MODIFIED: Use API_BASE_URL ***
      await fetch(`${API_BASE_URL}/admin/document-requests/${request.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, admin_message: message }),
      });
      fetchRequests(); // Re-fetch requests to update the UI
      closeModal();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleModalSubmit = () => {
    if (!currentRequest || !modalAction) return;
    const statusMap = { approve: 'approved', reject: 'rejected', complete: 'completed' };
    const newStatus = statusMap[modalAction] as 'approved' | 'rejected' | 'completed';
    handleStatusUpdate(undefined, currentRequest, newStatus, adminMessage);
  };

  const pendingRequests = requests.filter(req => req.status === 'pending').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const approvedRequests = requests.filter(req => req.status === 'approved').sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()).slice(0, 5);
  const resolvedRequests = requests.filter(req => req.status === 'completed' || req.status === 'rejected').sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()).slice(0, 5);

  const RequestTable = ({ requestList, isPending }: { requestList: DocumentRequest[], isPending: boolean }) => (
    <table className={styles.requestsTable}>
      <thead>
        <tr>
          <th>Request ID</th><th>Requester Name</th><th>Document Type</th><th>Date Submitted</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {requestList.map(req => (
          <tr key={req.id}>
            <td>{req.id}</td>
            <td>{req.requester_name}</td>
            <td>{req.document_type}</td>
            <td>{new Date(req.created_at).toLocaleString()}</td>
            <td className={styles.actionCell}>
              {isPending ? (
                <>
                  <div className={styles.viewButtonContainer}><span className={`${styles.actionButton} ${styles.view}`}>View</span><div className={styles.viewTooltip}><h4>Request Details</h4><p><strong>Name:</strong> {req.requester_name}</p><p><strong>Age:</strong> {req.requester_age}</p><p><strong>Birthday:</strong> {req.date_of_birth}</p><p><strong>Address:</strong> {req.address}</p><p><strong>Purpose:</strong> {req.purpose}</p></div></div>
                  <button onClick={(e) => openModal(e, req, 'approve')} className={`${styles.actionButton} ${styles.approve}`}>Approve</button>
                  <button onClick={(e) => openModal(e, req, 'reject')} className={`${styles.actionButton} ${styles.reject}`}>Reject</button>
                </>
              ) : (
                <>
                  <button onClick={(e) => openModal(e, req, 'complete')} className={`${styles.actionButton} ${styles.complete}`}>Complete</button>
                  <button onClick={(e) => openModal(e, req, 'reject')} className={`${styles.actionButton} ${styles.reject}`}>Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  const ResolvedTable = ({ requestList }: { requestList: DocumentRequest[] }) => (
    <table className={styles.requestsTable}>
      <thead>
        <tr>
          <th>Status</th><th>Request ID</th><th>Requester Name</th><th>Document Type</th><th>Date Resolved</th>
        </tr>
      </thead>
      <tbody>
        {requestList.map(req => (
          <tr key={req.id}>
            <td><span className={`${styles.statusIndicator} ${req.status === 'completed' ? styles.completedIndicator : styles.rejectedIndicator}`}></span></td>
            <td>{req.id}</td>
            <td>{req.requester_name}</td>
            <td>{req.document_type}</td>
            <td>{new Date(req.updated_at || req.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) return <div className={styles.loadingContainer}><h2>Loading...</h2></div>;
  if (error) return <div className={styles.loadingContainer}><h2>Error: {error}</h2></div>;

  const getModalTitle = () => {
    if (modalAction === 'approve') return 'Approve Request';
    if (modalAction === 'reject') return 'Reject Request';
    if (modalAction === 'complete') return 'Complete Request';
    return '';
  };
  
  return (
    <>
      <div className={styles.adminContainer}>
        <div className={styles.header}><h1>Manage Document Requests</h1></div>
        <div className={styles.tableContainer}>
          <h2>Recent Submissions</h2>
          {pendingRequests.length > 0 ? <RequestTable requestList={pendingRequests} isPending={true} /> : <p>No new submissions.</p>}
        </div>
        <div className={styles.tableContainer}>
          <h2>Approved Requests</h2>
          {approvedRequests.length > 0 ? <RequestTable requestList={approvedRequests} isPending={false} /> : <p>No requests awaiting completion.</p>}
        </div>
        <div className={styles.tableContainer}>
          <h2>Resolved Requests</h2>
          {resolvedRequests.length > 0 ? <ResolvedTable requestList={resolvedRequests} /> : <p>No resolved requests found.</p>}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className={styles.modalContent}>
          <h3>{getModalTitle()}</h3>
          <p>A message is required to proceed.</p>
          <textarea className={styles.modalTextarea} rows={4} value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder="e.g., Reason for rejection or approval instructions."/>
          <button onClick={handleModalSubmit} className={styles.modalConfirmButton}>Confirm Action</button>
        </div>
      </Modal>
    </>
  );
};

export default AdminDocumentRequests;