// hooks/useProducts.js
// A small custom hook that loads a list of products from the backend.
// Usage:  const { products, loading, error } = useProducts({ sort: 'newest', limit: 8 });

import { useEffect, useState } from 'react';
import { productAPI } from '../services/api.js';

export default function useProducts(params) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Turn the params object into text so the effect only re-runs when the values change
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let ignore = false; // prevents updating state if the component is gone or params changed

    setLoading(true);
    setError('');

    productAPI
      .getProducts(JSON.parse(paramsKey))
      .then((data) => {
        if (!ignore) setProducts(data.products);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [paramsKey]);

  return { products, loading, error };
}
