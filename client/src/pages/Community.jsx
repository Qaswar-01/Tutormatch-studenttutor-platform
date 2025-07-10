import React from 'react';
import { Users, MessageCircle, Star, Trophy, Heart, BookOpen, Calendar, Award } from 'lucide-react';
import './Community.css';

const Community = () => {
  const communityStats = [
    { icon: Users, label: 'Active Members', value: '50,000+' },
    { icon: BookOpen, label: 'Sessions Completed', value: '1M+' },
    { icon: Star, label: 'Average Rating', value: '4.9/5' },
    { icon: Trophy, label: 'Success Stories', value: '25,000+' }
  ];

  const communityFeatures = [
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Connect with fellow learners and share knowledge in subject-specific forums.',
      features: ['Subject-specific discussions', 'Q&A with experts', 'Study groups', 'Peer support']
    },
    {
      icon: Calendar,
      title: 'Community Events',
      description: 'Join virtual events, workshops, and study sessions with the community.',
      features: ['Weekly workshops', 'Study marathons', 'Expert webinars', 'Networking events']
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges and recognition for your learning milestones and contributions.',
      features: ['Learning badges', 'Contribution rewards', 'Leaderboards', 'Special recognition']
    },
    {
      icon: Heart,
      title: 'Peer Support',
      description: 'Get help from experienced learners and contribute to others\' success.',
      features: ['Mentorship programs', 'Study buddies', 'Success sharing', 'Motivation groups']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Mathematics Student',
      avatar: 'SJ',
      content: 'The TutorMatch community has been incredible. I found not just a great tutor, but also study partners who keep me motivated!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Physics Tutor',
      avatar: 'MC',
      content: 'Being part of this community has enriched my teaching experience. The collaboration between tutors helps us all improve.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Language Learner',
      avatar: 'ER',
      content: 'The discussion forums are amazing! I practice my English with native speakers and help others with Spanish.',
      rating: 5
    }
  ];

  return (
    <div className="community-page">
      <div className="container">
        {/* Hero Section */}
        <div className="community-hero">
          <div className="hero-content">
            <Users className="hero-icon" size={64} />
            <h1>Join Our Learning Community</h1>
            <p>Connect with thousands of learners and educators worldwide. Share knowledge, find study partners, and grow together in a supportive environment.</p>
            <button className="btn btn-primary btn-lg">
              <Users size={20} />
              Join Community
            </button>
          </div>
        </div>

        {/* Community Stats */}
        <section className="stats-section">
          <h2>Our Growing Community</h2>
          <div className="stats-grid">
            {communityStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <stat.icon className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Features */}
        <section className="features-section">
          <h2>Community Features</h2>
          <div className="features-grid">
            {communityFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-header">
                  <feature.icon className="feature-icon" />
                  <h3>{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-list">
                  {feature.features.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="guidelines-section">
          <h2>Community Guidelines</h2>
          <div className="guidelines-content">
            <div className="guideline-card">
              <h3>Be Respectful</h3>
              <p>Treat all community members with kindness and respect. We celebrate diversity and welcome learners from all backgrounds.</p>
            </div>
            <div className="guideline-card">
              <h3>Share Knowledge</h3>
              <p>Help others by sharing your knowledge and experiences. Every contribution, no matter how small, makes a difference.</p>
            </div>
            <div className="guideline-card">
              <h3>Stay Supportive</h3>
              <p>Encourage fellow learners and celebrate their achievements. We're all here to grow and succeed together.</p>
            </div>
            <div className="guideline-card">
              <h3>Keep Learning</h3>
              <p>Stay curious and open to new ideas. The best communities are those where everyone is both a teacher and a student.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <h2>What Our Community Says</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="avatar">{testimonial.avatar}</div>
                  <div className="user-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="community-cta">
          <h2>Ready to Join Our Community?</h2>
          <p>Start connecting with learners and educators who share your passion for knowledge.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-lg">
              <Users size={20} />
              Join Now
            </button>
            <button className="btn btn-outline btn-lg">
              <MessageCircle size={20} />
              Explore Forums
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Community;
