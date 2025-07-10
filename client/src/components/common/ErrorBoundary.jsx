import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback: CustomFallback } = this.props;
      
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-icon">
              ⚠️
            </div>
            
            <div className="error-content">
              <h1 className="error-title">Oops! Something went wrong</h1>
              <p className="error-description">
                We're sorry, but something unexpected happened. Our team has been notified 
                and is working to fix the issue.
              </p>
              
              <div className="error-actions">
                <button 
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
                <button 
                  onClick={this.handleReload}
                  className="btn btn-outline btn-secondary"
                >
                  Reload Page
                </button>
                <button 
                  onClick={this.handleGoHome}
                  className="btn btn-outline btn-secondary"
                >
                  Go Home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="error-details">
                  <summary className="error-details-summary">
                    Technical Details (Development Only)
                  </summary>
                  <div className="error-stack">
                    <h3>Error:</h3>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    
                    <h3>Component Stack:</h3>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                    
                    <h3>Error Stack:</h3>
                    <pre>{this.state.error && this.state.error.stack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for hooks
export const ErrorBoundaryWrapper = ({ children, fallback, onError }) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryConfig = {}) => {
  const WrappedComponent = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryConfig}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Custom error fallback components
export const MinimalErrorFallback = ({ error, onRetry }) => (
  <div className="error-fallback minimal">
    <div className="error-content">
      <p className="error-message">Something went wrong</p>
      <button onClick={onRetry} className="btn btn-sm btn-primary">
        Try again
      </button>
    </div>
  </div>
);

export const InlineErrorFallback = ({ error, onRetry, message }) => (
  <div className="error-fallback inline">
    <div className="error-content">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{message || 'Failed to load'}</span>
      <button onClick={onRetry} className="btn btn-xs btn-outline btn-primary">
        Retry
      </button>
    </div>
  </div>
);

export const CardErrorFallback = ({ error, onRetry, title = "Error" }) => (
  <div className="error-fallback card">
    <div className="card-body">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">
          Unable to load this content. Please try again.
        </p>
        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ErrorBoundary;
