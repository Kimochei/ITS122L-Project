import React, { useState, useEffect } from 'react';
import styles from '../pagestyles/LandingPage.module.css';
import PostModal from '../components/PostModal'; // Import the new reusable component
import headerImage from '../assets/Malitbog-header.png'; // Import the header image

interface PostSummary {
  id: number;
  title: string;
  primary_image_url: string | null;
  created_at: string;
}

const LandingPage = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/posts/');
        if (!response.ok) throw new Error('Failed to fetch posts.');
        const data = await response.json();
        setPosts(data);
      } catch (error) { console.error("Error fetching posts:", error); }
      finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  return (
    <>
      <header className={styles.hero}>
        {/* Using the img tag for the header photo as requested */}
        <img src={headerImage} alt="Barangay Malitbog Header" className={styles.heroImage} />
        <div className={styles.heroContent}>
          
        </div>
      </header>
      <div className={styles.heroSpacer}></div> {/* NEW SPACER: Pushes content down as .hero is absolute */}

      <main className={styles.mainContent}>
        <div className={styles.announcementsSection}>
          <h2>Latest Announcements</h2>
          {loading && <p>Loading...</p>}
          {!loading && posts.length > 0 && (
            <div className={styles.announcementsGrid}>
              <div onClick={() => setSelectedPostId(featuredPost.id)} className={styles.featuredPost}>
                <img src={featuredPost.primary_image_url || 'https://via.placeholder.com/800x400.png?text=No+Image'} alt={featuredPost.title} className={styles.featuredImage} />
                <h3>{featuredPost.title}</h3>
                <p>{new Date(featuredPost.created_at).toLocaleString()}</p>
              </div>
              <div className={styles.postList}>
                {otherPosts.map(post => (
                  <div onClick={() => setSelectedPostId(post.id)} key={post.id} className={styles.postListItem}>
                    <img src={post.primary_image_url || 'https://via.placeholder.com/150x150.png?text=No+Image'} alt={post.title} />
                    <div className={styles.postListItemContent}>
                      <h4>{post.title}</h4>
                      <p>{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Use the new reusable component here */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};

export default LandingPage;