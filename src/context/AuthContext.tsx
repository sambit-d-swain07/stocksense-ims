'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  loginId?: string;
  name?: string | null;
  email: string;
  role?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; fields?: Record<string, string> }>;
  register: (loginId: string, email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; fields?: Record<string, string> }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'odoo_hack_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
        setToken(authToken);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      fetchCurrentUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const isEmail = identifier.includes('@');
      const body = isEmail ? { email: identifier, password } : { loginId: identifier, password };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Login failed',
          fields: json.error?.fields,
        };
      }

      const { token: newToken, user: userData } = json.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (loginId: string, email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, email, password, name }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Registration failed',
          fields: json.error?.fields,
        };
      }

      const { token: newToken, user: userData } = json.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
