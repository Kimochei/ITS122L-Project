import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../pagestyles/ApiTestPage.module.css';
import Modal from '../components/Modal'; // Assuming Modal.tsx is in src/components/

const API_URL = 'http://localhost:8000';

// Define types for better state management
interface FilePreview {
  file: File;
  previewUrl: string;
}
interface UploadedImage {
  fileName: string;
  publicUrl: string;
}
interface DocumentRequest {
  full_name: string;
  request_type: string;
  purpose: string;
  id: number;
  status: string;
  submitted_at: string;
}

const ApiTestPage: React.FC = () => {
  // State for Admin management
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // State for Post creation
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // State for Comment creation
  const [commentContent, setCommentContent] = useState('');
  const [commentPostId, setCommentPostId] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');

  // State for Document Request
  const [docFullName, setDocFullName] = useState('');
  const [docRequestType, setDocRequestType] = useState('');
  const [docPurpose, setDocPurpose] = useState('');
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);

  // State for API interaction and display
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');
  const [posts, setPosts] = useState<any[]>([]);

  // State for Modal pop-ups
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // --- HANDLER FUNCTIONS ---

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/register/`, {
        username: registerUsername, email: registerEmail, password: registerPassword,
      });
      setApiResponse(response.data);
      setModalContent(`Admin "${response.data.username}" registered! If this is the first admin, they are auto-approved. Otherwise, an existing admin must approve them.`);
      setIsModalOpen(true);
      setApiError('');
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
      setApiResponse(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginData = new URLSearchParams();
    loginData.append('username', loginUsername);
    loginData.append('password', loginPassword);
    try {
      const response = await axios.post(`${API_URL}/token`, loginData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setAccessToken(response.data.access_token);
      setApiResponse(response.data);
      setApiError('');
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
      setApiResponse(null);
    }
  };
  
  const handleLogout = () => {
    setAccessToken(null);
    setApiResponse({ detail: "Successfully logged out." });
    setApiError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filePreviews = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setSelectedFiles(prev => [...prev, ...filePreviews]);
    }
  };

  const handleConfirmUpload = async (file: File) => {
    if (!accessToken) {
      setApiError('You must be logged in to upload files.');
      return;
    }
    try {
      // 1. Get the pre-signed URL and the final public URL from our backend
      const urlResponse = await axios.post(
        `${API_URL}/admin/generate-upload-url?file_name=${file.name}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const { signed_url, public_url } = urlResponse.data;

      // 2. Upload the file directly to Supabase using the signed URL
      await axios.put(signed_url, file, {
        headers: { 'Content-Type': file.type }
      });
      
      // 3. Use the public_url provided by the backend
      const newImage = { fileName: file.name, publicUrl: public_url };
      setUploadedImages(prev => [...prev, newImage]);

    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setApiError('You must log in first.');
      return;
    }
    try {
      const imageUrls = uploadedImages.map(img => img.publicUrl);
      const response = await axios.post(`${API_URL}/admin/posts/`, {
        title: postTitle,
        content: postContent,
        image_urls: imageUrls,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setApiResponse(response.data);
      setApiError('');
      setPostTitle('');
      setPostContent('');
      setSelectedFiles([]);
      setUploadedImages([]);
      setModalContent('Post created successfully!');
      setIsModalOpen(true);
      handleFetchPosts();
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentPostId) {
      setApiError('Please provide a Post ID for the comment.');
      return;
    }
    const payload: { content: string; author_name?: string } = {
      content: commentContent,
    };
    if (commentAuthorName) {
      payload.author_name = commentAuthorName;
    }
    try {
      const response = await axios.post(`${API_URL}/posts/${commentPostId}/comments/`, payload);
      setApiResponse(response.data);
      setApiError('');
      setCommentContent('');
      setCommentAuthorName('');
      handleFetchPosts();
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
      setApiResponse(null);
    }
   };

   const handleFetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/`);
      setPosts(response.data);
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
    }
  };

  const handleSubmitDocumentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/requests/`, {
        full_name: docFullName,
        request_type: docRequestType,
        purpose: docPurpose,
      });
      setApiResponse(response.data);
      setModalContent('Document request submitted successfully!');
      setIsModalOpen(true);
      setApiError('');
      setDocFullName('');
      setDocRequestType('');
      setDocPurpose('');
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
      setApiResponse(null);
    }
  };

  const handleFetchDocumentRequests = async () => {
    if (!accessToken) {
      setApiError('You must be logged in as an admin to view requests.');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/admin/requests/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDocumentRequests(response.data);
    } catch (error: any) {
      setApiError(JSON.stringify(error.response?.data, null, 2));
    }
  };

  useEffect(() => {
    handleFetchPosts();
  }, []);

  return (
    <div className={styles.page}>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3>Notification</h3>
          <p>{modalContent}</p>
      </Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1> FastAPI Backend Test Page</h1>
        {accessToken && (
          <button onClick={handleLogout} className={styles.button} style={{ background: '#dc3545' }}>
            Logout
          </button>
        )}
      </div>
      {accessToken && <p style={{background: 'lightgreen', padding: '10px', borderRadius: '5px'}}>✅ Logged In! You can now use protected endpoints.</p>}

      <div className={styles.container}>
        <div className={styles.formColumn}>
          <form onSubmit={handleRegisterAdmin} className={styles.form}>
            <h2>1. Register New Admin</h2>
            <input type="text" placeholder="Username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required className={styles.input} />
            <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required className={styles.input} />
            <input type="password" placeholder="Password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required className={styles.input} />
            <button type="submit" className={styles.button}>Register Admin</button>
          </form>

          <form onSubmit={handleLogin} className={styles.form}>
            <h2>2. Login as Admin</h2>
            <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required className={styles.input} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={styles.input} />
            <button type="submit" className={styles.button}>Login</button>
          </form>

          <form onSubmit={handleCreatePost} className={styles.form}>
            <h2>3. Create New Post (Requires Login)</h2>
            <input type="text" placeholder="Post Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required className={styles.input} />
            <textarea placeholder="Post Content" value={postContent} onChange={(e) => setPostContent(e.target.value)} required className={styles.textarea} />
            <label htmlFor="file-upload" className={styles.uploadLabel}>Select Images</label>
            <input id="file-upload" type="file" multiple onChange={handleFileSelect} style={{display: 'none'}} />
            <div className={styles.previewContainer}>
              {selectedFiles.map((filePreview, index) => {
                const isUploaded = uploadedImages.some(img => img.fileName === filePreview.file.name);
                return (
                  <div key={index} className={styles.previewItem}>
                    <img src={filePreview.previewUrl} alt="Preview" className={styles.previewImage} />
                    <span>{filePreview.file.name}</span>
                    {!isUploaded ? (
                      <button type="button" onClick={() => handleConfirmUpload(filePreview.file)}>Confirm Upload</button>
                    ) : (
                      <span className={styles.uploadedText}>✓ Uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="submit" className={styles.button}>Finalize & Create Post</button>
          </form>

          <form onSubmit={handleCreateComment} className={styles.form}>
            <h2>Create New Comment</h2>
            <input type="number" placeholder="Post ID to comment on" value={commentPostId} onChange={(e) => setCommentPostId(e.target.value)} required className={styles.input} />
            <input type="text" placeholder="Your Name (Optional)" value={commentAuthorName} onChange={(e) => setCommentAuthorName(e.target.value)} className={styles.input} />
            <textarea placeholder="Comment Content" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} required className={styles.textarea} />
            <button type="submit" className={styles.button}>Create Comment</button>
          </form>

          <form onSubmit={handleSubmitDocumentRequest} className={styles.form}>
            <h2>Submit Document Request</h2>
            <input type="text" placeholder="Full Name" value={docFullName} onChange={(e) => setDocFullName(e.target.value)} required className={styles.input} />
            <input type="text" placeholder="Request Type (e.g., Barangay Clearance)" value={docRequestType} onChange={(e) => setDocRequestType(e.target.value)} required className={styles.input} />
            <textarea placeholder="Purpose" value={docPurpose} onChange={(e) => setDocPurpose(e.target.value)} required className={styles.textarea} />
            <button type="submit" className={styles.button}>Submit Request</button>
          </form>
        </div>
        
        <div className={styles.responseColumn}>
          <h2>API Response</h2>
          <div className={styles.responseBox}>
            {apiResponse && <pre className={styles.pre}>{JSON.stringify(apiResponse, null, 2)}</pre>}
            {apiError && <pre className={`${styles.pre} ${styles.errorText}`}>{apiError}</pre>}
          </div>
        </div>
      </div>

      <hr style={{margin: '40px 0'}}/>

      <div className={styles.postsSection}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <h2>Live Posts Feed</h2>
          <button onClick={handleFetchPosts} className={styles.button}>Refresh Posts</button>
        </div>
        {posts.length > 0 ? (
          posts.map((post) => {
            const sortedComments = [...post.comments].sort((a, b) => a.is_flagged - b.is_flagged);
            return (
              <div key={post.id} className={styles.post}>
                <h3>{post.title} (ID: {post.id})</h3>
                <p className={styles.postMeta}>by {post.author.username} on {new Date(post.created_at).toLocaleString()}</p>
                <p className={styles.postContent}>{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className={styles.imageContainer}>
                    {post.images.map((image: any) => (
                      <img key={image.id} src={image.url} alt="Post" className={styles.postImage} />
                    ))}
                  </div>
                )}
                <h4>Comments:</h4>
                <div className={styles.commentsContainer}>
                  {sortedComments.length > 0 ? (
                    sortedComments.map((comment: any) => (
                      <div key={comment.id} className={styles.comment}>
                         <strong>{comment.author_name}:</strong>
                         <p>{comment.content}</p>
                         {comment.is_flagged && <span className={styles.flagged}> (Flagged for Review)</span>}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No posts found. Create one to see it here!</p>
        )}
      </div>
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.postsSection}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <h2>Document Requests (Admin View)</h2>
              <button onClick={handleFetchDocumentRequests} className={styles.button}>
                  Fetch Document Requests
              </button>
          </div>
          {documentRequests.length > 0 ? (
              documentRequests.map((request) => (
                  <div key={request.id} className={styles.post}>
                      <h3>Request ID: {request.id}</h3>
                      <p><strong>Name:</strong> {request.full_name}</p>
                      <p><strong>Type:</strong> {request.request_type}</p>
                      <p><strong>Purpose:</strong> {request.purpose}</p>
                      <p><strong>Status:</strong> {request.status}</p>
                      <p><strong>Submitted:</strong> {new Date(request.submitted_at).toLocaleString()}</p>
                  </div>
              ))
          ) : (
              <p>No document requests found or you are not logged in as an admin.</p>
          )}
      </div>

    </div>
  );
};

export default ApiTestPage;