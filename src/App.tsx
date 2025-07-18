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
import OfficialsPage from './pages/OfficialsPage'; // 

// Admin Pages
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminDocumentRequests from './pages/admin/AdminDocumentRequests';
import AdminRequestDetails from './pages/admin/AdminRequestDetails';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminOfficialsPage from './pages/admin/AdminOfficialsPage'; // 

// Placeholders for future pages
const AdminComments = () => <div><h2>Manage Comments</h2></div>;
const AdminLogs = () => <div><h2>Manage Activity Logs</h2></div>;
const About = () => <div>About Us Page</div>;
const Contact = () => <div>Contact Us Page</div>;

// Test Page Import
import ApiTestPage from './pages/ApiTestPage';

// Define all application routes
const routes = [
  // Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'officials', element: <OfficialsPage /> }, // <-- UPDATED: Using the real component
      { path: 'document-requests', element: <DocumentRequestsPage /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  // Authentication Routes
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },

  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/home" replace /> },
      { path: 'home', element: <AdminHomePage /> },
      { path: 'requests', element: <AdminDocumentRequests /> },
      { path: 'requests/view/:requestId', element: <AdminRequestDetails /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'officials', element: <AdminOfficialsPage /> }, // 
      { path: 'comments', element: <AdminComments /> },
      { path: 'logs', element: <AdminLogs /> },
    ],
  },
];

// Conditionally add the API Test Page route for development
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
