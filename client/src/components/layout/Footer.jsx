import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  GraduationCap,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);
    try {
      // Simulate newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSocialClick = (platform) => {
    // In a real app, these would link to actual social media pages
    const socialLinks = {
      'Facebook': 'https://facebook.com/tutormatch',
      'Twitter': 'https://twitter.com/tutormatch',
      'LinkedIn': 'https://linkedin.com/company/tutormatch',
      'Instagram': 'https://instagram.com/tutormatch'
    };

    toast.success(`Opening ${platform}...`);
    // Simulate opening social media page
    setTimeout(() => {
      console.log(`Would redirect to: ${socialLinks[platform]}`);
    }, 1000);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <GraduationCap size={32} className="logo-icon" />
              <span className="logo-text">TutorMatch</span>
            </div>
            <p className="footer-description">
              Connecting students with qualified tutors for personalized learning experiences.
              Find your perfect tutor and achieve your academic goals.
            </p>
            <div className="social-links">
              <button
                onClick={() => handleSocialClick('Facebook')}
                className="social-link"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </button>
              <button
                onClick={() => handleSocialClick('Twitter')}
                className="social-link"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </button>
              <button
                onClick={() => handleSocialClick('LinkedIn')}
                className="social-link"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </button>
              <button
                onClick={() => handleSocialClick('Instagram')}
                className="social-link"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/tutors">Find Tutors</Link></li>
              <li><Link to="/register">Become a Tutor</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/safety">Safety Guidelines</Link></li>
              <li><Link to="/community">Community</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/accessibility">Accessibility</Link></li>
            </ul>
          </div>

          {/* Contact Info - Get in Touch */}
          <div className="footer-section">
            <h3 className="footer-title">Get in Touch</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={18} className="contact-icon" />
                <span>support@tutormatch.com</span>
              </div>
              <div className="contact-item">
                <Phone size={18} className="contact-icon" />
                <span>1-800-TUTOR-MATCH</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} className="contact-icon" />
                <span>123 Education St, Learning City, LC 12345</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup - Stay Updated */}
          <div className="footer-section">
            <h3 className="footer-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest updates and educational tips.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
              />
              <button
                type="submit"
                className="newsletter-btn"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  'Subscribing...'
                ) : (
                  <>
                    <Send size={16} />
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} TutorMatch. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/sitemap">Sitemap</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/press">Press</Link>
              <Link to="/blog">Blog</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
