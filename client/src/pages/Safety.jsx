import React from 'react';
import { Shield, AlertTriangle, Eye, Lock, Users, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import './Safety.css';

const Safety = () => {
  return (
    <div className="safety-page">
      <div className="container">
        {/* Hero Section */}
        <div className="safety-hero">
          <div className="hero-content">
            <Shield className="hero-icon" size={64} />
            <h1>Safety Guidelines</h1>
            <p>Your safety and security are our top priorities. Learn how we protect our community and how you can stay safe while using TutorMatch.</p>
          </div>
        </div>

        {/* Safety Principles */}
        <section className="safety-section">
          <h2>Our Safety Principles</h2>
          <div className="principles-grid">
            <div className="principle-card">
              <Shield className="principle-icon" />
              <h3>Verified Tutors</h3>
              <p>All tutors undergo background checks and credential verification before joining our platform.</p>
            </div>
            <div className="principle-card">
              <Lock className="principle-icon" />
              <h3>Secure Platform</h3>
              <p>End-to-end encryption for all communications and secure payment processing.</p>
            </div>
            <div className="principle-card">
              <Eye className="principle-icon" />
              <h3>Monitored Sessions</h3>
              <p>All sessions are logged and can be reviewed for quality and safety purposes.</p>
            </div>
            <div className="principle-card">
              <Users className="principle-icon" />
              <h3>Community Standards</h3>
              <p>Clear guidelines and zero tolerance for inappropriate behavior.</p>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="safety-section">
          <h2>Safety Tips for Students</h2>
          <div className="tips-list">
            <div className="tip-item">
              <CheckCircle className="tip-icon" />
              <div>
                <h4>Choose Verified Tutors</h4>
                <p>Always select tutors with verified badges and positive reviews.</p>
              </div>
            </div>
            <div className="tip-item">
              <CheckCircle className="tip-icon" />
              <div>
                <h4>Use Platform Communication</h4>
                <p>Keep all communication within the TutorMatch platform for your protection.</p>
              </div>
            </div>
            <div className="tip-item">
              <CheckCircle className="tip-icon" />
              <div>
                <h4>Meet in Public Spaces</h4>
                <p>For in-person sessions, always meet in public, well-lit locations.</p>
              </div>
            </div>
            <div className="tip-item">
              <CheckCircle className="tip-icon" />
              <div>
                <h4>Trust Your Instincts</h4>
                <p>If something feels wrong, end the session and report it immediately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="safety-section">
          <h2>Report Safety Concerns</h2>
          <div className="reporting-info">
            <div className="report-card">
              <AlertTriangle className="report-icon" />
              <h3>Emergency Situations</h3>
              <p>If you're in immediate danger, contact local emergency services first.</p>
              <div className="emergency-number">
                <Phone size={20} />
                <span>Emergency: 911</span>
              </div>
            </div>
            <div className="report-card">
              <MessageCircle className="report-icon" />
              <h3>Report to TutorMatch</h3>
              <p>Report any safety concerns, inappropriate behavior, or policy violations.</p>
              <button className="btn btn-primary">
                <MessageCircle size={16} />
                Report Issue
              </button>
            </div>
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="safety-section">
          <h2>Community Guidelines</h2>
          <div className="guidelines-content">
            <div className="guideline-category">
              <h3>Respectful Communication</h3>
              <ul>
                <li>Treat all community members with respect and kindness</li>
                <li>Use appropriate language in all communications</li>
                <li>Respect cultural differences and diverse backgrounds</li>
                <li>No harassment, bullying, or discriminatory behavior</li>
              </ul>
            </div>
            <div className="guideline-category">
              <h3>Professional Conduct</h3>
              <ul>
                <li>Maintain professional boundaries in all interactions</li>
                <li>Focus on educational content and learning objectives</li>
                <li>Respect privacy and confidentiality</li>
                <li>No solicitation of personal information or off-platform contact</li>
              </ul>
            </div>
            <div className="guideline-category">
              <h3>Platform Usage</h3>
              <ul>
                <li>Use the platform only for its intended educational purposes</li>
                <li>No spam, advertising, or promotional content</li>
                <li>Respect intellectual property rights</li>
                <li>Follow all terms of service and platform policies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="safety-cta">
          <h2>Need Help?</h2>
          <p>Our safety team is available 24/7 to assist with any concerns or questions.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary">
              <MessageCircle size={16} />
              Contact Safety Team
            </button>
            <a href="mailto:safety@tutormatch.com" className="btn btn-outline">
              safety@tutormatch.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Safety;
