import React, { useState, useEffect, useCallback } from 'react';
import OfficialFormModal from '../../components/OfficialFormModal';
import styles from '../../pagestyles/AdminPage.module.css';

interface Official {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

const AdminOfficialsPage: React.FC = () => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficials = useCallback(async () => {
    try {
      const response = await fetch('/officials/');
      if (!response.ok) throw new Error('Failed to fetch officials');
      const data = await response.json();
      setOfficials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  useEffect(() => { fetchOfficials(); }, [fetchOfficials]);

  const handleAdd = () => { setEditingOfficial(null); setIsModalOpen(true); };
  const handleEdit = (official: Official) => { setEditingOfficial(official); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingOfficial(null); };

  const handleSubmit = async (officialData: Omit<Official, 'id'> & { id?: number }) => {
    const token = localStorage.getItem('token');
    const method = officialData.id ? 'PUT' : 'POST';
    const url = officialData.id ? `/admin/officials/${officialData.id}` : '/admin/officials/';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(officialData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save official');
      }
      handleCloseModal();
      fetchOfficials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/admin/officials/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete official');
        }
        fetchOfficials();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Manage Barangay Officials</h1>
        <button onClick={handleAdd} className={styles.addButton}>Add New Official</button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.adminTable}>
        <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Actions</th></tr></thead>
        <tbody>
          {officials.map((official) => (
            <tr key={official.id}>
              <td><img src={official.photo_url || 'https://placehold.co/100x100/EEE/31343C?text=No+Img'} alt={official.name} className={styles.tableImage} /></td>
              <td>{official.name}</td>
              <td>{official.position}</td>
              <td>
                <button onClick={() => handleEdit(official)} className={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(official.id)} className={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <OfficialFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={editingOfficial} />
    </div>
  );
};

export default AdminOfficialsPage;