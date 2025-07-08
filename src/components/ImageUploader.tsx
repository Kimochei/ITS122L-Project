import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '../pagestyles/ImageUploader.module.css';

interface ImageUploaderProps {
  // The list of files to display, managed by the parent page
  files: File[];
  // A function to update the list of files in the parent page
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // When new files are dropped, add them to the existing list
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const handleRemoveFile = (indexToRemove: number) => {
    // Create a new array excluding the file at the specified index
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  // Generate previews from the files prop
  const previews = useMemo(() => files.map(file => ({
    url: URL.createObjectURL(file),
    name: file.name
  })), [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] }
  });

  return (
    <div className={styles.uploaderContainer}>
      <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag & drop photos here, or click to select</p>
        }
      </div>
      <aside className={styles.previewContainer}>
        {previews.map((preview, index) => (
          <div key={preview.name + index} className={styles.thumb}>
            <img
              src={preview.url}
              alt={`Preview ${preview.name}`}
              onLoad={() => { URL.revokeObjectURL(preview.url) }}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={(e) => {
                e.stopPropagation(); // Prevent the dropzone click event
                handleRemoveFile(index);
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
};

export default ImageUploader;