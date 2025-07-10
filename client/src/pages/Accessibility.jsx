import React from 'react';
import { Eye, Ear, Hand, Brain, Monitor, Keyboard, MousePointer } from 'lucide-react';
import './PolicyPage.css';

const Accessibility = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-hero">
          <Eye className="hero-icon" size={64} />
          <h1>Accessibility Statement</h1>
          <p>TutorMatch is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone.</p>
          <div className="last-updated">Last updated: December 2024</div>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Our Commitment</h2>
            <p>We are committed to making our platform accessible to all users, regardless of their abilities or disabilities. We strive to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.</p>
          </section>

          <section className="policy-section">
            <h2>Accessibility Features</h2>
            
            <div className="accessibility-features">
              <div className="feature-category">
                <Eye className="category-icon" />
                <h3>Visual Accessibility</h3>
                <ul>
                  <li>High contrast color schemes</li>
                  <li>Scalable text and interface elements</li>
                  <li>Alternative text for images</li>
                  <li>Screen reader compatibility</li>
                  <li>Focus indicators for navigation</li>
                </ul>
              </div>

              <div className="feature-category">
                <Ear className="category-icon" />
                <h3>Audio Accessibility</h3>
                <ul>
                  <li>Closed captions for video content</li>
                  <li>Audio descriptions when available</li>
                  <li>Visual indicators for audio alerts</li>
                  <li>Adjustable audio levels</li>
                  <li>Text-based communication options</li>
                </ul>
              </div>

              <div className="feature-category">
                <Hand className="category-icon" />
                <h3>Motor Accessibility</h3>
                <ul>
                  <li>Keyboard navigation support</li>
                  <li>Large clickable areas</li>
                  <li>Customizable interface layouts</li>
                  <li>Voice control compatibility</li>
                  <li>Adjustable timing for interactions</li>
                </ul>
              </div>

              <div className="feature-category">
                <Brain className="category-icon" />
                <h3>Cognitive Accessibility</h3>
                <ul>
                  <li>Clear and simple language</li>
                  <li>Consistent navigation patterns</li>
                  <li>Error prevention and correction</li>
                  <li>Progress indicators</li>
                  <li>Customizable interface complexity</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Assistive Technology Support</h2>
            <p>Our platform is designed to work with various assistive technologies:</p>
            
            <div className="assistive-tech">
              <div className="tech-item">
                <Monitor className="tech-icon" />
                <h4>Screen Readers</h4>
                <p>Compatible with JAWS, NVDA, VoiceOver, and other screen reading software</p>
              </div>
              
              <div className="tech-item">
                <Keyboard className="tech-icon" />
                <h4>Keyboard Navigation</h4>
                <p>Full functionality available through keyboard-only navigation</p>
              </div>
              
              <div className="tech-item">
                <MousePointer className="tech-icon" />
                <h4>Alternative Input Devices</h4>
                <p>Support for switch controls, eye-tracking, and voice control systems</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Accessibility Standards</h2>
            <p>We follow established accessibility guidelines and standards:</p>
            <ul>
              <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
              <li><strong>Section 508:</strong> U.S. federal accessibility requirements</li>
              <li><strong>ADA:</strong> Americans with Disabilities Act compliance</li>
              <li><strong>EN 301 549:</strong> European accessibility standard</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Ongoing Improvements</h2>
            <p>We continuously work to improve accessibility through:</p>
            <div className="improvements">
              <div className="improvement-item">
                <h4>Regular Audits</h4>
                <p>Quarterly accessibility audits by certified professionals</p>
              </div>
              <div className="improvement-item">
                <h4>User Testing</h4>
                <p>Testing with users who have disabilities to identify real-world issues</p>
              </div>
              <div className="improvement-item">
                <h4>Staff Training</h4>
                <p>Regular training for our development and design teams on accessibility best practices</p>
              </div>
              <div className="improvement-item">
                <h4>Technology Updates</h4>
                <p>Keeping up with the latest assistive technologies and accessibility standards</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Known Issues</h2>
            <p>We are aware of the following accessibility issues and are working to resolve them:</p>
            <ul>
              <li>Some third-party video conferencing features may have limited accessibility</li>
              <li>Certain interactive elements in older browsers may not be fully accessible</li>
              <li>Some PDF documents may not be fully screen reader compatible</li>
            </ul>
            <p>We are actively working on solutions and expect to resolve these issues in upcoming updates.</p>
          </section>

          <section className="policy-section">
            <h2>Feedback and Support</h2>
            <p>We welcome feedback about the accessibility of our platform. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <h4>Accessibility Team</h4>
                <p>Direct line to our accessibility specialists</p>
                <a href="mailto:accessibility@tutormatch.com" className="btn btn-primary">accessibility@tutormatch.com</a>
              </div>
              <div className="contact-method">
                <h4>Phone Support</h4>
                <p>Speak with our accessibility support team</p>
                <a href="tel:1-800-TUTOR-ACCESS" className="btn btn-outline">1-800-TUTOR-ACCESS</a>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Alternative Formats</h2>
            <p>If you need this accessibility statement in an alternative format, we can provide:</p>
            <ul>
              <li>Large print versions</li>
              <li>Audio recordings</li>
              <li>Braille format</li>
              <li>Plain text versions</li>
            </ul>
            <p>Please contact our accessibility team to request alternative formats.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
