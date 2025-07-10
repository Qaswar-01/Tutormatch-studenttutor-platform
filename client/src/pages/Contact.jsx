import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import './StaticPages.css';

const Contact = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if this is a sales inquiry from pricing page
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const inquiry = urlParams.get('inquiry');

    if (inquiry === 'sales') {
      setFormData(prev => ({
        ...prev,
        subject: 'sales',
        message: 'Hi! I\'m interested in learning more about your pricing plans and would like to speak with your sales team.'
      }));
      toast.info('Sales inquiry form pre-filled for you!');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Different success messages based on inquiry type
      if (formData.subject === 'sales') {
        toast.success('🎉 Sales inquiry sent! Our sales team will contact you within 2 business hours.');
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      }

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="static-page">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero">
          <h1>Contact Us</h1>
          <p className="hero-subtitle">
            We're here to help! Get in touch with our support team.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="section-header">
              <MessageCircle className="section-icon" />
              <h2>Send us a Message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="tutor">Tutor Application</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="form-control"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <div className="section-header">
              <Phone className="section-icon" />
              <h2>Get in Touch</h2>
            </div>
            
            <div className="contact-methods">
              <div className="contact-method">
                <DollarSign className="method-icon sales-icon" />
                <div className="method-info">
                  <h3>Sales Team</h3>
                  <p>sales@tutormatch.com</p>
                  <span className="method-note">Quick response within 2 business hours</span>
                </div>
              </div>

              <div className="contact-method">
                <Mail className="method-icon" />
                <div className="method-info">
                  <h3>Email Support</h3>
                  <p>support@tutormatch.com</p>
                  <span className="method-note">We typically respond within 24 hours</span>
                </div>
              </div>
              
              <div className="contact-method">
                <Phone className="method-icon" />
                <div className="method-info">
                  <h3>Phone Support</h3>
                  <p>1-800-TUTOR-MATCH</p>
                  <span className="method-note">Mon-Fri, 9 AM - 6 PM EST</span>
                </div>
              </div>
              
              <div className="contact-method">
                <MapPin className="method-icon" />
                <div className="method-info">
                  <h3>Office Address</h3>
                  <p>123 Education Street<br />Learning City, LC 12345</p>
                  <span className="method-note">By appointment only</span>
                </div>
              </div>
              
              <div className="contact-method">
                <Clock className="method-icon" />
                <div className="method-info">
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                     Saturday: 10:00 AM - 4:00 PM EST<br />
                     Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
