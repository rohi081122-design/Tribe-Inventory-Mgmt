// hooks/useSearchSuggestions.js
// Live product suggestions for the search box (autocomplete), loaded from the backend.
//
//   const { products, loading, error } = useSearchSuggestions(text, enabled);
//
// - waits until the buyer stops typing for a moment (DEBOUNCE_MS) before asking the server
// - cancels the previous request when the text changes, so old answers never replace new ones
// - remembers recent answers for a minute, so typing "bam", "ba", "bam" again is instant
// - while new suggestions load, the previous ones stay visible (no flickering)

import { useEffect, useState } from 'react';
import { productAPI } from '../services/api.js';

const DEBOUNCE_MS = 150;
const CACHE_TIME_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 60;

// Shared by every search box on the page: "bamboo" -> { products, time }
const cache = new Map();

function readCache(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.time > CACHE_TIME_MS) return null;
  return entry.products;
}

function writeCache(key, products) {
  cache.delete(key); // re-insert so the newest entries are kept
  cache.set(key, { products, time: Date.now() });
  if (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value); // forget the oldest answer
  }
}

// "  Bamboo   basket " -> "Bamboo basket"
export function cleanSearchText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Does an older suggestion still fit the new text? (same idea as the server: every typed word
// must appear in the name or category; with 1-2 letters only at the start of a word)
function stillMatches(product, key) {
  const text = [product.name, product.category?.name, product.subcategoryName].filter(Boolean).join(' ');
  return key.split(' ').every((word) => {
    const pattern = key.length < 3 ? `(^|[^a-z0-9])${escapeRegex(word)}` : escapeRegex(word);
    return new RegExp(pattern, 'i').test(text);
  });
}

export default function useSearchSuggestions(text, enabled = true) {
  const query = cleanSearchText(text);
  const key = query.toLowerCase();
  const cached = key ? readCache(key) : null;

  // The last answer that came back from the server (it may be for an older text)
  const [lastAnswer, setLastAnswer] = useState({ key: '', products: [], error: '' });

  useEffect(() => {
    if (!enabled || !key || readCache(key)) return undefined;

    const controller = new AbortController();
    const timerId = setTimeout(() => {
      productAPI
        .getSuggestions(query, controller.signal)
        .then((data) => {
          writeCache(key, data.products);
          setLastAnswer({ key, products: data.products, error: '' });
        })
        .catch((error) => {
          if (error.name === 'AbortError') return; // the text changed - a newer request is on its way
          setLastAnswer({ key, products: [], error: error.message });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [enabled, key, query]);

  if (!key) {
    return { query, products: [], loading: false, error: '' };
  }
  if (cached) {
    return { query, products: cached, loading: false, error: '' };
  }
  if (lastAnswer.key === key && lastAnswer.error) {
    return { query, products: [], loading: false, error: lastAnswer.error };
  }
  // Still loading. While the buyer is adding or removing letters of the same word ("ba" -> "bam"),
  // keep showing those previous suggestions that still fit the new text;
  // for a completely new word, show only "Searching...".
  const sameWord = lastAnswer.key && (key.startsWith(lastAnswer.key) || lastAnswer.key.startsWith(key));
  const stillUseful = sameWord ? lastAnswer.products.filter((product) => stillMatches(product, key)) : [];
  return { query, products: stillUseful, loading: true, error: '' };
}
