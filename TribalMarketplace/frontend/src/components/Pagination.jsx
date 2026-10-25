// components/Pagination.jsx
// Page buttons: « Prev 1 2 3 ... Next »

import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

// Returns the page numbers to show, e.g. [1, '...', 4, 5, 6, '...', 10]
function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  for (let page = 1; page <= totalPages; page++) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;
    if (isEdge || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon size={18} />
      </button>

      {getPageNumbers(page, totalPages).map((item, index) =>
        item === '...' ? (
          <span key={`gap-${index}`} className="pagination-gap">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination-button ${item === page ? 'is-active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon size={18} />
      </button>
    </nav>
  );
}

export default Pagination;
