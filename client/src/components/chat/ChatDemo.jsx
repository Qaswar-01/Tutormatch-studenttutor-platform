import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatButton from './ChatButton';
import './ChatDemo.css';

const ChatDemo = () => {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState(null);

  // Mock session data for demonstration
  const mockSessions = [
    {
      _id: '6755a46e4b6d79bd6f5f5141',
      subject: 'Mathematics',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      status: 'approved',
      student: {
        _id: user?.role === 'student' ? user._id : '6755a46e4b6d79bd6f5f5142',
        firstName: user?.role === 'student' ? user.firstName : 'John',
        lastName: user?.role === 'student' ? user.lastName : 'Doe'
      },
      tutor: {
        _id: user?.role === 'tutor' ? user._id : '6755a46e4b6d79bd6f5f5143',
        firstName: user?.role === 'tutor' ? user.firstName : 'Jane',
        lastName: user?.role === 'tutor' ? user.lastName : 'Smith'
      }
    },
    {
      _id: '6755a46e4b6d79bd6f5f5144',
      subject: 'Physics',
      startTime: '2:00 PM',
      endTime: '3:00 PM',
      status: 'approved',
      student: {
        _id: user?.role === 'student' ? user._id : '6755a46e4b6d79bd6f5f5145',
        firstName: user?.role === 'student' ? user.firstName : 'Alice',
        lastName: user?.role === 'student' ? user.lastName : 'Johnson'
      },
      tutor: {
        _id: user?.role === 'tutor' ? user._id : '6755a46e4b6d79bd6f5f5146',
        firstName: user?.role === 'tutor' ? user.firstName : 'Bob',
        lastName: user?.role === 'tutor' ? user.lastName : 'Wilson'
      }
    },
    {
      _id: '6755a46e4b6d79bd6f5f5147',
      subject: 'Chemistry',
      startTime: '4:00 PM',
      endTime: '5:00 PM',
      status: 'pending',
      student: {
        _id: user?.role === 'student' ? user._id : '6755a46e4b6d79bd6f5f5148',
        firstName: user?.role === 'student' ? user.firstName : 'Charlie',
        lastName: user?.role === 'student' ? user.lastName : 'Brown'
      },
      tutor: {
        _id: user?.role === 'tutor' ? user._id : '6755a46e4b6d79bd6f5f5149',
        firstName: user?.role === 'tutor' ? user.firstName : 'Diana',
        lastName: user?.role === 'tutor' ? user.lastName : 'Davis'
      }
    }
  ];

  if (!user) {
    return (
      <div className="chat-demo-container">
        <div className="demo-message">
          <h2>Please log in to test the chat feature</h2>
          <p>You need to be authenticated to use the real-time chat functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-demo-container">
      <div className="demo-header">
        <h1>🚀 Real-time Chat Demo</h1>
        <p>Test the full-screen chat feature with approved sessions</p>
        <div className="user-info">
          <strong>Logged in as:</strong> {user.firstName} {user.lastName} ({user.role})
        </div>
      </div>

      <div className="demo-content">
        <div className="sessions-grid">
          {mockSessions.map((session) => (
            <div 
              key={session._id} 
              className={`session-card ${session.status === 'approved' ? 'approved' : 'pending'}`}
            >
              <div className="session-header">
                <h3>{session.subject}</h3>
                <span className={`status-badge ${session.status}`}>
                  {session.status}
                </span>
              </div>
              
              <div className="session-details">
                <div className="time-info">
                  <span>⏰ {session.startTime} - {session.endTime}</span>
                </div>
                
                <div className="participants">
                  <div className="participant">
                    <span className="role">Student:</span>
                    <span className="name">{session.student.firstName} {session.student.lastName}</span>
                  </div>
                  <div className="participant">
                    <span className="role">Tutor:</span>
                    <span className="name">{session.tutor.firstName} {session.tutor.lastName}</span>
                  </div>
                </div>
              </div>

              <div className="session-actions">
                {session.status === 'approved' ? (
                  <ChatButton session={session} className="demo-chat-btn" />
                ) : (
                  <div className="disabled-message">
                    Chat available only for approved sessions
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="demo-instructions">
          <h3>📋 How to Test</h3>
          <ol>
            <li><strong>Click "Chat"</strong> on any approved session to open the full-screen chat</li>
            <li><strong>Send messages</strong> using the input field at the bottom</li>
            <li><strong>Test real-time features:</strong>
              <ul>
                <li>Open the same session in multiple browser tabs</li>
                <li>Send messages from one tab and see them appear in others</li>
                <li>Try typing to see the typing indicator</li>
              </ul>
            </li>
            <li><strong>Close chat</strong> using the ✕ button or press Escape</li>
          </ol>

          <div className="feature-highlights">
            <h4>✨ Features Included</h4>
            <div className="features-grid">
              <div className="feature">
                <span className="icon">💬</span>
                <span>Real-time messaging</span>
              </div>
              <div className="feature">
                <span className="icon">⌨️</span>
                <span>Typing indicators</span>
              </div>
              <div className="feature">
                <span className="icon">🔒</span>
                <span>Secure authentication</span>
              </div>
              <div className="feature">
                <span className="icon">📱</span>
                <span>Responsive design</span>
              </div>
              <div className="feature">
                <span className="icon">🎨</span>
                <span>Smooth animations</span>
              </div>
              <div className="feature">
                <span className="icon">🌐</span>
                <span>Socket.io integration</span>
              </div>
            </div>
          </div>

          <div className="tech-stack">
            <h4>🛠️ Tech Stack</h4>
            <div className="tech-items">
              <span className="tech-item">React + Vite</span>
              <span className="tech-item">Socket.io</span>
              <span className="tech-item">MongoDB</span>
              <span className="tech-item">Express.js</span>
              <span className="tech-item">JWT Auth</span>
              <span className="tech-item">CSS Animations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDemo;
