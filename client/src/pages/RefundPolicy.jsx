import React from 'react';
import { RefreshCw, Clock, CreditCard, MessageCircle } from 'lucide-react';
import './PolicyPage.css';

const RefundPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-hero">
          <RefreshCw className="hero-icon" size={64} />
          <h1>Refund Policy</h1>
          <p>We want you to be completely satisfied with our service. Learn about our refund policy and how to request refunds.</p>
          <div className="last-updated">Last updated: December 2024</div>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Our Commitment to You</h2>
            <p>At TutorMatch, we're committed to providing high-quality tutoring services. If you're not satisfied with your experience, we offer several refund options to ensure your satisfaction.</p>
          </section>

          <section className="policy-section">
            <h2>Refund Eligibility</h2>
            
            <div className="refund-types">
              <div className="refund-type">
                <Clock className="refund-icon" />
                <h3>Session-Based Refunds</h3>
                <p>You may be eligible for a refund if:</p>
                <ul>
                  <li>Tutor fails to show up for a scheduled session</li>
                  <li>Technical issues prevent the session from taking place</li>
                  <li>Session quality is significantly below expectations</li>
                  <li>Tutor violates our community guidelines</li>
                </ul>
              </div>

              <div className="refund-type">
                <CreditCard className="refund-icon" />
                <h3>Subscription Refunds</h3>
                <p>Subscription refunds are available under these conditions:</p>
                <ul>
                  <li>Cancellation within 7 days of initial subscription</li>
                  <li>Unused portion of annual subscriptions (prorated)</li>
                  <li>Service unavailability for extended periods</li>
                  <li>Billing errors or unauthorized charges</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Refund Process</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Contact Support</h4>
                <p>Reach out to our support team within 30 days of the session or billing date.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h4>Provide Details</h4>
                <p>Share relevant information about your refund request, including session details or billing information.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Review Process</h4>
                <p>Our team will review your request within 2-3 business days and may contact you for additional information.</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h4>Refund Processing</h4>
                <p>Approved refunds are processed within 5-7 business days to your original payment method.</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Refund Timeframes</h2>
            <div className="timeframes">
              <div className="timeframe-item">
                <h4>Session Refunds</h4>
                <p>Must be requested within <strong>48 hours</strong> of the session</p>
              </div>
              <div className="timeframe-item">
                <h4>Subscription Refunds</h4>
                <p>Must be requested within <strong>30 days</strong> of billing</p>
              </div>
              <div className="timeframe-item">
                <h4>Processing Time</h4>
                <p>Refunds processed within <strong>5-7 business days</strong></p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Non-Refundable Items</h2>
            <p>The following items are generally not eligible for refunds:</p>
            <ul>
              <li>Completed sessions where no issues were reported</li>
              <li>Subscription fees after the 7-day trial period (except for unused portions)</li>
              <li>Third-party service fees (payment processing, etc.)</li>
              <li>Requests made after the specified timeframes</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Alternative Solutions</h2>
            <p>Before requesting a refund, consider these alternatives:</p>
            <div className="alternatives">
              <div className="alternative">
                <h4>Session Credits</h4>
                <p>Receive credits for future sessions instead of a monetary refund</p>
              </div>
              <div className="alternative">
                <h4>Tutor Replacement</h4>
                <p>We can help you find a different tutor that better matches your needs</p>
              </div>
              <div className="alternative">
                <h4>Plan Adjustment</h4>
                <p>Modify your subscription plan to better suit your requirements</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>How to Request a Refund</h2>
            <div className="contact-methods">
              <div className="contact-method">
                <MessageCircle className="contact-icon" />
                <h4>Support Chat</h4>
                <p>Use our in-app chat for immediate assistance</p>
                <button className="btn btn-primary">Start Chat</button>
              </div>
              <div className="contact-method">
                <h4>Email Support</h4>
                <p>Send detailed refund requests to our support team</p>
                <a href="mailto:refunds@tutormatch.com" className="btn btn-outline">refunds@tutormatch.com</a>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Contact Information</h2>
            <p>For refund requests or questions about this policy:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> refunds@tutormatch.com</p>
              <p><strong>Phone:</strong> 1-800-TUTOR-MATCH</p>
              <p><strong>Address:</strong> 123 Education St, Learning City, LC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
