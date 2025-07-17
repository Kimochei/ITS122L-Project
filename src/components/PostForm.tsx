import React, { useState, useEffect } from 'react';
import styles from '../pagestyles/AdminPage.module.css';
import ImageUploader from './ImageUploader';

interface Media { url: string; media_type: string; }
interface PostData {
  title: string;
  content: string;
  primary_image_url?: string | null;
  media?: Media[];
}
interface PostFormProps {
  onSubmit: (postData: { title: string; content: string }, newPrimaryImage: File | null, newMediaFiles: File[], currentMedia: { primary: string | null; gallery: Media[] }) => void;
  onCancel: () => void;
  initialData?: PostData;
  isSubmitting: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [currentPrimary, setCurrentPrimary] = useState<string | null>(null);
  const [currentGallery, setCurrentGallery] = useState<Media[]>([]);

  const [newPrimaryImage, setNewPrimaryImage] = useState<File | null>(null);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);

  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCurrentPrimary(initialData.primary_image_url || null);
      setCurrentGallery(initialData.media || []);
    } else {
      setTitle(''); setContent(''); setCurrentPrimary(null); setCurrentGallery([]);
    }
    setNewPrimaryImage(null);
    setNewMediaFiles([]);
    setPrimaryPreview(null);
  }, [initialData]);

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPrimaryImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPrimaryPreview(objectUrl);
    } else {
      setNewPrimaryImage(null);
      setPrimaryPreview(null);
    }
  };

  const handleRemovePrimary = () => setCurrentPrimary(null);
  const handleRemoveGalleryItem = (urlToRemove: string) => {
    setCurrentGallery(currentGallery.filter(item => item.url !== urlToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMedia = { primary: currentPrimary, gallery: currentGallery };
    onSubmit({ title, content }, newPrimaryImage, newMediaFiles, currentMedia);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.mediaManagementSection}>
        <div className={styles.mediaColumn}>
          <label>Primary Image</label>
          {currentPrimary ? (
            <div className={styles.mediaItemWrapper}>
              <img src={currentPrimary} alt="Current primary" />
              <button type="button" onClick={handleRemovePrimary} className={styles.deleteMediaButton}>×</button>
            </div>
          ) : primaryPreview ? (
             <div className={styles.mediaItemWrapper}>
               <img src={primaryPreview} alt="New primary preview" />
             </div>
          ) : <p className={styles.noMediaText}>No primary image selected.</p>}
        </div>
        <div className={styles.mediaColumn}>
          <label>Change/Upload Primary Image</label>
          <input type="file" accept="image/*" className={styles.fileInput} onChange={handlePrimaryImageChange} />
        </div>
      </div>
      
      <div className={styles.mediaManagementSection}>
        <div className={styles.mediaColumn}>
          <label>Current Gallery</label>
          {currentGallery.length > 0 ? (
            <div className={styles.currentGallery}>
              {currentGallery.map((item, index) => (
                <div key={index} className={styles.mediaItemWrapper}>
                  {item.media_type.startsWith('video') ? (
                    <><video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline></video><div className={styles.playIconOverlay}>▶</div></>
                  ) : <img src={item.url} alt={`Item ${index}`} />}
                  <button type="button" onClick={() => handleRemoveGalleryItem(item.url)} className={styles.deleteMediaButton}>×</button>
                </div>
              ))}
            </div>
          ) : <p className={styles.noMediaText}>No gallery items.</p>}
        </div>
        <div className={styles.mediaColumn}>
          <label>Add New Media to Gallery</label>
          <ImageUploader files={newMediaFiles} onFilesChange={setNewMediaFiles} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Post Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className={styles.formGroup}>
        <label>Content</label>
        <textarea rows={5} value={content} onChange={e => setContent(e.target.value)} required />
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancel</button>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Post'}</button>
      </div>
    </form>
  );
};

export default PostForm;