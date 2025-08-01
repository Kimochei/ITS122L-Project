import { useState, useEffect } from 'react';
import styles from '../pagestyles/LandingPage.module.css';
import PostModal from '../components/PostModal';
import headerImage from '../assets/Malitbog-header.png';

// bootstrap
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from "react-bootstrap/Button";
import {useNavigate} from "react-router-dom";

// Define the type for a Post based on your backend schema (from api/schemas.py)
interface PostSummary {
  id: number;
  title: string;
  content: string;
  primary_image_url: string | null;
  created_at: string;
  author: {
    username: string;
  };
}

// Get the API base URL from Vite environment variables (configured in Vercel)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


const LandingPage = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  return (
    <>
      <header className={styles.hero}>
        <img src={headerImage} alt="Barangay Malitbog Header" className={styles.heroImage} />
        <div className={styles.heroContent}>
          {/* Your hero content here */}
        </div>
      </header>
      <div className={styles.heroSpacer}></div>

      <main className={styles.mainContent}>
        <Container fluid>
          <div className={styles.announcementsSection}>
            <h1>Latest Announcements</h1>
            {loading && <p>Loading...</p>}
            {!loading && posts.length === 0 && <p>No announcements available yet.</p>}
            {!loading && posts.length > 0 && (
              <div className={styles.announcementsGrid}>
                {featuredPost && (
                  <Card onClick={() => setSelectedPostId(featuredPost.id)}>
                    <Card.Img
                      variant="top"
                      src={featuredPost.primary_image_url || 'https://placehold.co/800x400/EEE/31343C?text=No+Image'}
                      alt={featuredPost.title}
                      className={styles.featuredImage}
                      loading="lazy" />
                    <Card.Body>
                      <Card.Title>{featuredPost.title}</Card.Title>
                      <Card.Subtitle style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>
                        {new Date(featuredPost.created_at).toLocaleString() + " | " + featuredPost.author.username}
                      </Card.Subtitle>
                      <Card.Text>
                        {featuredPost.content}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                )}
                <div className={styles.postList}>
                  {otherPosts.map(post => (
                    <div onClick={() => setSelectedPostId(post.id)} key={post.id} className={styles.postListItem}>
                      <img src={post.primary_image_url || 'https://placehold.co/150x150/EEE/31343C?text=No+Image'} alt={post.title} loading="lazy" />
                      <div className={styles.postListItemContent}>
                        <h4>{post.title}</h4>
                        <p>{new Date(post.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <Button onClick={()=>{navigate('/announcements')}}>View more</Button>
                </div>
              </div>
            )}
          </div></Container>
      </main>

      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};

export default LandingPage;