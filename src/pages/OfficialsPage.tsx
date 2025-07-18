import React, { useState, useEffect } from 'react';
import OfficialDetailModal from '../components/OfficialDetailModal';
import styles from '../pagestyles/OfficialsPage.module.css';

interface Official {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

const OfficialsPage: React.FC = () => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const response = await fetch('/officials/');
        if (!response.ok) throw new Error('Failed to load officials data.');
        const data = await response.json();
        setOfficials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };
    fetchOfficials();
  }, []);

  const handleOpenModal = (official: Official) => { setSelectedOfficial(official); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedOfficial(null); };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Meet Our Barangay Officials</h1>
        <p>Dedicated leaders serving our community.</p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.officialsGrid}>
        {officials.map((official) => (
          <div key={official.id} className={styles.officialCard} onClick={() => handleOpenModal(official)}>
            <img src={official.photo_url || 'https://placehold.co/250x250/EEE/31343C?text=No+Image'} alt={official.name} className={styles.cardImage} />
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{official.name}</h3>
              <p className={styles.cardPosition}>{official.position}</p>
            </div>
          </div>
        ))}
      </div>
      <OfficialDetailModal isOpen={isModalOpen} onClose={handleCloseModal} official={selectedOfficial} />
    </div>
  );
};

export default OfficialsPage;