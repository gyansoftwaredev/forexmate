"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL, { setMemoryToken, authFetch, apiJson, refreshAuthSession } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  mobile?: string | null;
  phone?: string | null;
  pan?: string | null;
  panNumber?: string | null;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (accessToken: string, userData: User) => {
    // If switching users, wipe any lingering transaction draft from another user
    const previousUserStr = localStorage.getItem('forexmate_user');
    if (previousUserStr) {
      try {
        const prev = JSON.parse(previousUserStr);
        if (prev.id && prev.id !== userData.id) {
          localStorage.removeItem('forexmate-transaction-storage');
          localStorage.removeItem('user_saved_kyc');
          localStorage.removeItem('user');
        }
      } catch (_) {}
    }
    setMemoryToken(accessToken);
    setUser(userData);
    localStorage.setItem('forexmate_user', JSON.stringify(userData));
    localStorage.setItem('forexmate_token', accessToken);
  };

  const logout = async () => {
    try {
      await authFetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setMemoryToken(null);
      setUser(null);
      localStorage.removeItem('forexmate_user');
      localStorage.removeItem('forexmate_token');
      localStorage.removeItem('forexmate-transaction-storage');
      localStorage.removeItem('user_saved_kyc');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const success = await refreshAuthSession();
      if (success) {
        // Fetch profile to verify and populate state
        const meRes = await authFetch(`${API_URL}/auth/me`);
        if (meRes.ok) {
          const userData = await apiJson(meRes);
          setUser(userData);
          localStorage.setItem('forexmate_user', JSON.stringify(userData));
          return true;
        }
      }
    } catch (error) {
      console.error('Session restoration failed:', error);
    }
    return false;
  };

  // Attempt to restore session on initial load
  useEffect(() => {
    const initAuth = async () => {
      // First try to load cached user profile details from localStorage for speed
      const cached = localStorage.getItem('forexmate_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (_) {}
      }

      // Re-verify session integrity with the backend by fetching /me
      // authFetch will automatically handle refreshing if the token is expired
      try {
        const meRes = await authFetch(`${API_URL}/auth/me`);
        if (meRes.ok) {
          const userData = await apiJson(meRes);
          setUser(userData);
          localStorage.setItem('forexmate_user', JSON.stringify(userData));
        } else {
          throw new Error('Session invalid');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('forexmate_user');
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
