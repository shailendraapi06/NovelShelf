import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';

// Public Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReadingRoomPage from './pages/ReadingRoomPage';
import ContributePage from './pages/ContributePage';
import MyLibraryPage from './pages/MyLibraryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminContributionsPage from './pages/admin/AdminContributionsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }) {
  const { pathname } = useLocation();
  const isReader = pathname.startsWith('/reader');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        {children}
        <Toast />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden">
      <Header />
      <main className="w-full pt-16 sm:pt-20 bg-surface min-h-[calc(100vh-20rem)] flex-1 overflow-x-hidden">
        {children}
      </main>
      {!isReader && <Footer />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/books/:bookId" element={<BookDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes: Reading strictly requires login */}
              <Route 
                path="/reader" 
                element={
                  <ProtectedRoute>
                    <ReadingRoomPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reader/:bookId" 
                element={
                  <ProtectedRoute>
                    <ReadingRoomPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Route: Contributing PDF requires login */}
              <Route 
                path="/contribute" 
                element={
                  <ProtectedRoute>
                    <ContributePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/my-library" element={<MyLibraryPage />} />

              {/* Legacy Exchange Redirect to Explore */}
              <Route path="/exchange" element={<Navigate to="/explore" replace />} />
              <Route path="/exchange/*" element={<Navigate to="/explore" replace />} />

              {/* Professional Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="books" element={<AdminBooksPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="contributions" element={<AdminContributionsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="logs" element={<AdminLogsPage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </LibraryProvider>
    </AuthProvider>
  );
}
