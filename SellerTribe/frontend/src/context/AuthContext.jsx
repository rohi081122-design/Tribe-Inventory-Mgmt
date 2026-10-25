// context/AuthContext.jsx
// Keeps track of the logged-in seller for the whole app.
// The login token is in an HTTP-only cookie that JavaScript cannot read,
// so we ask the backend "who am I?" (GET /api/auth/me) when the app starts.

import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authAPI
      .getCurrentSeller()
      .then((data) => setSeller(data.seller))
      .catch(() => setSeller(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // identifier = contact number or Aadhaar number
  async function login(identifier) {
    const data = await authAPI.login(identifier);
    setSeller(data.seller);
    return data;
  }

  async function register(sellerData) {
    const data = await authAPI.register(sellerData);
    setSeller(data.seller);
    return data;
  }

  async function logout() {
    try {
      await authAPI.logout();
    } finally {
      setSeller(null);
    }
  }

  // Loads the seller again from the server (for example to see if the team has approved them yet)
  async function refreshSeller() {
    try {
      const data = await authAPI.getCurrentSeller();
      setSeller(data.seller);
    } catch {
      // keep the current data if the server cannot be reached
    }
  }

  // Only sellers approved by the Tribal Marketplace team can upload products
  const isApproved = Boolean(seller?.isApproved);

  const value = { seller, isApproved, authLoading, login, register, logout, refreshSeller };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Usage inside a component:  const { seller, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
