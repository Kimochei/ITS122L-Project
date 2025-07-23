import React, { useState, useEffect } from 'react';
import OfficialDetailModal from '../components/OfficialDetailModal';
import styles from '../pagestyles/OfficialsPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev


interface Official {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  contributions: string;
}

// --- HIERARCHY DEFINITION ---
// We assign a number to each position to define its rank.
const positionOrder: { [key: string]: number } = {
  // Barangay Officials (1-9)
  "Punong Barangay": 1,
  "Kagawad": 2,
  "Barangay Secretary": 3,
  "Barangay Treasurer": 4,
  "Chief Tanod": 5,
  "Barangay Tanod": 6,
  "Lupong Tagapamayapa Member": 7,
  // SK Officials (10-19)
  "SK Chairperson": 10,
  "SK Kagawad": 11,
  "SK Secretary": 12,
  "SK Treasurer": 13,
  // Service Workers (20+)
  "Barangay Health Worker (BHW)": 20,
  "Day Care Worker": 21,
};

// This function determines which category a position belongs to.
const getCategory = (position: string): string => {
  const rank = positionOrder[position];
  if (rank >= 20) return 'Service Workers';
  if (rank >= 10) return 'Sangguniang Kabataan';
  return 'Barangay Officials';
};

const OfficialsPage: React.FC = () => {
  // MODIFIED: Use _ to indicate that the 'officials' variable is not directly read
  const [_, setOfficials] = useState<Official[]>([]);
  const [groupedOfficials, setGroupedOfficials] = useState<{ [key: string]: Official[] }>({});
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndGroupOfficials = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors

        const response = await fetch(`${API_BASE_URL}/officials/`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to load officials data.' }));
            throw new Error(errorData.detail);
        }
        const data: Official[] = await response.json();
        
        // --- GROUPING AND SORTING LOGIC ---
        const groups: { [key: string]: Official[] } = {
            "Barangay Officials": [],
            "Sangguniang Kabataan": [],
            "Service Workers": []
        };

        data.forEach(official => {
            const category = getCategory(official.position);
            groups[category].push(official);
        });

        // Sort each group internally based on the defined hierarchical order
        for (const category in groups) {
            groups[category].sort((a, b) => (positionOrder[a.position] || 99) - (positionOrder[b.position] || 99));
        }

        setGroupedOfficials(groups);
        setOfficials(data); // This line is fine, as setOfficials is used
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndGroupOfficials();
  }, []); // Empty dependency array means this runs once on component mount

  const handleOpenModal = (official: Official) => {
    setSelectedOfficial(official);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOfficial(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Meet Our Barangay Officials</h1>
        <p>Dedicated leaders serving our community.</p>
      </div>
      
      {isLoading && <p className={styles.loading}>Loading officials...</p>}
      {error && <p className={styles.error}>{error}</p>}
      
      {/* --- RENDER GROUPED OFFICIALS --- */}
      {!isLoading && !error && Object.keys(groupedOfficials).map(category => (
        // Only render a section if it has officials
        groupedOfficials[category].length > 0 && (
          <div key={category} className={styles.categorySection}>
            <h2 className={styles.sectionHeader}>{category}</h2>
            <div className={styles.officialsGrid}>
              {groupedOfficials[category].map((official) => (
                <div key={official.id} className={styles.officialCard} onClick={() => handleOpenModal(official)}>
                  <img src={official.photo_url || 'https://placehold.co/280x300/EEE/31343C?text=No+Image'} alt={official.name} className={styles.cardImage} loading="lazy" />
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{official.name}</h3>
                    <p className={styles.cardPosition}>{official.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      <OfficialDetailModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        official={selectedOfficial} 
      />
    </div>
  );
};

export default OfficialsPage;