import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Mail } from 'lucide-react';
import './StaticPages.css';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      category: 'Getting Started',
      questions: [
        {
          id: 1,
          question: 'How do I sign up as a student?',
          answer: 'Click on "Register" and select "I\'m a Student". Fill out your basic information, verify your email, and you\'re ready to start finding tutors!'
        },
        {
          id: 2,
          question: 'How do I become a tutor?',
          answer: 'Register as a tutor, complete your profile with qualifications and subjects, upload required documents, and wait for approval. Once approved, you can start accepting session requests.'
        },
        {
          id: 3,
          question: 'Is TutorMatch free to use?',
          answer: 'Creating an account is free. Students pay for tutoring sessions, and tutors earn money from teaching. We charge a small platform fee for our services.'
        }
      ]
    },
    {
      category: 'Booking Sessions',
      questions: [
        {
          id: 4,
          question: 'How do I book a tutoring session?',
          answer: 'Browse tutors, select one that matches your needs, choose an available time slot, and send a session request. The tutor will either accept or suggest alternative times.'
        },
        {
          id: 5,
          question: 'Can I cancel or reschedule a session?',
          answer: 'Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without penalty. Last-minute cancellations may incur fees.'
        },
        {
          id: 6,
          question: 'What happens if a tutor doesn\'t show up?',
          answer: 'If a tutor doesn\'t show up, you\'ll receive a full refund and can report the incident. We take no-shows seriously and may suspend tutors who repeatedly miss sessions.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          id: 7,
          question: 'How do payments work?',
          answer: 'Students pay when booking a session. Funds are held securely and released to tutors after the session is completed. We accept major credit cards and PayPal.'
        },
        {
          id: 8,
          question: 'When do tutors get paid?',
          answer: 'Tutors receive payment within 24 hours after completing a session. Payments are processed to your preferred payment method (bank account or PayPal).'
        },
        {
          id: 9,
          question: 'What are the platform fees?',
          answer: 'We charge a 10% service fee on all transactions. This covers platform maintenance, customer support, and payment processing.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          id: 10,
          question: 'What if I have technical issues during a session?',
          answer: 'Contact our support team immediately. We provide 24/7 technical support during session hours and can help resolve video, audio, or connection issues.'
        },
        {
          id: 11,
          question: 'What are the system requirements?',
          answer: 'You need a stable internet connection, a modern web browser (Chrome, Firefox, Safari, or Edge), and a device with camera and microphone for video sessions.'
        },
        {
          id: 12,
          question: 'Can I use TutorMatch on mobile devices?',
          answer: 'Yes! Our platform is fully responsive and works on smartphones and tablets. We also have mobile apps available for iOS and Android.'
        }
      ]
    }
  ];

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="static-page">
      <div className="container">
        {/* Hero Section */}
        <div className="page-hero">
          <h1>Frequently Asked Questions</h1>
          <p className="hero-subtitle">
            Find answers to common questions about TutorMatch
          </p>
        </div>

        {/* Search */}
        <div className="faq-search">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="faq-content">
          {filteredFAQ.length === 0 ? (
            <div className="no-results">
              <HelpCircle size={48} />
              <h3>No results found</h3>
              <p>Try adjusting your search terms or browse all categories.</p>
            </div>
          ) : (
            filteredFAQ.map((category) => (
              <div key={category.category} className="faq-category">
                <h2 className="category-title">{category.category}</h2>
                <div className="faq-items">
                  {category.questions.map((item) => (
                    <div key={item.id} className="faq-item">
                      <button
                        className="faq-question"
                        onClick={() => toggleItem(item.id)}
                      >
                        <span>{item.question}</span>
                        {openItems.has(item.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                      {openItems.has(item.id) && (
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="faq-cta">
          <h3>Still have questions?</h3>
          <p>Can't find what you're looking for? Our support team is here to help 24/7.</p>
          <div className="cta-buttons">
            <a href="/contact" className="btn btn-primary">
              <MessageCircle size={16} />
              Contact Support
            </a>
            <a href="mailto:support@tutormatch.com" className="btn btn-outline">
              <Mail size={16} />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
