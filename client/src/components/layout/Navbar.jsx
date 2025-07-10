import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatarUrl } from '../../utils/helpers';
import NotificationBell from '../notifications/NotificationBell';
import {
  GraduationCap,
  User,
  BookOpen,
  Settings,
  LogOut
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isTutor, isStudent } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">
            <GraduationCap size={24} />
          </span>
          <span className="logo-text">TutorMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {!isAdmin() && (
            <Link
              to="/about"
              className={`navbar-link ${isActivePath('/about') ? 'active' : ''}`}
            >
              About Us
            </Link>
          )}

          <Link
            to="/how-it-works"
            className={`navbar-link ${isActivePath('/how-it-works') ? 'active' : ''}`}
          >
            How It Works
          </Link>

          {!isTutor() && (
            <Link
              to="/tutors"
              className={`navbar-link ${isActivePath('/tutors') ? 'active' : ''}`}
            >
              Find Tutors
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActivePath('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>

              <Link
                to="/sessions"
                className={`navbar-link ${isActivePath('/sessions') ? 'active' : ''}`}
              >
                Sessions
              </Link>


            </>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              {/* Notifications */}
              <NotificationBell />

              {/* User Profile Menu */}
              <div className="profile-menu">
                <button 
                  className="profile-btn"
                  onClick={toggleProfileMenu}
                >
                  <img 
                    src={getAvatarUrl(user)} 
                    alt={user?.firstName}
                    className="profile-avatar"
                  />
                  <span className="profile-name">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <span className={`role-badge role-${user?.role}`}>
                        {user?.role}
                      </span>
                    </div>

                    <div className="dropdown-divider"></div>
                    
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User size={16} /> Profile
                    </Link>

                    {isStudent() && (
                      <Link
                        to="/users/bookmarks"
                        className="dropdown-item"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <BookOpen size={16} /> Bookmarks
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} /> Settings
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMenu}
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {!isAdmin() && (
            <Link
              to="/about"
              className="mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
          )}

          <Link
            to="/how-it-works"
            className="mobile-link"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>

          {!isTutor() && (
            <Link
              to="/tutors"
              className="mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Tutors
            </Link>
          )}
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              <Link 
                to="/sessions" 
                className="mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              
              <Link 
                to="/profile" 
                className="mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              

              
              <button 
                className="mobile-link logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
