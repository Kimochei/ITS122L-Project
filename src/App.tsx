import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/Adminlayout';

// Main Pages (Lazy Loaded for better performance)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'));
const DocumentRequestsPage = lazy(() => import('./pages/DocumentRequestsPage'));
const OfficialsPage = lazy(() => import('./pages/OfficialsPage'));
const About = lazy(() => import('./pages/About')); // Lazy load About page

// Admin Pages (Lazy Loaded)
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));
const AdminDocumentRequests = lazy(() => import('./pages/admin/AdminDocumentRequests'));
const AdminRequestDetails = lazy(() => import('./pages/admin/AdminRequestDetails'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminOfficialsPage = lazy(() => import('./pages/admin/AdminOfficialsPage'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));

// Test Page Import (Lazy Loaded)
const ApiTestPage = lazy(() => import('./pages/ApiTestPage'));

// A simple loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
    color: '#8B0000', // Dark Red
    backgroundColor: '#f4f4f9'
  }}>
    Loading...
  </div>
);

// Define all application routes
const routes = [
  // Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense> },
      { path: 'announcements', element: <Suspense fallback={<LoadingFallback />}><AnnouncementsPage /></Suspense> },
      { path: 'officials', element: <Suspense fallback={<LoadingFallback />}><OfficialsPage /></Suspense> },
      { path: 'document-requests', element: <Suspense fallback={<LoadingFallback />}><DocumentRequestsPage /></Suspense> },
      { path: 'about', element: <Suspense fallback={<LoadingFallback />}><About /></Suspense> },
    ],
  },
  // Authentication Routes (lazy-loaded for consistency)
  { path: '/signin', element: <Suspense fallback={<LoadingFallback />}><SignInPage /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<LoadingFallback />}><SignUpPage /></Suspense> },

  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/home" replace /> },
      { path: 'home', element: <Suspense fallback={<LoadingFallback />}><AdminHomePage /></Suspense> },
      { path: 'requests', element: <Suspense fallback={<LoadingFallback />}><AdminDocumentRequests /></Suspense> },
      { path: 'requests/view/:requestId', element: <Suspense fallback={<LoadingFallback />}><AdminRequestDetails /></Suspense> },
      { path: 'announcements', element: <Suspense fallback={<LoadingFallback />}><AdminAnnouncements /></Suspense> },
      { path: 'officials', element: <Suspense fallback={<LoadingFallback />}><AdminOfficialsPage /></Suspense> },
      { path: 'comments', element: <Suspense fallback={<LoadingFallback />}><AdminComments /></Suspense> },
      { path: 'logs', element: <Suspense fallback={<LoadingFallback />}><AdminLogs /></Suspense> },
    ],
  },
];

// Conditionally add the API Test Page route for development
if (import.meta.env.DEV) {
  routes.push({
    path: '/apitest',
    element: <Suspense fallback={<LoadingFallback />}><ApiTestPage /></Suspense>,
  });
}

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;