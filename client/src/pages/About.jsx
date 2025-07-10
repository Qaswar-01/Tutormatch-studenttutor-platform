import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Target,
  Award,
  Heart,
  Globe,
  Search,
  UserPlus
} from 'lucide-react';
import './StaticPages.css';

const About = () => {
  return (
    <div className="static-page about-page-enhanced">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero about-hero-enhanced">
          <div className="hero-background-animation"></div>
          <h1 className="hero-title-enhanced">About TutorMatch</h1>
          <p className="hero-subtitle-enhanced">
            Connecting students with qualified tutors for personalized learning experiences
          </p>
          <div className="hero-decorative-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="content-section mission-section-enhanced">
          <div className="section-header section-header-enhanced">
            <Target className="section-icon section-icon-enhanced" />
            <h2 className="section-title-enhanced">Our Mission</h2>
          </div>
          <div className="mission-content-wrapper">
            <p className="mission-text-enhanced">
              At TutorMatch, we believe that every student deserves access to quality education
              and personalized learning support. Our mission is to bridge the gap between
              students seeking academic help and qualified tutors who can provide expert guidance.
            </p>
            <div className="mission-highlight-box">
              <div className="highlight-icon">🎯</div>
              <div className="highlight-text">Empowering Education Through Connection</div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="content-section values-section-enhanced">
          <div className="section-header section-header-enhanced">
            <Heart className="section-icon section-icon-enhanced" />
            <h2 className="section-title-enhanced">Our Values</h2>
          </div>
          <div className="values-grid values-grid-enhanced">
            <div className="value-item value-item-enhanced" data-aos="fade-up" data-aos-delay="100">
              <div className="value-icon-wrapper">
                <Award className="value-icon value-icon-enhanced" size={48} />
              </div>
              <h3 className="value-title-enhanced">Quality Education</h3>
              <p className="value-description-enhanced">We ensure all our tutors are qualified and experienced professionals with proven track records.</p>
              <div className="value-decoration"></div>
            </div>
            <div className="value-item value-item-enhanced" data-aos="fade-up" data-aos-delay="200">
              <div className="value-icon-wrapper">
                <Users className="value-icon value-icon-enhanced" size={48} />
              </div>
              <h3 className="value-title-enhanced">Personalized Learning</h3>
              <p className="value-description-enhanced">Every student is unique, and we match them with tutors who fit their learning style and goals.</p>
              <div className="value-decoration"></div>
            </div>
            <div className="value-item value-item-enhanced" data-aos="fade-up" data-aos-delay="300">
              <div className="value-icon-wrapper">
                <Globe className="value-icon value-icon-enhanced" size={48} />
              </div>
              <h3 className="value-title-enhanced">Accessibility</h3>
              <p className="value-description-enhanced">Making quality tutoring accessible to students everywhere through innovative technology.</p>
              <div className="value-decoration"></div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="content-section">
          <div className="section-header">
            <GraduationCap className="section-icon" />
            <h2>Our Story</h2>
          </div>
          <p>
            Founded in 2024, TutorMatch was born from the recognition that traditional 
            education doesn't always meet every student's needs. Our founders, experienced 
            educators and technology professionals, came together to create a platform 
            that makes finding the right tutor simple, safe, and effective.
          </p>
          <p>
            Today, we're proud to serve thousands of students and tutors worldwide, 
            facilitating meaningful learning connections that help students achieve 
            their academic goals.
          </p>
        </section>

        {/* CTA Section */}
        <section className="cta-section cta-section-enhanced">
          <div className="cta-background-animation"></div>
          <div className="cta-content">
            <h2 className="cta-title-enhanced">Ready to Start Your Learning Journey?</h2>
            <p className="cta-subtitle-enhanced">Join our community of learners and educators today.</p>
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

export default About;
