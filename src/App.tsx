import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/Adminlayout';

// Main Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import DocumentRequestsPage from './pages/DocumentRequestsPage';

// Admin Pages
import AdminDocumentRequests from './pages/admin/AdminDocumentRequests';
const AdminAnnouncements = () => <div><h2>Manage Announcements</h2></div>; // Placeholder
const AdminComments = () => <div><h2>Manage Comments</h2></div>; // Placeholder
const AdminLogs = () => <div><h2>Manage Activity Logs</h2></div>; // Placeholder
import AdminHomePage from './pages/admin/AdminHomePage';

// Other placeholders
const Officials = () => <div>Barangay Officials Page</div>;
const About = () => <div>About Us Page</div>;
const Contact = () => <div>Contact Us Page</div>;

// ========= THE TEST PAGE IMPORT =========
import ApiTestPage from './pages/ApiTestPage';

// Define all routes for the application
const routes = [
  // --- Public Routes ---
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'officials', element: <Officials /> },
      { path: 'document-requests', element: <DocumentRequestsPage /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  // --- Auth Routes ---
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },

  // --- Admin Routes ---
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHomePage /> }, 
      { path: 'home', element: <AdminHomePage /> },
      { path: 'requests', element: <AdminDocumentRequests /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'comments', element: <AdminComments /> },
      { path: 'logs', element: <AdminLogs /> },
    ],
  },
];

// --- Conditionally add the API Test Page route ---
// This is the critical part. It adds the /apitest route ONLY in development mode.
if (import.meta.env.DEV) {
  routes.push({
    path: '/apitest',
    element: <ApiTestPage />,
  });
}

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;