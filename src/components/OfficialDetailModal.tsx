import React from 'react';
import styles from '../componentstyles/OfficialDetailModal.module.css';

interface Official {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

interface OfficialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  official: Official | null;
}

const OfficialDetailModal: React.FC<OfficialDetailModalProps> = ({ isOpen, onClose, official }) => {
  if (!isOpen || !official) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <div className={styles.modalBody}>
          <img src={official.photo_url || 'https://placehold.co/200x200/EEE/31343C?text=No+Image'} alt={official.name} className={styles.modalImage} />
          <div className={styles.modalInfo}>
            <h2>{official.name}</h2>
            <h3>{official.position}</h3>
            <div className={styles.section}><h4>About</h4><p>{official.bio || 'No information available.'}</p></div>
            <div className={styles.section}><h4>Contributions</h4><p>{official.contributions || 'No contributions listed.'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialDetailModal;