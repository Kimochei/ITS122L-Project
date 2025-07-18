import React, { useState, useEffect } from 'react';
import styles from '../componentstyles/Modal.module.css';

interface Official {
  id?: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

interface OfficialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (official: Official) => void;
  initialData?: Official | null;
}

const OfficialFormModal: React.FC<OfficialFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Official>({ name: '', position: '', photo_url: '', bio: '', contributions: '' });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', position: '', photo_url: '', bio: '', contributions: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <h2>{initialData ? 'Edit Official' : 'Add New Official'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label>Position</label><input type="text" name="position" value={formData.position} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label>Photo URL</label><input type="text" name="photo_url" value={formData.photo_url} onChange={handleChange} /></div>
          <div className={styles.formGroup}><label>Bio / Information</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} /></div>
          <div className={styles.formGroup}><label>Contributions</label><textarea name="contributions" value={formData.contributions} onChange={handleChange} rows={4} /></div>
          <div className={styles.formActions}><button type="submit" className={styles.submitButton}>Save</button><button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

export default OfficialFormModal;