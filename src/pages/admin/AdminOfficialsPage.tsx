import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from '../../pagestyles/AdminPage.module.css';
import OfficialFormModal from '../../components/OfficialFormModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

// Define the Official interface with an optional ID
interface Official {
  id?: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

// Create an Axios instance to automatically handle the token
const api = axios.create({
  baseURL: API_BASE_URL, // *** MODIFIED: Use API_BASE_URL here ***
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminOfficialsPage: React.FC = () => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);

  const fetchOfficials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/officials/'); // Axios baseURL handles the base part
      setOfficials(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch officials. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficials();
  }, [fetchOfficials]);

  const handleAddClick = () => {
    setEditingOfficial(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (official: Official) => {
    setEditingOfficial(official);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      try {
        await api.delete(`/admin/officials/${id}`); // Axios baseURL handles the base part
        fetchOfficials();
      } catch (err) {
        setError('Failed to delete official.');
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (officialData: Official, imageFile: File | null) => {
    try {
      let finalPhotoUrl = officialData.photo_url;

      // --- This is the new, correct upload logic ---
      if (imageFile) {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', imageFile);

        // Post the file to our new backend endpoint
        const uploadResponse = await api.post('/admin/upload-official-image', formData, { // Axios baseURL handles the base part
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Get the public URL from the backend's response
        finalPhotoUrl = uploadResponse.data.public_url;
      }

      // Create the final data payload for the official
      const finalOfficialData = { ...officialData, photo_url: finalPhotoUrl };

      // Save the official's data to the database (this part was always correct)
      if (editingOfficial) {
        await api.put(`/admin/officials/${editingOfficial.id}`, finalOfficialData); // Axios baseURL handles the base part
      } else {
        await api.post('/admin/officials/', finalOfficialData); // Axios baseURL handles the base part
      }

      // Close the modal and refresh the list
      setIsModalOpen(false);
      setEditingOfficial(null);
      fetchOfficials();

    } catch (err) {
      setError('Failed to save official. Please check the data and try again.');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading officials...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Manage Barangay Officials</h1>
        <button onClick={handleAddClick} className={styles.addButton}>Add New Official</button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* --- THIS IS THE NEW CARD LAYOUT --- */}
      <div className={styles.officialsListContainer}>
        {officials.length > 0 ? officials.map(official => (
          <div key={official.id} className={styles.officialCard}>
            <img
              src={official.photo_url || 'https://placehold.co/80x80/EEE/31343C?text=N/A'}
              alt={official.name}
              className={styles.officialCardPhoto}
              loading="lazy" // Add lazy loading for images
            />
            <div className={styles.officialCardDetails}>
              <h3 className={styles.officialName}>{official.name}</h3>
              <p className={styles.officialPosition}>{official.position}</p>
            </div>
            <div className={styles.officialCardActions}>
              <button onClick={() => handleEditClick(official)} className={`${styles.actionButton} ${styles.edit}`}>Edit</button>
              {official.id && <button onClick={() => handleDeleteClick(official.id!)} className={`${styles.actionButton} ${styles.reject}`}>Delete</button>}
            </div>
          </div>
        )) : (
          <div className={styles.officialCard}>
            <p>No officials found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OfficialFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingOfficial}
        />
      )}
    </div>
  );
};

export default AdminOfficialsPage;