import React, { useState } from 'react';
import styles from '../pagestyles/DocumentRequestsPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

interface TrackedRequest {
  requester_name: string;
  document_type: string;
  status: string;
  created_at: string;
  admin_message: string | null;
}

const DocumentRequestsPage = () => {
  const [view, setView] = useState('initial');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [trackingTokenInput, setTrackingTokenInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<TrackedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successfulToken, setSuccessfulToken] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('Submitting your request...');
    setError('');
    setSuccessfulToken('');

    const requestData = {
      requester_name: fullName,
      requester_age: parseInt(age, 10),
      date_of_birth: dateOfBirth,
      address: address,
      document_type: documentType,
      purpose: purpose,
    };

    try {
      // *** MODIFIED: Use API_BASE_URL ***
      const response = await fetch(`${API_BASE_URL}/document-requests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Submission failed.');
      }
      const result = await response.json();
      setSuccessfulToken(result.request_token);
      setMessage('');
      setFullName('');
      setAge('');
      setDateOfBirth('');
      setAddress('');
      setDocumentType('');
      setPurpose('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('Tracking your request...');
    setError('');
    setTrackedRequest(null);
    try {
      // *** MODIFIED: Use API_BASE_URL ***
        const response = await fetch(`${API_BASE_URL}/document-requests/status/${trackingTokenInput}`);
        if (!response.ok) {
          throw new Error('Invalid or expired tracking token.');
        }
        const result = await response.json();
        setTrackedRequest(result);
        setMessage('');
    } catch (err) {
        setError('Could not find a request with that token.');
    } finally {
        setSubmitting(false);
    }
  };

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(successfulToken);
    setMessage('Token copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  const renderContent = () => {
    if (view === 'create') {
      return (
        <form onSubmit={handleCreateSubmit}>
          <h2>New Document Request</h2>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="age">Age</label>
              <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address">Complete Address</label>
            <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="documentType">Type of Document</label>
            <select id="documentType" value={documentType} onChange={e => setDocumentType(e.target.value)} required>
              <option value="" disabled>-- Please select a document --</option>
              <option value="Barangay Clearance">Barangay Clearance</option>
              <option value="Certificate of Indigency">Certificate of Indigency</option>
              <option value="Certificate of Residency">Certificate of Residency</option>
              <option value="Business Permit">Business Permit</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="purpose">Purpose of Request</label>
            <textarea id="purpose" rows={4} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., For employment, school application, etc." required />
          </div>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      );
    }
    if (view === 'track') {
      return (
        <form onSubmit={handleTrackSubmit}>
          <h2>Track Your Request</h2>
          <div className={styles.formGroup}>
            <label htmlFor="trackingToken">Enter Your Tracking Token</label>
            <input type="text" id="trackingToken" value={trackingTokenInput} onChange={e => setTrackingTokenInput(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Searching...' : 'Track Request'}
          </button>
        </form>
      );
    }
    return (
      <div className={styles.initialView}>
        <button onClick={() => setView('create')} className={styles.actionButton}>
          Create New Request
        </button>
        <button onClick={() => setView('track')} className={styles.actionButton}>
          Track Existing Request
        </button>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Document Services</h1>
        <p>Request and track barangay documents online.</p>
      </div>
      <div className={styles.formContainer}>
        {view !== 'initial' && (
          <button onClick={() => { setView('initial'); setError(''); setMessage(''); setTrackedRequest(null); setSuccessfulToken(''); }} className={styles.backButton}>
            ‹ Back
          </button>
        )}
        {renderContent()}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.statusMessage}>{message}</p>}
        {successfulToken && (
          <div className={styles.tokenDisplay}>
            <h4>Request Submitted!</h4>
            <p>Please save your tracking token. You will need it to check the status of your request.</p>
            <textarea readOnly value={successfulToken} />
            <button onClick={copyTokenToClipboard} className={styles.copyButton}>Copy Token</button>
          </div>
        )}
        {trackedRequest && (
            <div className={styles.trackedResult}>
                <h4>Request Status</h4>
                <p><strong>Requester:</strong> {trackedRequest.requester_name}</p>
                <p><strong>Document:</strong> {trackedRequest.document_type}</p>
                <p><strong>Date Filed:</strong> {new Date(trackedRequest.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`${styles.status} ${styles[trackedRequest.status]}`}>{trackedRequest.status}</span></p>
                
                {trackedRequest.admin_message && (
                  <div className={styles.adminMessage}>
                    <strong>Message from Admin:</strong>
                    <p>{trackedRequest.admin_message}</p>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DocumentRequestsPage;