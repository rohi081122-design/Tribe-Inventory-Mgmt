// context/AuthContext.jsx
// Keeps track of the logged-in user for the whole app.
// The login token itself is in an HTTP-only cookie that JavaScript cannot read,
// so we ask the backend "who am I?" (GET /api/auth/me) when the app starts.

import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check the session once when the website loads
  useEffect(() => {
    authAPI
      .getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  async function login(credentials) {
    const data = await authAPI.login(credentials);
    setUser(data.user);
    return data;
  }

  async function register(userData) {
    const data = await authAPI.register(userData);
    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    authLoading,
    isLoggedIn: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Usage inside a component:  const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
