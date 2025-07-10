import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Calendar,
  MessageCircle,
  Star,
  Target,
  Trophy,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={16} className="badge-icon" />
              <span>Trusted by 10,000+ Students</span>
            </div>
            <h1 className="hero-title">
              Find Your Perfect Tutor, <br />
              <span className="text-primary">Achieve Your Goals</span>
            </h1>
            <p className="hero-description">
              Connect with qualified tutors for personalized learning experiences.
              Whether you're a student seeking help or a tutor ready to teach,
              TutorMatch makes learning accessible and effective.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Students</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Expert Tutors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
            <div className="hero-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <span>Get Started</span>
                    <TrendingUp size={20} />
                  </Link>
                  <Link to="/tutors" className="btn btn-outline btn-lg">
                    <Search size={20} />
                    <span>Find Tutors</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <span>Go to Dashboard</span>
                    <TrendingUp size={20} />
                  </Link>
                  <Link to="/tutors" className="btn btn-outline btn-lg">
                    <Search size={20} />
                    <span>Browse Tutors</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning together"
                className="hero-main-image"
              />
              <div className="floating-elements">
                <div className="floating-card card-1">
                  <div className="card-icon">
                    <BookOpen size={18} />
                  </div>
                  <span>Learn</span>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon">
                    <Target size={18} />
                  </div>
                  <span>Achieve</span>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon">
                    <Award size={18} />
                  </div>
                  <span>Excel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Trophy size={16} />
              <span>Premium Features</span>
            </div>
            <h2 className="section-title text-center">Why Choose TutorMatch?</h2>
            <p className="section-subtitle">
              Experience the future of personalized learning with our cutting-edge platform
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card featured">
              <div className="feature-icon">
                <Search size={32} />
              </div>
              <h3>Find Qualified Tutors</h3>
              <p>Browse through our verified tutors with proven expertise in their subjects.</p>
              <div className="feature-highlight">Verified Experts</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={32} />
              </div>
              <h3>Flexible Scheduling</h3>
              <p>Book sessions that fit your schedule with our easy-to-use booking system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MessageCircle size={32} />
              </div>
              <h3>Real-time Communication</h3>
              <p>Chat with your tutor and join video sessions for interactive learning.</p>
            </div>
            <div className="feature-card featured">
              <div className="feature-icon">
                <Star size={32} />
              </div>
              <h3>Quality Assurance</h3>
              <p>Read reviews and ratings to choose the best tutor for your needs.</p>
              <div className="feature-highlight">5-Star Rated</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Target size={32} />
              </div>
              <h3>Personalized Learning</h3>
              <p>Get customized lessons tailored to your learning style and goals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Trophy size={32} />
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your learning journey and celebrate your achievements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Target size={16} />
              <span>Simple Process</span>
            </div>
            <h2 className="section-title text-center">How It Works</h2>
            <p className="section-subtitle">
              Get started in three simple steps and begin your learning journey today
            </p>
          </div>
          <div className="steps-container">
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign Up</h3>
                  <p>Create your account as a student or tutor in just a few minutes.</p>
                  <div className="step-features">
                    <span>✓ Quick registration</span>
                    <span>✓ Profile verification</span>
                  </div>
                </div>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Find & Connect</h3>
                  <p>Browse tutors or wait for students to find you. Send session requests.</p>
                  <div className="step-features">
                    <span>✓ Smart matching</span>
                    <span>✓ Instant booking</span>
                  </div>
                </div>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Learn & Grow</h3>
                  <p>Attend sessions, chat with your tutor, and achieve your learning goals.</p>
                  <div className="step-features">
                    <span>✓ Live sessions</span>
                    <span>✓ Progress tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-background">
          <div className="cta-gradient"></div>
        </div>
        <div className="container">
          <div className="cta-content">
            <div className="cta-badge">
              <Award size={16} />
              <span>Join Our Community</span>
            </div>
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of students and tutors who are already part of our community.</p>
            <div className="cta-stats">
              <div className="cta-stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
              <div className="cta-stat">
                <strong>100+</strong>
                <span>Subjects</span>
              </div>
              <div className="cta-stat">
                <strong>50K+</strong>
                <span>Sessions</span>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="cta-actions">
                <Link to="/register?role=student" className="btn btn-primary btn-lg">
                  <span>I'm a Student</span>
                  <BookOpen size={20} />
                </Link>
                <Link to="/register?role=tutor" className="btn btn-outline btn-lg">
                  <Trophy size={20} />
                  <span>I'm a Tutor</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
