import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../pagestyles/AdminPage.module.css';
import Modal from '../../components/Modal';
import PostForm from '../../components/PostForm';
import AdminPostPreview from '../../components/AdminPostPreview';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

interface Media {
  url: string;
  media_type: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: { username: string };
  created_at: string;
  primary_image_url: string | null;
  media: Media[];
}

// *** MODIFIED: Define Axios instance and set up interceptor OUTSIDE the component ***
// This ensures the Axios instance and its interceptor are created only once
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
// *** END MODIFIED SECTION ***


const AdminAnnouncements: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Removed: useEffect for interceptor (it's now defined globally)


  const fetchPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/signin');
      return;
    }
    // Token is now handled by the global interceptor, no need for manual headers here.
    try {
      const response = await api.get('/posts/'); 
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        localStorage.removeItem('accessToken');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [navigate]); // navigate is a dependency here, good practice.

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/admin/posts/${postId}`); 
        fetchPosts();
      } catch (error) {
        alert('Failed to delete post.');
        console.error(error);
      }
    }
  };

  const handleOpenFormModal = (post: Post | null) => {
    setSelectedPost(post);
    setIsFormModalOpen(true);
  };

  const handleOpenPreviewModal = (post: Post) => {
    setSelectedPost(post);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsPreviewModalOpen(false);
    setSelectedPost(null);
  };

  const handleFormSubmit = async (
    postData: { title: string; content: string },
    newPrimaryImage: File | null,
    newMediaFiles: File[],
    currentMedia: { primary: string | null; gallery: Media[] }
  ) => {
    setIsSubmitting(true);
    try {
      let finalPrimaryUrl = currentMedia.primary;

      // --- UPLOAD PRIMARY IMAGE (THE CORRECT WAY) ---
      if (newPrimaryImage) {
        const formData = new FormData();
        formData.append('file', newPrimaryImage);

        // Call our new, working backend endpoint
        const uploadRes = await api.post('/admin/upload-announcement-image', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' }, // Axios handles token via interceptor
        });
        finalPrimaryUrl = uploadRes.data.public_url;
      }

      // --- UPLOAD GALLERY IMAGES (THE CORRECT WAY) ---
      const newMediaItems: Media[] = [];
      for (const file of newMediaFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await api.post('/admin/upload-announcement-image', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' }, // Axios handles token via interceptor
        });
        newMediaItems.push({ url: uploadRes.data.public_url, media_type: file.type.startsWith('video') ? 'video' : 'image' });
      }

      // Combine all data for the final database submission
      const finalMediaGallery = [...currentMedia.gallery, ...newMediaItems];
      const finalPostData = {
        ...postData,
        primary_image_url: finalPrimaryUrl,
        media: finalMediaGallery,
      };

      // Save the post data to the database
      if (selectedPost) {
        await api.put(`/admin/posts/${selectedPost.id}`, finalPostData); 
      } else {
        await api.post('/admin/posts/', finalPostData); 
      }
      
      handleCloseModals();
      fetchPosts();

    } catch (error) {
      alert('Failed to save post.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <h1>Manage Announcements</h1>
          <button onClick={() => handleOpenFormModal(null)} className={styles.createButton}>Create New Post</button>
        </div>
        <div className={styles.postListContainer}>
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className={styles.postCard}>
                {post.primary_image_url ? (
                  <img src={post.primary_image_url} alt={post.title} className={styles.postThumbnail} loading="lazy" /> 
                ) : (
                  <div className={styles.thumbnailPlaceholder}>N/A</div>
                )}
                <div className={styles.postDetails}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postMeta}>by {post.author.username} on {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div className={styles.postActions}>
                  <button onClick={() => handleOpenPreviewModal(post)} className={`${styles.actionButton} ${styles.view}`}>Preview</button>
                  <button onClick={() => handleOpenFormModal(post)} className={`${styles.actionButton} ${styles.edit}`}>Edit</button>
                  <button onClick={() => handleDelete(post.id)} className={`${styles.actionButton} ${styles.reject}`}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyRow}>
              No announcements found. Click "Create New Post" to get started.
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals}>
        <h2 className={styles.modalTitle}>{selectedPost ? 'Edit Post' : 'Create New Post'}</h2>
        <PostForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
          initialData={selectedPost || undefined}
          isSubmitting={isSubmitting}
        />
      </Modal>
      <AdminPostPreview 
        post={selectedPost}
        isOpen={isPreviewModalOpen}
        onClose={handleCloseModals}
      />
    </>
  );
};

export default AdminAnnouncements;