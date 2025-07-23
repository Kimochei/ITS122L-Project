import React, { useMemo, useEffect } from 'react';
import styles from '../pagestyles/ImageUploader.module.css';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    onFilesChange([...files, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  const previews = useMemo(() => files.map(file => ({
    url: URL.createObjectURL(file),
    name: file.name
  })), [files]);

  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className={styles.fileInput}
        id="gallery-file-input"
        onChange={handleFileChange}
      />
      
      <label htmlFor="gallery-file-input" className={styles.dropzone}>
          <p>+ Add Media to Gallery</p>
      </label>

      {previews.length > 0 && (
        <div className={styles.currentGallery}>
          {previews.map((preview, index) => (
            <div key={preview.name + index} className={styles.mediaItemWrapper}>
              <img
                src={preview.url}
                alt={`Preview ${preview.name}`}
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