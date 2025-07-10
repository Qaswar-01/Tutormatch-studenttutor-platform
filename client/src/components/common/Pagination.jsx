import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  current, 
  pages, 
  onPageChange, 
  hasNext, 
  hasPrev,
  showInfo = true,
  maxVisible = 5 
}) => {
  if (pages <= 1) return null;

  const getVisiblePages = () => {
    const visible = [];
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, current - half);
    let end = Math.min(pages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    
    return visible;
  };

  const visiblePages = getVisiblePages();
  const showFirstEllipsis = visiblePages[0] > 2;
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < pages - 1;

  return (
    <div className="pagination">
      {showInfo && (
        <div className="pagination-info">
          Page {current} of {pages}
        </div>
      )}
      
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={!hasPrev}
          className="pagination-btn pagination-prev"
          aria-label="Previous page"
        >
          <span className="pagination-arrow">‹</span>
          <span className="pagination-text">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="pagination-pages">
          {/* First Page */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="pagination-page"
              >
                1
              </button>
              {showFirstEllipsis && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {/* Visible Pages */}
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`pagination-page ${page === current ? 'active' : ''}`}
              aria-current={page === current ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last Page */}
          {visiblePages[visiblePages.length - 1] < pages && (
            <>
              {showLastEllipsis && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                onClick={() => onPageChange(pages)}
                className="pagination-page"
              >
                {pages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(current + 1)}
          disabled={!hasNext}
          className="pagination-btn pagination-next"
          aria-label="Next page"
        >
          <span className="pagination-text">Next</span>
          <span className="pagination-arrow">›</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
