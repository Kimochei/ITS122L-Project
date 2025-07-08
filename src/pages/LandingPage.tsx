import React from 'react';
import { Link } from 'react-router-dom';
import '../pagestyles/LandingPage.css'; 

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page-container">
      <h1>Welcome to sKonnect!</h1>
      <p>This is the default landing page for your application.</p>
      <p>The backend is running and ready for the real frontend to be built.</p>
      <br />
      <p>
        You can manually navigate to the API test page or click the link below.
      </p>
      <Link to="/api-test" className="landing-page-link">
        Go to API Test Page
      </Link>
    </div>
  );
};

export default LandingPage;
