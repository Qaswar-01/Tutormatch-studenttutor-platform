import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Video,
  Star,
  UserPlus,
  FileText,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import './StaticPages.css';

const HowItWorks = () => {
  const studentSteps = [
    {
      icon: <UserPlus size={32} />,
      title: 'Sign Up',
      description: 'Create your free student account in just a few minutes.'
    },
    {
      icon: <Search size={32} />,
      title: 'Find Tutors',
      description: 'Browse qualified tutors by subject, price, and availability.'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Book Session',
      description: 'Schedule a session at a time that works for you.'
    },
    {
      icon: <Video size={32} />,
      title: 'Learn Online',
      description: 'Join your video session and start learning with your tutor.'
    }
  ];

  const tutorSteps = [
    {
      icon: <UserPlus size={32} />,
      title: 'Apply',
      description: 'Submit your tutor application with qualifications and experience.'
    },
    {
      icon: <FileText size={32} />,
      title: 'Get Verified',
      description: 'Our team reviews your credentials and approves your profile.'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Set Availability',
      description: 'Choose your schedule and set your hourly rates.'
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'Start Teaching',
      description: 'Accept session requests and start earning money.'
    }
  ];

  return (
    <div className="static-page how-it-works-enhanced">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero how-it-works-hero-enhanced">
          <div className="hero-background-animation"></div>
          <h1 className="hero-title-enhanced">How TutorMatch Works</h1>
          <p className="hero-subtitle-enhanced">
            Simple steps to connect students with qualified tutors
          </p>
          <div className="hero-decorative-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </div>

        {/* For Students */}
        <section className="content-section">
          <div className="section-header">
            <Search className="section-icon" />
            <h2>For Students</h2>
          </div>
          <p>Getting help with your studies has never been easier. Follow these simple steps:</p>
          
          <div className="steps-grid steps-grid-enhanced">
            {studentSteps.map((step, index) => (
              <div key={index} className="step-card step-card-enhanced">
                <div className="step-number step-number-enhanced">{index + 1}</div>
                <div className="step-icon step-icon-enhanced">{step.icon}</div>
                <h3 className="step-title-enhanced">{step.title}</h3>
                <p className="step-description-enhanced">{step.description}</p>
                <div className="step-decoration"></div>
                <div className="step-connector"></div>
              </div>
            ))}
          </div>
          
          <div className="step-cta">
            <Link to="/register?role=student" className="btn btn-primary btn-lg">
              Get Started as Student
            </Link>
          </div>
        </section>

        {/* For Tutors */}
        <section className="content-section">
          <div className="section-header">
            <Star className="section-icon" />
            <h2>For Tutors</h2>
          </div>
          <p>Share your knowledge and earn money by becoming a tutor on our platform:</p>
          
          <div className="steps-grid steps-grid-enhanced">
            {tutorSteps.map((step, index) => (
              <div key={index} className="step-card step-card-enhanced tutor-step">
                <div className="step-number step-number-enhanced">{index + 1}</div>
                <div className="step-icon step-icon-enhanced">{step.icon}</div>
                <h3 className="step-title-enhanced">{step.title}</h3>
                <p className="step-description-enhanced">{step.description}</p>
                <div className="step-decoration"></div>
                <div className="step-connector"></div>
              </div>
            ))}
          </div>
          
          <div className="step-cta">
            <Link to="/register?role=tutor" className="btn btn-primary btn-lg">
              Apply as Tutor
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="content-section">
          <div className="section-header">
            <CheckCircle className="section-icon" />
            <h2>Why Choose TutorMatch?</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-item">
              <Video className="feature-icon" size={40} />
              <h3>HD Video Sessions</h3>
              <p>Crystal clear video and audio for the best learning experience with professional-grade technology.</p>
            </div>
            <div className="feature-item">
              <CheckCircle className="feature-icon" size={40} />
              <h3>Verified Tutors</h3>
              <p>All tutors are background-checked and credential-verified for your safety and quality assurance.</p>
            </div>
            <div className="feature-item">
              <Calendar className="feature-icon" size={40} />
              <h3>Flexible Scheduling</h3>
              <p>Book sessions that fit your schedule with 24/7 availability and easy rescheduling options.</p>
            </div>
            <div className="feature-item">
              <MessageCircle className="feature-icon" size={40} />
              <h3>Real-time Chat</h3>
              <p>Communicate with your tutor before, during, and after sessions for continuous support.</p>
            </div>
            <div className="feature-item">
              <Star className="feature-icon" size={40} />
              <h3>Quality Guarantee</h3>
              <p>Rate your sessions and get refunds if not satisfied. Your success is our priority.</p>
            </div>
            <div className="feature-item">
              <Search className="feature-icon" size={40} />
              <h3>Smart Matching</h3>
              <p>Find the perfect tutor based on your learning style, goals, and preferences using AI.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section cta-section-enhanced">
          <div className="cta-background-animation"></div>
          <div className="cta-content">
            <h2 className="cta-title-enhanced">Ready to Get Started?</h2>
            <p className="cta-subtitle-enhanced">Join thousands of students and tutors already using TutorMatch.</p>
            <div className="cta-buttons cta-buttons-enhanced">
              <Link to="/tutors" className="btn btn-primary cta-btn-enhanced cta-btn-primary">
                <Search className="btn-icon" size={20} />
                <span className="btn-text">Find a Tutor</span>
                <div className="btn-ripple"></div>
              </Link>
              <Link to="/register" className="btn btn-outline cta-btn-enhanced cta-btn-secondary">
                <UserPlus className="btn-icon" size={20} />
                <span className="btn-text">Become a Tutor</span>
                <div className="btn-ripple"></div>
              </Link>
            </div>
          </div>
          <div className="cta-decorative-elements">
            <div className="cta-floating-element cta-element-1"></div>
            <div className="cta-floating-element cta-element-2"></div>
            <div className="cta-floating-element cta-element-3"></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;
