import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
            <Link to="/tutors" className="btn btn-outline">
              Browse Tutors
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }

        .not-found-content {
          text-align: center;
          max-width: 500px;
        }

        .error-code {
          font-size: 8rem;
          font-weight: 700;
          color: var(--primary-600);
          line-height: 1;
          margin-bottom: 1rem;
        }

        .not-found-content h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--gray-900);
        }

        .not-found-content p {
          font-size: 1.125rem;
          color: var(--gray-600);
          margin-bottom: 2rem;
        }

        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .error-code {
            font-size: 6rem;
          }

          .not-found-content h1 {
            font-size: 1.5rem;
          }

          .not-found-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
