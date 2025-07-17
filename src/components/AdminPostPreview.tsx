import React, { useState, useEffect } from 'react';
import styles from '../componentstyles/PostModal.module.css';
import Modal from './Modal';

interface Media {
  url: string;
  media_type: string;
}
interface FullPost {
  id: number;
  title: string;
  content: string;
  primary_image_url: string | null;
  media: Media[];
  author: { username: string };
  created_at: string;
}

interface AdminPostPreviewProps {
  post: FullPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdminPostPreview: React.FC<AdminPostPreviewProps> = ({ post, isOpen, onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (post) {
      if (post.primary_image_url) {
        setSelectedMedia({ url: post.primary_image_url, media_type: 'image' });
      } else if (post.media && post.media.length > 0) {
        setSelectedMedia(post.media[0]);
      } else {
        setSelectedMedia(null);
      }
    }
  }, [post]);

  const allMedia: Media[] = [];
  if (post?.primary_image_url) {
    allMedia.push({ url: post.primary_image_url, media_type: 'image' });
  }
  if (post?.media) {
    allMedia.push(...post.media);
  }

  const MediaViewer = ({ media }: { media: Media | null }) => {
    if (!media) return <div className={styles.mediaPlaceholder}>No Media</div>;

    // Using the URL as a key forces React to re-render the element
    // when the source changes, which is crucial for video.
    if (media.media_type.startsWith('video')) {
      return (
        <video key={media.url} src={media.url} controls muted className={styles.mainMedia}>
          Your browser does not support the video tag.
        </video>
      );
    }
    return <img key={media.url} src={media.url} alt="Selected media" className={styles.mainMedia} />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClass={styles.modalContent}>
      <div className={styles.pageContainer}>
        {!post ? <div className={styles.statusMessage}>Loading...</div> : (
          <article className={styles.postArticle}>
            <div className={styles.mediaViewer}>
              <MediaViewer media={selectedMedia} />
            </div>
            <div className={styles.postDetails}>
              <h1 className={styles.postTitle}>{post.title}</h1>
              <p className={styles.postMeta}>Preview of post by {post.author.username}</p>
              <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              
              {allMedia.length > 1 && (
                <div className={styles.gallery}>
                  <h3>Gallery Preview</h3>
                  <div className={styles.galleryGrid}>
                    {allMedia.map((item, index) => (
                      <div key={index} className={`${styles.galleryItem} ${selectedMedia?.url === item.url ? styles.selected : ''}`} onClick={() => setSelectedMedia(item)}>
                        {item.media_type.startsWith('video') ? (
                          <div className={styles.videoThumbnailWrapper}>
                            <video key={item.url} src={item.url} className={styles.galleryThumbnail} />
                            <div className={styles.playIcon}>▶</div>
                          </div>
                        ) : (
                          <img src={item.url} alt={`Item ${index + 1}`} className={styles.galleryThumbnail} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </Modal>
  );
};

export default AdminPostPreview;