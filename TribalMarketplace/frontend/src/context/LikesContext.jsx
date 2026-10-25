// context/LikesContext.jsx
// The products the logged-in buyer liked (the ❤️ button). The list is saved in the buyer's
// account on the server, so it is the same on every device.
//   isLiked(productId)   -> true when the heart should be red
//   toggleLike(product)  -> like / unlike; returns false when nobody is logged in
//   likedIds             -> ids of the liked products, newest first (used for the navbar count)

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { likeAPI } from '../services/api.js';

const LikesContext = createContext(null);

export function LikesProvider({ children }) {
  const { user, authLoading } = useAuth();
  const [likedIds, setLikedIds] = useState([]);
  const [likesReady, setLikesReady] = useState(false); // true once the list has been loaded
  const busyIds = useRef(new Set()); // products whose like is being saved right now
  const userId = user?._id;

  // Load the list when a buyer logs in, empty it when they log out
  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) {
      setLikedIds([]);
      setLikesReady(false);
      return undefined;
    }

    let ignore = false;
    likeAPI
      .getLikes()
      .then((data) => {
        if (!ignore) setLikedIds(data.productIds);
      })
      .catch(() => {
        if (!ignore) setLikedIds([]);
      })
      .finally(() => {
        if (!ignore) setLikesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [authLoading, userId]);

  function isLiked(productId) {
    return likedIds.includes(productId);
  }

  // Likes or unlikes a product. The heart changes colour straight away; if the server
  // says no, it changes back and the error is passed on to the button (which shows it).
  async function toggleLike(product) {
    if (!user) {
      return false;
    }
    if (busyIds.current.has(product._id)) {
      return true; // a click for this product is still being saved - ignore double clicks
    }

    const wasLiked = isLiked(product._id);
    const addLike = (ids) => [product._id, ...ids.filter((id) => id !== product._id)];
    const removeLike = (ids) => ids.filter((id) => id !== product._id);

    setLikedIds(wasLiked ? removeLike : addLike);
    busyIds.current.add(product._id);
    try {
      if (wasLiked) {
        await likeAPI.unlike(product._id);
      } else {
        await likeAPI.like(product._id);
      }
    } catch (error) {
      setLikedIds(wasLiked ? addLike : removeLike); // undo
      throw error;
    } finally {
      busyIds.current.delete(product._id);
    }
    return true;
  }

  const value = { likedIds, likesReady, likeCount: likedIds.length, isLiked, toggleLike };

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes() {
  return useContext(LikesContext);
}
