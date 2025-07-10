import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';
import './StaticPages.css';

const Privacy = () => {
  return (
    <div className="static-page">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero">
          <h1>Privacy Policy</h1>
          <p className="hero-subtitle">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="legal-content">
          <section className="content-section">
            <div className="section-header">
              <Shield className="section-icon" />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.
            </p>
            <h3>Personal Information:</h3>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Profile information including education and qualifications</li>
              <li>Payment information (processed securely by third-party providers)</li>
              <li>Communication preferences and settings</li>
            </ul>
          </section>

          <section className="content-section">
            <div className="section-header">
              <Eye className="section-icon" />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>

          <section className="content-section">
            <div className="section-header">
              <Database className="section-icon" />
              <h2>3. Information Sharing</h2>
            </div>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
            <h3>We may share information:</h3>
            <ul>
              <li>With tutors and students to facilitate tutoring sessions</li>
              <li>With service providers who assist in our operations</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="content-section">
            <div className="section-header">
              <Lock className="section-icon" />
              <h2>4. Data Security</h2>
            </div>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <h3>Security Measures:</h3>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure payment processing through certified providers</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to collect and use personal information about you. For more information about our use of cookies, please see our Cookie Policy.
            </p>
            <h3>Types of Cookies:</h3>
            <ul>
              <li>Essential cookies for website functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Preference cookies to remember your settings</li>
              <li>Marketing cookies for personalized content</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>6. Your Rights and Choices</h2>
            <p>You have certain rights regarding your personal information:</p>
            <ul>
              <li>Access and update your account information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Object to processing of your data</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section className="content-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="content-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="content-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="content-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="contact-info">
              <p>Email: privacy@tutormatch.com</p>
              <p>Phone: 1-800-TUTOR-MATCH</p>
              <p>Address: 123 Education Street, Learning City, LC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
