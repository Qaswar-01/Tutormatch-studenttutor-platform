import React from 'react';
import { FileText, Calendar, Shield } from 'lucide-react';
import './StaticPages.css';

const Terms = () => {
  return (
    <div className="static-page">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero">
          <h1>Terms of Service</h1>
          <p className="hero-subtitle">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="legal-content">
          <section className="content-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p>
              By accessing and using TutorMatch ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="content-section">
            <div className="section-header">
              <Shield className="section-icon" />
              <h2>2. Use License</h2>
            </div>
            <p>
              Permission is granted to temporarily download one copy of TutorMatch per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="content-section">
            <div className="section-header">
              <Calendar className="section-icon" />
              <h2>3. User Accounts</h2>
            </div>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <h3>Account Responsibilities:</h3>
            <ul>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Provide accurate and up-to-date information</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>4. Tutoring Services</h2>
            <p>
              TutorMatch provides a platform to connect students with tutors. We do not directly provide tutoring services but facilitate connections between users.
            </p>
            <h3>Platform Rules:</h3>
            <ul>
              <li>All tutors must be verified and approved</li>
              <li>Sessions must be conducted professionally</li>
              <li>Payment processing is handled securely through our platform</li>
              <li>Users must respect intellectual property rights</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>5. Payment Terms</h2>
            <p>
              Students pay for tutoring sessions through our secure payment system. Tutors receive payment after successful completion of sessions, minus applicable platform fees.
            </p>
            <h3>Payment Policies:</h3>
            <ul>
              <li>All payments are processed securely</li>
              <li>Refunds are available according to our refund policy</li>
              <li>Platform fees are clearly disclosed</li>
              <li>Tutors are paid within 24 hours of session completion</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>6. Prohibited Uses</h2>
            <p>You may not use our service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>7. Disclaimer</h2>
            <p>
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
            </p>
          </section>

          <section className="content-section">
            <h2>8. Limitations</h2>
            <p>
              In no event shall TutorMatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TutorMatch's website.
            </p>
          </section>

          <section className="content-section">
            <h2>9. Accuracy of Materials</h2>
            <p>
              The materials appearing on TutorMatch could include technical, typographical, or photographic errors. TutorMatch does not warrant that any of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section className="content-section">
            <h2>10. Modifications</h2>
            <p>
              TutorMatch may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="content-section">
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: legal@tutormatch.com</p>
              <p>Phone: 1-800-TUTOR-MATCH</p>
              <p>Address: 123 Education Street, Learning City, LC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
