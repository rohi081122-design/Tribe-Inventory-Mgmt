// components/SearchBar.jsx
// Product search box with live suggestions (autocomplete), like big shopping websites.
// - every letter typed shows matching products from the database below the box
// - Up / Down arrows move through the suggestions; Enter opens the highlighted product,
//   or (with nothing highlighted) the results page for the whole text
// - Escape, a click outside or an empty box closes the list
// - the mic button opens the voice search pop-up: the spoken words are written into the box
//   and the results page opens by itself (voice search)
// Submitting opens /products?search=... which shows every matching product.

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SearchSuggestions from './SearchSuggestions.jsx';
import VoiceSearchDialog from './VoiceSearchDialog.jsx';
import { MicIcon, SearchIcon } from './Icons.jsx';
import useSearchSuggestions, { cleanSearchText } from '../hooks/useSearchSuggestions.js';
import { isVoiceSearchSupported } from '../hooks/useVoiceSearch.js';

function SearchBar({ size = 'normal', placeholder = 'Search...' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [voiceOpen, setVoiceOpen] = useState(false); // is the voice search pop-up open?
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // When we are already on the results page, show the current search text
  const currentSearch = location.pathname === '/products' ? searchParams.get('search') || '' : '';
  const [query, setQuery] = useState(currentSearch);
  const [open, setOpen] = useState(false); // is the suggestion list wanted (the box is in use)?
  // The highlighted row (-1 = none) and the list it belongs to: when new suggestions arrive,
  // the highlight goes away, so Enter never opens a product the buyer did not see highlighted.
  const [highlight, setHighlight] = useState({ index: -1, listKey: '' });

  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  const text = cleanSearchText(query);
  const { products, loading, error } = useSearchSuggestions(query, open);
  const showList = open && text !== '';

  // Rows the arrow keys move through: every product, then "See all results"
  const optionCount = products.length > 0 ? products.length + 1 : 0;
  const listKey = products.map((product) => product._id).join(',');
  const active = highlight.listKey === listKey && highlight.index < optionCount ? highlight.index : -1;
  const setActiveIndex = (index) => setHighlight({ index, listKey });

  function closeList() {
    setOpen(false);
    setHighlight({ index: -1, listKey: '' });
  }

  // Close the list whenever another page opens
  useEffect(() => {
    closeList();
  }, [location.pathname, location.search]);

  // Voice search: write the spoken words into the box and open the results page
  function handleVoiceResult(spokenText) {
    setQuery(spokenText);
    finishSearch();
    navigate(`/products?search=${encodeURIComponent(spokenText)}`);
  }

  function openVoiceSearch() {
    closeList();
    setVoiceOpen(true);
  }

  // Keep the list on the screen: it may only be as tall as the space below the search box.
  // When the box is low on the screen (homepage), the page scrolls up a little first.
  useLayoutEffect(() => {
    if (!showList) return undefined;
    const box = wrapperRef.current;
    const MIN_SPACE = 380; // about five suggestions and the "See all results" row

    function freeSpaceBelow() {
      const screenHeight = window.visualViewport?.height ?? window.innerHeight; // smaller while the phone keyboard is open
      return screenHeight - box.getBoundingClientRect().bottom - 24;
    }
    function fitList() {
      box.style.setProperty('--suggest-max-height', `${Math.max(160, Math.min(460, freeSpaceBelow()))}px`);
    }

    const space = freeSpaceBelow();
    if (space < MIN_SPACE) {
      const navbarBottom = document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0;
      const roomAbove = box.getBoundingClientRect().top - navbarBottom - 12;
      if (roomAbove > 0) window.scrollBy({ top: Math.min(MIN_SPACE - space, roomAbove) });
    }
    fitList();

    window.addEventListener('resize', fitList);
    window.addEventListener('scroll', fitList, { passive: true });
    window.visualViewport?.addEventListener('resize', fitList);
    return () => {
      window.removeEventListener('resize', fitList);
      window.removeEventListener('scroll', fitList);
      window.visualViewport?.removeEventListener('resize', fitList);
    };
  }, [showList]);

  // Close when clicking or tapping anywhere outside the search box and its list
  useEffect(() => {
    if (!showList) return undefined;
    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) closeList();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [showList]);

  // After choosing something: close the list and hide the phone keyboard
  function finishSearch() {
    closeList();
    inputRef.current?.blur();
  }

  function goToSearchResults() {
    finishSearch();
    navigate(text ? `/products?search=${encodeURIComponent(text)}` : '/products');
  }

  // Enter: open the highlighted product, otherwise the results page
  function handleSubmit(event) {
    event.preventDefault();
    if (showList && active >= 0 && active < products.length) {
      finishSearch();
      navigate(`/products/${products[active]._id}`);
    } else {
      goToSearchResults();
    }
  }

  function handleChange(event) {
    setQuery(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!text) return;
      event.preventDefault(); // do not move the text cursor
      if (!showList) {
        setOpen(true);
        return;
      }
      if (optionCount === 0) return;
      // Down: 0, 1, ... last, then back to the search box (-1). Up goes the other way.
      if (event.key === 'ArrowDown') {
        setActiveIndex(active + 1 >= optionCount ? -1 : active + 1);
      } else {
        setActiveIndex(active - 1 < -1 ? optionCount - 1 : active - 1);
      }
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault(); // the browser would otherwise also clear the text
      closeList();
    }
  }

  // Leaving the box with the Tab key closes the list too
  function handleBlur(event) {
    if (!wrapperRef.current?.contains(event.relatedTarget)) closeList();
  }

  return (
    <div className={`search-box search-box-${size}`} ref={wrapperRef}>
      <form className={`search-bar search-bar-${size}`} role="search" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="visually-hidden">
          Search products
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={100}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList && optionCount > 0}
          aria-controls={showList && optionCount > 0 ? listboxId : undefined}
          aria-activedescendant={showList && active >= 0 ? `${listboxId}-option-${active}` : undefined}
        />

        {/* Mic button - only in browsers that can turn speech into text */}
        {isVoiceSearchSupported() && (
          <button
            type="button"
            className="search-mic-button"
            onClick={openVoiceSearch}
            aria-haspopup="dialog"
            aria-label="Search by voice"
            title="Search by voice"
          >
            <MicIcon size={size === 'large' ? 22 : 20} />
          </button>
        )}

        <button type="submit" aria-label="Search">
          <SearchIcon size={size === 'large' ? 22 : 20} />
          {size === 'large' && <span className="search-bar-button-text">Search</span>}
        </button>
      </form>

      {/* The pop-up is only added to the page while it is open */}
      {voiceOpen && (
        <VoiceSearchDialog
          onResult={handleVoiceResult}
          onClose={() => setVoiceOpen(false)}
          onTypeInstead={() => inputRef.current?.focus()}
        />
      )}

      {showList && (
        <SearchSuggestions
          id={listboxId}
          query={text}
          products={products}
          loading={loading}
          error={error}
          activeIndex={active}
          onPick={finishSearch}
          onSeeAll={goToSearchResults}
        />
      )}
    </div>
  );
}

export default SearchBar;
