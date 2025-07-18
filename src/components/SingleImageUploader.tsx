import React, { useState, useRef, useEffect } from 'react';
import styles from '../pagestyles/ImageUploader.module.css';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  initialPreviewUrl?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, initialPreviewUrl }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPreviewUrl) {
      setPreview(initialPreviewUrl);
    } else {
      setPreview(null);
    }
  }, [initialPreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploaderContainer}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className={styles.fileInput}
      />
      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Official Preview" className={styles.imagePreview} />
          <button type="button" onClick={handleRemoveImage} className={styles.removeButton}>
            Remove Image
          </button>
        </div>
      ) : (
        <div className={styles.uploadBox} onClick={handleUploadClick}>
          <span>+ Upload Photo</span>
          <small>Click here to select an image</small>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;