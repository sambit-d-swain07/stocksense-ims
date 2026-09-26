'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface User {
  id: string;
  loginId: string;
  name?: string | null;
  email: string;
  createdAt: string;
  role?: string;
}

export interface RegisterInput {
  loginId: string;
  email: string;
  password: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    loginId: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; fields?: Record<string, string> }>;
  register: (
    data: RegisterInput
  ) => Promise<{ success: boolean; error?: string; fields?: Record<string, string> }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'odoo_hack_auth_token';
const USER_KEY = 'odoo_hack_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMounted = useRef<boolean>(false);

  // Initialize session from localStorage safely with strict timeout
  useEffect(() => {
    isMounted.current = true;
    let didTimeout = false;

    // Guaranteed fallback: stop loading after 3 seconds no matter what
    const safetyTimer = setTimeout(() => {
      didTimeout = true;
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 3000);

    const initAuth = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

        if (!savedToken) {
          if (isMounted.current && !didTimeout) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        // Try reading cached user session directly from localStorage (mock/offline mode)
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            if (parsedUser && parsedUser.loginId) {
              if (isMounted.current && !didTimeout) {
                setUser(parsedUser);
                setToken(savedToken);
                setIsLoading(false);
              }
              return;
            }
          } catch (e) {
            // Invalid JSON in localStorage
          }
        }

        // If no user object in localStorage or token is real JWT, attempt fetch with 2s abort timeout
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 2000);

        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
            signal: controller.signal,
          });
          clearTimeout(fetchTimeout);

          if (res.ok) {
            const json = await res.json();
            if (json?.data?.user && isMounted.current && !didTimeout) {
              setUser(json.data.user);
              setToken(savedToken);
              localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));
              return;
            }
          }
        } catch (fetchErr) {
          // Backend offline or timed out
        }

        // If backend verification failed, check if it's a mock token session
        if (savedToken.startsWith('mock_') || savedUserStr) {
          if (savedUserStr) {
            const fallbackUser = JSON.parse(savedUserStr);
            if (isMounted.current && !didTimeout) {
              setUser(fallbackUser);
              setToken(savedToken);
              return;
            }
          }
        }

        // Otherwise treat user as logged out
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
        if (isMounted.current && !didTimeout) {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted.current && !didTimeout) {
          setUser(null);
          setToken(null);
        }
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted.current && !didTimeout) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted.current = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (loginId: string, password: string) => {
    try {
      // First attempt backend login if running, with a 2.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId, password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const json = await res.json().catch(() => null);

        if (res.ok && json?.data?.token && json?.data?.user) {
          const { token: newToken, user: userData } = json.data;
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          setToken(newToken);
          setUser(userData);
          return { success: true };
        }

        if (json?.error && (res.status === 400 || res.status === 401)) {
          return {
            success: false,
            error: json.error?.message || 'Invalid credentials',
            fields: json.error?.fields,
          };
        }
      } catch (e) {
        // Backend not reachable, proceed to mock session mode
      }

      // Standalone Mock Mode: Accept any valid input, save session to localStorage
      const mockToken = `mock_token_${Date.now()}`;
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        loginId: loginId.trim(),
        name: loginId.trim(),
        email: `${loginId.trim().toLowerCase()}@stocksense.local`,
        createdAt: new Date().toISOString(),
        role: 'MANAGER',
      };

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to sign in. Please try again.',
      };
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const json = await res.json().catch(() => null);

        if (res.ok && json?.data?.token && json?.data?.user) {
          const { token: newToken, user: userData } = json.data;
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          setToken(newToken);
          setUser(userData);
          return { success: true };
        }

        if (json?.error && (res.status === 400 || res.status === 409 || res.status === 422)) {
          return {
            success: false,
            error: json.error?.message || 'Registration failed',
            fields: json.error?.fields,
          };
        }
      } catch (e) {
        // Backend offline, proceed to mock session
      }

      // Standalone Mock Mode: Save new user session
      const mockToken = `mock_token_${Date.now()}`;
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        loginId: data.loginId.trim(),
        name: data.name || data.loginId.trim(),
        email: data.email.trim(),
        createdAt: new Date().toISOString(),
        role: 'STAFF',
      };

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to create account. Please try again.',
      };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      // ignore
    }
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
