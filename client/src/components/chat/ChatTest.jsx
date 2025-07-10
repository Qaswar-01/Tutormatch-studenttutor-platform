import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FullScreenChat from './FullScreenChat';

const ChatTest = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock session for testing
  const mockSession = {
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
  };

  if (!user) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2>Please log in to test the chat</h2>
          <p>You need to be authenticated to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#1f2937'
        }}>
          🚀 Full-Screen Chat Test
        </h1>
        
        <div style={{
          background: '#f1f5f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Current User:</h3>
          <p style={{ margin: '0', color: '#6b7280' }}>
            {user.firstName} {user.lastName} ({user.role})
          </p>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>Mock Session Details:</h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div><strong>Subject:</strong> {mockSession.subject}</div>
            <div><strong>Time:</strong> {mockSession.startTime} - {mockSession.endTime}</div>
            <div><strong>Status:</strong> <span style={{ 
              color: mockSession.status === 'approved' ? '#059669' : '#d97706',
              fontWeight: 'bold'
            }}>{mockSession.status}</span></div>
            <div><strong>Student:</strong> {mockSession.student.firstName} {mockSession.student.lastName}</div>
            <div><strong>Tutor:</strong> {mockSession.tutor.firstName} {mockSession.tutor.lastName}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            💬 Open Full-Screen Chat
          </button>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>⚠️ Testing Instructions:</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
            <li>Click the button above to open the full-screen chat</li>
            <li>The chat should cover the entire screen</li>
            <li>Try sending messages to test the interface</li>
            <li>Open multiple browser tabs to test real-time messaging</li>
            <li>Press Escape or click the ✕ button to close</li>
          </ul>
        </div>

        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#065f46' }}>✅ Expected Behavior:</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#065f46' }}>
            <li>Chat opens as a full-screen modal overlay</li>
            <li>Background is blurred and darkened</li>
            <li>Chat container is centered and responsive</li>
            <li>Messages load and display properly</li>
            <li>Real-time messaging works via Socket.io</li>
            <li>Typing indicators show when someone is typing</li>
          </ul>
        </div>
      </div>

      <FullScreenChat
        session={mockSession}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default ChatTest;
