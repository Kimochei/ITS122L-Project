import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your .tsx pages from the 'pages' directory
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage'; // Updated import name and file path
import ApiTestPage from './pages/ApiTestPage';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        {}
        <nav style={{ padding: '10px', background: '#f0f0f0', textAlign: 'center' }}>
          <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
          <Link to="/admin" style={{ margin: '0 10px' }}>Admin</Link>
          <Link to="/testing" style={{ margin: '0 10px' }}>API Testing Page</Link>
        </nav>

        <hr />

        {/* Route Configuration */}
        <Routes>
          {/* Default Route: Shows the LandingPage */}
          <Route path="/" element={<LandingPage />} />

          {/* Admin Route: Shows the newly named AdminPage */}
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Route to access your testing page */}
          <Route path="/testing" element={<ApiTestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;