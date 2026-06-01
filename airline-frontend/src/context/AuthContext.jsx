import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ha_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((userData) => {
    localStorage.setItem('ha_token', userData.token);
    localStorage.setItem('ha_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ha_token');
    localStorage.removeItem('ha_user');
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user?.token);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
