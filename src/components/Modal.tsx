import React from 'react';
import styles from '../pagestyles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentClass?: string; // Add this optional prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, contentClass }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.content} ${contentClass || ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;