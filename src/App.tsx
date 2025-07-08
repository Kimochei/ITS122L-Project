import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ApiTestPage from './pages/ApiTestPage'; // Import your new page

function App() {
  return (
    <Router>
      <Routes>
        {/* Set the test page as the main route */}
        <Route path="/" element={<ApiTestPage />} />
        
        {/* You can add other routes here later */}
        {/* <Route path="/home" element={<HomePage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;