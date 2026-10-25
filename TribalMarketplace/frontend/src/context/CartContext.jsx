// context/CartContext.jsx
// The shopping cart, saved in the browser's localStorage.
// Only LOGGED-IN buyers can use the cart: addToCart() returns false when nobody is logged in,
// and the cart is emptied when the buyer logs out.
// The cart is not an order - prices are checked again by the backend at checkout.

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'tribal_marketplace_cart';
const MAX_QUANTITY = 20;

// Reads the saved cart (returns an empty cart if nothing valid is saved)
function loadSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.filter((item) => item && item.productId && Number(item.quantity) > 0);
  } catch {
    return [];
  }
}

// Largest quantity allowed for an item (limited by stock when the seller provided it)
function getMaxQuantity(stock) {
  return typeof stock === 'number' ? Math.min(stock, MAX_QUANTITY) : MAX_QUANTITY;
}

export function CartProvider({ children }) {
  const { user, authLoading } = useAuth();
  const [cartItems, setCartItems] = useState(loadSavedCart);

  // Save the cart every time it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Storage can be blocked (private mode). The cart still works until the page is closed.
    }
  }, [cartItems]);

  // Nobody logged in (or the buyer logged out): empty the cart
  useEffect(() => {
    if (!authLoading && !user) {
      setCartItems([]);
    }
  }, [authLoading, user]);

  // Returns false when nobody is logged in (the page then sends the visitor to the login page)
  function addToCart(product, quantity = 1) {
    if (!user) {
      return false;
    }
    const maxQuantity = getMaxQuantity(product.stock);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product._id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxQuantity) }
            : item
        );
      }

      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.image?.url || '',
        stock: typeof product.stock === 'number' ? product.stock : null,
        quantity: Math.min(quantity, maxQuantity),
      };
      return [...currentItems, newItem];
    });
    return true;
  }

  // Removes several products at once (used after they were ordered)
  function removeManyFromCart(productIds) {
    setCartItems((currentItems) => currentItems.filter((item) => !productIds.includes(item.productId)));
  }

  function updateQuantity(productId, quantity) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item;
        }
        const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, getMaxQuantity(item.stock)));
        return { ...item, quantity: safeQuantity };
      })
    );
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setCartItems([]);
  }

  // Updates names / prices / stock using fresh data from the backend.
  // Products that no longer exist are marked as unavailable.
  function refreshCartItems(latestProducts) {
    const productsById = {};
    latestProducts.forEach((product) => {
      productsById[product._id] = product;
    });

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        const latest = productsById[item.productId];
        if (!latest) {
          return { ...item, unavailable: true };
        }
        const stock = typeof latest.stock === 'number' ? latest.stock : null;
        return {
          ...item,
          name: latest.name,
          price: latest.price,
          imageUrl: latest.image?.url || '',
          stock,
          unavailable: stock === 0,
          quantity: stock ? Math.min(item.quantity, getMaxQuantity(stock)) : item.quantity,
        };
      })
    );
  }

  const availableItems = cartItems.filter((item) => !item.unavailable);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = availableItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeManyFromCart,
    clearCart,
    refreshCartItems,
    getMaxQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
