import React from 'react';
import { Cookie, Settings, Shield, Eye } from 'lucide-react';
import './PolicyPage.css';

const CookiePolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-hero">
          <Cookie className="hero-icon" size={64} />
          <h1>Cookie Policy</h1>
          <p>Learn how we use cookies to improve your experience on TutorMatch</p>
          <div className="last-updated">Last updated: December 2024</div>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>What Are Cookies?</h2>
            <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our services.</p>
          </section>

          <section className="policy-section">
            <h2>Types of Cookies We Use</h2>
            
            <div className="cookie-types">
              <div className="cookie-type">
                <Shield className="cookie-icon" />
                <h3>Essential Cookies</h3>
                <p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
                <ul>
                  <li>Authentication and login status</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                </ul>
              </div>

              <div className="cookie-type">
                <Settings className="cookie-icon" />
                <h3>Functional Cookies</h3>
                <p>These cookies enhance functionality and personalization, such as remembering your preferences and settings.</p>
                <ul>
                  <li>Language and region preferences</li>
                  <li>User interface customizations</li>
                  <li>Accessibility settings</li>
                </ul>
              </div>

              <div className="cookie-type">
                <Eye className="cookie-icon" />
                <h3>Analytics Cookies</h3>
                <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                <ul>
                  <li>Page views and user behavior</li>
                  <li>Performance monitoring</li>
                  <li>Error tracking and debugging</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Managing Your Cookie Preferences</h2>
            <p>You can control and manage cookies in several ways:</p>
            
            <div className="cookie-management">
              <div className="management-option">
                <h4>Browser Settings</h4>
                <p>Most browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies.</p>
              </div>
              
              <div className="management-option">
                <h4>Cookie Consent Tool</h4>
                <p>Use our cookie consent tool to customize your preferences for non-essential cookies.</p>
                <button className="btn btn-primary">Manage Cookie Preferences</button>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Third-Party Cookies</h2>
            <p>We may use third-party services that set their own cookies. These include:</p>
            <ul>
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Video Conferencing:</strong> For tutoring session functionality</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Cookie Retention</h2>
            <p>Different cookies have different retention periods:</p>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
              <li><strong>Analytics Cookies:</strong> Typically retained for 24 months</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>If you have any questions about our Cookie Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@tutormatch.com</p>
              <p><strong>Address:</strong> 123 Education St, Learning City, LC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
