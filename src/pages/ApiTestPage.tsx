import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../pagestyles/ApiTestPage.module.css'; // This uses the same CSS as before

// Setup Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

const ApiTestPage = () => {
  // --- STATE MANAGEMENT ---
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<object | null>({ message: "Ready..." });
  const [loginStatus, setLoginStatus] = useState<string>("Not logged in.");

  // Generic Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [postId, setPostId] = useState('');
  const [commentId, setCommentId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [requestToken, setRequestToken] = useState('');

  // Form-specific inputs
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqType, setReqType] = useState('Barangay Certificate');
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqStatus, setReqStatus] = useState('Pending');


  // --- HOOKS ---
  useEffect(() => {
    if (authToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setLoginStatus(`Logged in as ${username}. Token is active.`);
    } else {
      delete api.defaults.headers.common['Authorization'];
      setLoginStatus("Not logged in.");
    }
  }, [authToken, username]);

  useEffect(() => {
    fetchPosts(); // Automatically load posts on page load
  }, []);

  // --- HELPER FUNCTIONS ---
  const handleApiResponse = (response: object) => {
    setApiResponse(response);
    console.log(response);
  };
  
  const handleError = (error: any) => {
    const errorData = error.response ? error.response.data : { message: error.message };
    handleApiResponse(errorData);
  }

  // --- API HANDLERS (Functions are the same as before) ---

  // 1. Register Admin
  const handleRegister = async () => {
    try {
      const response = await api.post('/register/', { username, email, password });
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 2. Login
  const handleLogin = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await api.post('/token', formData);
      setAuthToken(response.data.access_token);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 4. Get Pending Admins
  const fetchPendingAdmins = async () => {
    try {
      const response = await api.get('/admin/pending');
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 5. Approve Admin
  const handleApproveAdmin = async () => {
    try {
      const response = await api.put(`/admin/approve/${userId}`);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };
  
  // 6. Get Activity Logs
  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/admin/logs/');
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 7. Create Post
  const handleCreatePost = async () => {
    try {
        let primaryImageUrl = '';
        if (primaryImage) {
            const urlRes = await api.post(`/admin/generate-upload-url?file_name=${primaryImage.name}`);
            await axios.put(urlRes.data.signed_url, primaryImage, { headers: { 'Content-Type': primaryImage.type } });
            primaryImageUrl = urlRes.data.public_url;
        }

        const mediaItems = [];
        if (mediaFiles) {
            for (const file of Array.from(mediaFiles)) {
                const urlRes = await api.post(`/admin/generate-upload-url?file_name=${file.name}`);
                await axios.put(urlRes.data.signed_url, file, { headers: { 'Content-Type': file.type } });
                mediaItems.push({ url: urlRes.data.public_url, media_type: file.type.startsWith('video') ? 'video' : 'image' });
            }
        }
        
        const postData = { title: postTitle, content: postContent, primary_image_url: primaryImageUrl, media: mediaItems };
        const response = await api.post('/admin/posts/', postData);
        handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 8. Get All Posts
  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/');
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 9. Get Single Post
  const fetchSinglePost = async () => {
    try {
      const response = await api.get(`/posts/${postId}`);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 10. Update Post
  const handleUpdatePost = async () => {
    try {
      const response = await api.put(`/admin/posts/${postId}`, { title: postTitle, content: postContent });
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 11. Delete Post
  const handleDeletePost = async () => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 12. Create Comment
  const handleCreateComment = async () => {
    try {
      const response = await api.post(`/posts/${postId}/comments/`, { content: commentContent });
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 13. Delete Comment
  const handleDeleteComment = async () => {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 14. Submit Document Request
  const handleSubmitRequest = async () => {
    try {
      const response = await api.post('/document-requests/', { name: reqName, request_type: reqType, purpose: reqPurpose });
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 15. Check Document Request Status
  const handleCheckRequestStatus = async () => {
    try {
      const response = await api.get(`/document-requests/status/${requestToken}`);
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 16. Get All Document Requests
  const fetchAllRequests = async () => {
    try {
      // Bypassed auth for testing
      const response = await axios.get('http://localhost:8000/admin/requests/');
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };

  // 17. Update Document Request Status
  const handleUpdateRequestStatus = async () => {
    try {
      const response = await api.patch(`/admin/document-requests/${requestId}/status`, { status: reqStatus });
      handleApiResponse(response.data);
    } catch (error) { handleError(error); }
  };


  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.header}>API Test Page</h1>
      
      {/* STATUS BAR */}
      <div className={styles.statusBar} style={{ background: authToken ? '#a5d6a7' : '#ef9a9a', border: `1px solid ${authToken ? 'green' : 'red'}` }}>
        <strong>Status:</strong> {loginStatus}
      </div>

      {/* Main content grid starts here */}
      <div className={styles.mainGrid}>
        
        {/* ADMIN & AUTH (Column 1) */}
        <div className={styles.apiSection}>
          <h2>Admin & Authentication</h2>
          <div className={styles.formGrid}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} />
            <button onClick={handleLogin} className={styles.button}>2. Login</button>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
            <button onClick={handleRegister} className={styles.button} style={{gridColumn: '1 / -1'}}>1. Register Admin</button>
            <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #34495e'}}/>
            <input type="text" placeholder="User ID to Approve" value={userId} onChange={(e) => setUserId(e.target.value)} className={styles.input} />
            <button onClick={handleApproveAdmin} className={styles.button}>5. Approve Admin</button>
            <button onClick={fetchPendingAdmins} className={styles.button} style={{gridColumn: '1 / -1'}}>4. Get Pending Admins</button>
            <button onClick={fetchActivityLogs} className={styles.button} style={{gridColumn: '1 / -1'}}>6. Get Activity Logs</button>
          </div>
        </div>

        {/* POSTS & COMMENTS (Column 2) */}
        <div className={styles.apiSection}>
          <h2>Posts & Comments</h2>
          <div className={styles.formGrid}>
            <input type="text" placeholder="Post Title" value={postTitle} onChange={e => setPostTitle(e.target.value)} className={styles.fullWidth} />
            <textarea placeholder="Post Content" value={postContent} onChange={e => setPostContent(e.target.value)} className={styles.fullWidth} />
            <div className={styles.fullWidth}>
              <label>Primary Image: </label>
              <input type="file" accept="image/*" onChange={e => setPrimaryImage(e.target.files ? e.target.files[0] : null)} />
            </div>
            <div className={styles.fullWidth}>
              <label>Gallery Files: </label>
              <input type="file" multiple accept="image/*,video/*" onChange={e => setMediaFiles(e.target.files)} />
            </div>
            <button onClick={handleCreatePost} className={styles.button} style={{gridColumn: '1 / -1'}}>7. Create Post</button>
            <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #34495e'}}/>
            <input type="text" placeholder="Post ID (for actions)" value={postId} onChange={(e) => setPostId(e.target.value)} className={styles.input} />
            <button onClick={fetchSinglePost} className={styles.button}>9. Get Single Post</button>
            <button onClick={handleDeletePost} className={styles.button}>11. Delete Post</button>
            <button onClick={handleUpdatePost} className={styles.button}>10. Update Post</button>
            <textarea placeholder="Comment Content" value={commentContent} onChange={e => setCommentContent(e.target.value)} className={styles.fullWidth} />
            <button onClick={handleCreateComment} className={styles.button} style={{gridColumn: '1 / -1'}}>12. Create Comment</button>
            <input type="text" placeholder="Comment ID to Delete" value={commentId} onChange={(e) => setCommentId(e.target.value)} className={styles.input} />
            <button onClick={handleDeleteComment} className={styles.button}>13. Delete Comment</button>
            <button onClick={fetchPosts} className={styles.button} style={{gridColumn: '1 / -1'}}>8. Get All Posts</button>
          </div>
        </div>

        {/* DOCUMENT REQUESTS (Full Width) */}
        <div className={`${styles.apiSection} ${styles.fullWidth}`}>
          <h2>Document Requests</h2>
          <div className={styles.formGrid}>
            <input type="text" placeholder="Full Name" value={reqName} onChange={e => setReqName(e.target.value)} className={styles.input} />
            <input type="text" placeholder="Purpose" value={reqPurpose} onChange={e => setReqPurpose(e.target.value)} className={styles.input} />
            <select value={reqType} onChange={e => setReqType(e.target.value)} className={styles.fullWidth}>
                <option>Barangay Certificate</option><option>Certificate of Indigency</option><option>Business Permit</option>
            </select>
            <button onClick={handleSubmitRequest} className={styles.button} style={{gridColumn: '1 / -1'}}>14. Submit Request</button>
            <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #34495e'}}/>
            <input type="text" placeholder="Request Token" value={requestToken} onChange={e => setRequestToken(e.target.value)} className={styles.input} />
            <button onClick={handleCheckRequestStatus} className={styles.button}>15. Check Status by Token</button>
            <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #34495e'}}/>
            <input type="text" placeholder="Request ID (Admin)" value={requestId} onChange={e => setRequestId(e.target.value)} className={styles.input}/>
            <select value={reqStatus} onChange={e => setReqStatus(e.target.value)} className={styles.input}>
                <option>Pending</option><option>Approved</option><option>Rejected</option><option>Completed</option>
            </select>
            <button onClick={handleUpdateRequestStatus} className={styles.button} style={{gridColumn: '1 / -1'}}>17. Update Status (Admin)</button>
            <button onClick={fetchAllRequests} className={styles.button} style={{gridColumn: '1 / -1'}}>16. Get All Requests (Auth Bypassed)</button>
          </div>
        </div>

        {/* API RESPONSE (Full Width) */}
        <div className={`${styles.apiSection} ${styles.fullWidth}`}>
          <h2>API Response</h2>
          <pre className={styles.response}>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
        
      </div>
    </div>
  );
};

export default ApiTestPage;