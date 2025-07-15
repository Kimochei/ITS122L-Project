import React, { useState, useEffect } from 'react';
import styles from '../pagestyles/AnnouncementsPage.module.css'; // Correct import

interface Post {
  id: number;
  title: string;
  content: string;
  primary_image_url: string | null;
  created_at: string;
  author: {
    username: string;
  };
}

const AnnouncementsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/posts/');
        if (!response.ok) {
          throw new Error('Failed to fetch posts from the server.');
        }
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div className={styles.announcementsContainer}><h2>Loading announcements...</h2></div>;
  }

  if (error) {
    return <div className={styles.announcementsContainer}><h2>Error: {error}</h2></div>;
  }

  return (
    <div className={styles.announcementsContainer}>
      <h1>Announcements</h1>
      <p>Stay updated with the latest news from the barangay.</p>
      <div className={styles.postsGrid}>
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className={styles.postCard}>
              {post.primary_image_url && (
                <img src={post.primary_image_url} alt={post.title} className={styles.postImage} />
              )}
              <div className={styles.postContent}>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <div className={styles.postMeta}>
                  <span>By: {post.author.username}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No announcements found.</p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;