import React, { useState, useEffect } from 'react';
import styles from '../componentstyles/Modal.module.css';
import ImageUploader from './SingleImageUploader';

// Define the Official interface
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
  onSubmit: (official: Official, imageFile: File | null) => void;
  initialData?: Official | null;
}

// --- NEW: List of Barangay and SK Positions ---
const officialPositions = [
  // Barangay Officials
  "Punong Barangay",
  "Kagawad",
  "Barangay Secretary",
  "Barangay Treasurer",
  "Chief Tanod",
  "Barangay Tanod",
  // SK Officials
  "SK Chairperson",
  "SK Kagawad",
  "SK Secretary",
  "SK Treasurer",
  // Other Common Roles
  "Lupong Tagapamayapa Member",
  "Barangay Health Worker (BHW)",
  "Day Care Worker",
];


const OfficialFormModal: React.FC<OfficialFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Official>({ name: '', position: '', photo_url: '', bio: '', contributions: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Set default position for new official or leave empty
        setFormData({ name: '', position: '', photo_url: '', bio: '', contributions: '' });
      }
      setImageFile(null); // Reset file input
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setFormData(prev => ({ ...prev, photo_url: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation to ensure a position is selected
    if (!formData.position) {
        alert('Please select a position.');
        return;
    }
    onSubmit(formData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <h2>{initialData ? 'Edit Official' : 'Add New Official'}</h2>
        
        <form onSubmit={handleSubmit} className={styles.officialForm}>
          
          <div className={styles.officialFormGroup}>
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.officialFormInput} />
          </div>
          
          {/* --- MODIFIED: Position Dropdown --- */}
          <div className={styles.officialFormGroup}>
            <label>Position</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className={styles.officialFormSelect} // Use a new style for the select
            >
              <option value="" disabled>-- Select a Position --</option>
              {officialPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.officialFormGroup}>
            <label>Photo</label>
            <ImageUploader onFileSelect={handleFileSelect} initialPreviewUrl={initialData?.photo_url} />
          </div>
          
          <div className={styles.officialFormGroup}>
            <label>Bio / Information</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className={styles.officialFormTextarea} />
          </div>
          
          <div className={styles.officialFormGroup}>
            <label>Contributions</label>
            <textarea name="contributions" value={formData.contributions} onChange={handleChange} rows={4} className={styles.officialFormTextarea} />
          </div>
          
          <div className={styles.officialFormActions}>
            <button type="submit" className={styles.officialSubmitButton}>Save</button>
            <button type="button" onClick={onClose} className={styles.officialCancelButton}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OfficialFormModal;