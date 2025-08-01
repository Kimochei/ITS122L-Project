import { useState, useEffect } from 'react';
import styles from '../pagestyles/AnnouncementsPage.module.css';
import PostModal from '../components/PostModal'; // Import the reusable modal

import Card from 'react-bootstrap/Card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback for local dev

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

  // State to manage which post is selected to be shown in the modal
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // *** MODIFIED: Use the API_BASE_URL constant here ***
        const response = await fetch(`${API_BASE_URL}/posts/`);
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
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return <div className={styles.announcementsContainer}><h2>Loading announcements...</h2></div>;
  }

  if (error) {
    return <div className={styles.announcementsContainer}><h2>Error: {error}</h2></div>;
  }

  return (
    <>
      <div className={styles.announcementsContainer}>
        <h1>Announcements</h1>
        <p>Stay updated with the latest news and events from the barangay.</p>
        <div className={styles.postsGrid}>
          {posts.length > 0 ? (
            posts.map(post => (
              <Card key={post.id} onClick={() => setSelectedPostId(post.id)}>
                <Card.Body className={styles.postContent}>
                  {post.primary_image_url && (
                        <Card.Img src={post.primary_image_url}
                                  alt={post.title}
                                  className={styles.postImage}
                                  loading="lazy"
                                  style={{marginBottom: "10px"}}/>
                      )}
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>
                    {/* only show the first 60 words */}
                    {post.content.split(' ').length > 60
                      ? post.content.split(' ').slice(0, 60).join(' ') + '...'
                      : post.content}
                  </Card.Text>
                  <Card.Subtitle className={styles.postMeta}>
                    <span>By: {post.author.username}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </Card.Subtitle>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No announcements found.</p>
          )}
        </div>
      </div>

      {/* Render the reusable PostModal component */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};

export default AnnouncementsPage;