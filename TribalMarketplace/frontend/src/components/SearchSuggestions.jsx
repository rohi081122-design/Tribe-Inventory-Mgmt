// components/SearchSuggestions.jsx
// The dropdown list under the search box (used by SearchBar.jsx).
// Each suggestion shows the product photo, the name (with the typed letters highlighted),
// the category and the price. The last row opens the results page for the whole text.
// It also shows "Searching..." while loading and a message when nothing matches.

import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback.jsx';
import { SearchIcon } from './Icons.jsx';
import { formatPrice } from '../utils/format.js';
import '../styles/search-suggestions.css';

const isLetterOrDigit = (character) => /[\p{L}\p{N}]/u.test(character || '');

// Finds the parts of the name to highlight: the whole typed text, or each typed word,
// where it starts a word ("bam" in "Bamboo Basket"). If the text only appears inside
// a word ("boo" in "Bamboo"), that part is highlighted instead.
function findMatches(name, query) {
  const lowerName = name.toLowerCase();
  const words = [...new Set([query, ...query.split(' ')])]
    .map((word) => word.toLowerCase())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length); // longest first, so "bamboo b" wins over "b"

  const ranges = [];
  const overlaps = (start, end) => ranges.some(([s, e]) => start < e && end > s);

  for (const word of words) {
    let index = lowerName.indexOf(word);
    while (index !== -1) {
      const end = index + word.length;
      if (!isLetterOrDigit(name[index - 1]) && !overlaps(index, end)) ranges.push([index, end]);
      index = lowerName.indexOf(word, index + 1);
    }
  }

  if (ranges.length === 0) {
    const index = lowerName.indexOf(query.toLowerCase());
    if (index !== -1) ranges.push([index, index + query.length]);
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}

// "Bamboo Basket" + "bam" -> [<mark>Bam</mark>, "boo Basket"]
function highlightMatch(name, query) {
  const parts = [];
  let position = 0;
  findMatches(name, query).forEach(([start, end]) => {
    if (start > position) parts.push(name.slice(position, start));
    parts.push(
      <mark key={start} className="search-suggest-match">
        {name.slice(start, end)}
      </mark>
    );
    position = end;
  });
  if (position < name.length) parts.push(name.slice(position));
  return parts;
}

function categoryLabel(product) {
  const names = [product.category?.name, product.subcategoryName].filter(Boolean);
  return names.join(' › ');
}

// activeIndex = the row chosen with the arrow keys (the mouse only changes the colour, using CSS :hover,
// so a row that happens to be under the pointer is never opened by Enter)
function SearchSuggestions({ id, query, products, loading, error, activeIndex, onPick, onSeeAll }) {
  const optionId = (index) => `${id}-option-${index}`;
  const seeAllIndex = products.length;

  let status = '';
  if (!loading && !error) {
    status = products.length > 0 ? `${products.length} suggestions available` : 'No products found';
  }

  return (
    // preventDefault on mouse down keeps the focus in the search box while a row is clicked
    <div className="search-suggest" onMouseDown={(event) => event.preventDefault()}>
      {products.length > 0 ? (
        <ul id={id} role="listbox" aria-label="Product suggestions" className={`search-suggest-list ${loading ? 'is-updating' : ''}`}>
          {products.map((product, index) => (
            <li
              key={product._id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={`search-suggest-item ${index === activeIndex ? 'is-active' : ''}`}
            >
              <Link to={`/products/${product._id}`} tabIndex={-1} className="search-suggest-link" onClick={onPick}>
                <ImageWithFallback src={product.imageUrl} alt="" label="Photo" width={120} className="search-suggest-thumb" />
                <span className="search-suggest-text">
                  <span className="search-suggest-name">{highlightMatch(product.name, query)}</span>
                  {categoryLabel(product) && <span className="search-suggest-category">in {categoryLabel(product)}</span>}
                </span>
                <span className="search-suggest-price">
                  {formatPrice(product.price)}
                  {product.stock === 0 && <small>Out of stock</small>}
                </span>
              </Link>
            </li>
          ))}

          {/* Last row: all products that match the whole text */}
          <li
            id={optionId(seeAllIndex)}
            role="option"
            aria-selected={activeIndex === seeAllIndex}
            className={`search-suggest-all ${activeIndex === seeAllIndex ? 'is-active' : ''}`}
            onClick={onSeeAll}
          >
            <SearchIcon size={16} />
            <span>
              See all results for “<strong>{query}</strong>”
            </span>
          </li>
        </ul>
      ) : loading ? (
        <div className="search-suggest-status">
          <span className="search-suggest-spinner" aria-hidden="true" />
          Searching for “{query}”...
        </div>
      ) : error ? (
        <div className="search-suggest-status search-suggest-error">
          Suggestions are not available right now. Press Enter to search.
        </div>
      ) : (
        <div className="search-suggest-empty">
          <strong>No products found for “{query}”</strong>
          <span>Check the spelling or try another word, like “bamboo” or “dokra”.</span>
        </div>
      )}

      {/* Thin moving line while newer suggestions load over the old ones */}
      {loading && products.length > 0 && <span className="search-suggest-progress" aria-hidden="true" />}

      {/* Read out by screen readers */}
      <p className="visually-hidden" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

export default SearchSuggestions;
