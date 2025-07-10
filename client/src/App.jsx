import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatDemo from './components/chat/ChatDemo';
import ChatTest from './components/chat/ChatTest';
import ChatPage from './pages/chat/ChatPage';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Bookmarks from './pages/Bookmarks';
import TutorList from './pages/tutors/TutorList';
import TutorProfile from './pages/tutors/TutorProfile';
import Sessions from './pages/sessions/Sessions';
import SessionRoom from './pages/sessions/SessionRoom';
import SessionDetails from './pages/sessions/SessionDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Static Pages
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Safety from './pages/Safety';
import Community from './pages/Community';
import Pricing from './pages/Pricing';
import CookiePolicy from './pages/CookiePolicy';
import RefundPolicy from './pages/RefundPolicy';
import Accessibility from './pages/Accessibility';

// Styles
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToTop />
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/tutors" element={<TutorList />} />
                <Route path="/tutors/:id" element={<TutorProfile />} />

                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<FAQ />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/community" element={<Community />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/accessibility" element={<Accessibility />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                <Route path="/users/bookmarks" element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                } />

                <Route path="/sessions" element={
                  <ProtectedRoute>
                    <Sessions />
                  </ProtectedRoute>
                } />

                <Route path="/sessions/:id" element={
                  <ProtectedRoute>
                    <SessionDetails />
                  </ProtectedRoute>
                } />

                <Route path="/sessions/:id/room" element={
                  <ProtectedRoute>
                    <SessionRoom />
                  </ProtectedRoute>
                } />

                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />

                <Route path="/chat-test" element={
                  <ProtectedRoute>
                    <ChatTest />
                  </ProtectedRoute>
                } />

                <Route path="/chat-demo" element={
                  <ProtectedRoute>
                    <ChatDemo />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
