import React, { useCallback, useMemo } from 'react';
import styles from '../pagestyles/AdminPage.module.css'; // Reusing styles from AdminPage

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  const previews = useMemo(() => files.map(file => ({
    url: URL.createObjectURL(file),
    name: file.name
  })), [files]);

  return (
    <div>
      <input type="file" multiple accept="image/*,video/*" className={styles.fileInput} onChange={(e) => onFilesChange(Array.from(e.target.files || []))} />
      
      {previews.length > 0 && (
        <div className={styles.currentGallery} style={{ marginTop: '10px' }}>
          {previews.map((preview, index) => (
            <div key={preview.name + index} className={styles.mediaItemWrapper}>
              <img
                src={preview.url}
                alt={`Preview ${preview.name}`}
                onLoad={() => { URL.revokeObjectURL(preview.url) }}
              />
              <button type="button" onClick={() => handleRemoveFile(index)} className={styles.deleteMediaButton}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;