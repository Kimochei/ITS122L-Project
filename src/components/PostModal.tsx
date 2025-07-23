import React, { useState, useEffect } from 'react';
import styles from '../componentstyles/PostModal.module.css';
import Modal from './Modal'; // Assuming Modal.tsx is in the same directory
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  is_inappropriate: boolean;
}
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
  comments: Comment[];
  author: { username: string };
  created_at: string;
}
interface PostModalProps {
  postId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Create an Axios instance with the dynamic base URL
const api = axios.create({ baseURL: API_BASE_URL });

const PostModal: React.FC<PostModalProps> = ({ postId, isOpen, onClose }) => {
  const [post, setPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<Media[]>([]);

  const [authorName, setAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!postId || !isOpen) {
      setPost(null);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setSelectedMedia(null);
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Post not found.');
        }
        const data: FullPost = await response.json();
        setPost(data);

        const allMedia: Media[] = [];
        if (data.primary_image_url) {
          allMedia.push({ url: data.primary_image_url, media_type: 'image' });
        }
        if (data.media) {
          allMedia.push(...data.media);
        }

        setGalleryMedia(allMedia);
        if (allMedia.length > 0) {
          setSelectedMedia(allMedia[0]);
        }
      } catch (error) {
        console.error("Failed to fetch post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, isOpen]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    setIsSubmittingComment(true);
    try {
      const commentData = { author_name: authorName.trim() || "Anonymous", content: newComment };
      const response = await api.post(`/posts/${post.id}/comments/`, commentData); 
      if (!response.status.toString().startsWith('2')) {
        throw new Error('Failed to post comment.'); 
      }

      setNewComment('');
      setAuthorName('');
      const postResponse = await fetch(`${API_BASE_URL}/posts/${postId}`);
      if (!postResponse.ok) {
        throw new Error('Failed to refetch post after comment.');
      }
      const updatedPost = await postResponse.json();
      setPost(updatedPost);
    } catch (error) {
      console.error('Failed to submit your comment:', error);
      alert('Failed to submit your comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const MediaViewer = ({ media }: { media: Media | null }) => {
    if (!media) {
      return <div className={styles.mediaPlaceholder}>No Media Available</div>;
    }

    if (media.media_type.startsWith('video')) {
      return (
        <video
          key={media.url}
          src={media.url}
          controls
          muted
          className={styles.mainMedia}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return <img key={media.url} src={media.url} alt="Selected media" className={styles.mainMedia} loading="lazy" />;
  };

  // Filter out inappropriate comments for display
  const visibleComments = post?.comments ? post.comments.filter(comment => !comment.is_inappropriate) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClass={styles.postModalContainer}>
        {loading && <div className={styles.statusMessage}>Loading...</div>}
        {!loading && post && (
          <article className={styles.postArticle}>
            <div className={styles.mediaViewer}>
              <MediaViewer media={selectedMedia} />
            </div>
            <div className={styles.postDetails}>
              <h1 className={styles.postTitle}>{post.title}</h1>
              <p className={styles.postMeta}>By {post.author.username} on {new Date(post.created_at).toLocaleDateString()}</p>
              <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />

              {galleryMedia.length > 1 && (
                <div className={styles.gallery}>
                  <h3>Gallery</h3>
                  <div className={styles.galleryGrid}>
                    {galleryMedia.map((item, index) => (
                      <div key={index} className={`${styles.galleryItem} ${selectedMedia?.url === item.url ? styles.selected : ''}`} onClick={() => setSelectedMedia(item)}>
                        {item.media_type.startsWith('video') ? (
                           <div className={styles.videoThumbnailWrapper}>
                               {/* Corrected: Ensure video and source tags are properly closed and nested */}
                               <video className={styles.galleryThumbnail}><source src={item.url} type={item.media_type}></source></video> 
                               <div className={styles.playIcon}>▶</div>
                           </div>
                         ) : (
                           <img src={item.url} alt={`Item ${index + 1}`} className={styles.galleryThumbnail} loading="lazy" />
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.commentsSection}>
                  <h3>Comments ({visibleComments.length})</h3>
                  <div className={styles.commentList}>
                      {visibleComments.length > 0 ? (
                          visibleComments.map(comment => (
                              <div key={comment.id} className={styles.comment}>
                                  <h4>{comment.author_name}</h4>
                                  <p>{comment.content}</p>
                                  <small>{new Date(comment.created_at).toLocaleString()}</small>
                              </div>
                          ))
                      ) : (
                          <p>No comments yet.</p>
                      )}
                  </div>
                  <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                      <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name (Optional)" />
                      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2} required />
                      <button type="submit" disabled={isSubmittingComment}>{isSubmittingComment ? 'Posting...' : 'Post Comment'}</button>
                  </form>
              </div>
            </div>
          </article>
        )}
    </Modal>
  );
};

export default PostModal;