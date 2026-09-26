'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

interface StoredUser extends User {
  _password: string; // hashed/stored only in mock localStorage
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

// ─────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────
const SESSION_KEY = 'stocksense:session'; // { token, user }
const USERS_KEY = 'stocksense:users';     // StoredUser[]

// ─────────────────────────────────────────────
// Demo seed user
// ─────────────────────────────────────────────
const DEMO_USER: StoredUser = {
  id: 'usr_demo01',
  loginId: 'demo01',
  name: 'Demo User',
  email: 'demo@stocksense.dev',
  createdAt: '2024-01-01T00:00:00.000Z',
  role: 'MANAGER',
  _password: 'Demo@123',
};

// ─────────────────────────────────────────────
// Helpers (safe – never throw)
// ─────────────────────────────────────────────
function seedDemoUser(): void {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    const exists = users.some((u) => u.loginId === DEMO_USER.loginId);
    if (!exists) {
      users.push(DEMO_USER);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch {
    // ignore
  }
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function getSession(): { token: string; user: User } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user?.loginId) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveSession(token: string, user: User): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  } catch {
    // ignore
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function makeMockToken(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Init: runs ONCE synchronously after first render (no network calls) ──
  useEffect(() => {
    try {
      seedDemoUser();
      const session = getSession();
      if (session) {
        setUser(session.user);
        setToken(session.token);
      }
    } catch {
      // failsafe: ignore any error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login ──
  const login = useCallback(
    async (
      loginId: string,
      password: string
    ): Promise<{ success: boolean; error?: string; fields?: Record<string, string> }> => {
      try {
        const users = getUsers();
        const found = users.find((u) => u.loginId === loginId.trim());

        if (!found) {
          return {
            success: false,
            error: 'No account found with that Login ID.',
            fields: { loginId: 'No account found with that Login ID.' },
          };
        }

        if (found._password !== password) {
          return {
            success: false,
            error: 'Incorrect password.',
            fields: { password: 'Incorrect password.' },
          };
        }

        // Strip internal _password before storing in session
        const { _password: _p, ...safeUser } = found;
        const newToken = makeMockToken();

        saveSession(newToken, safeUser);
        setToken(newToken);
        setUser(safeUser);
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Failed to sign in. Please try again.',
        };
      }
    },
    []
  );

  // ── Register ──
  const register = useCallback(
    async (
      data: RegisterInput
    ): Promise<{ success: boolean; error?: string; fields?: Record<string, string> }> => {
      try {
        const users = getUsers();
        const loginIdTaken = users.some((u) => u.loginId === data.loginId.trim());
        if (loginIdTaken) {
          return {
            success: false,
            error: 'This Login ID is already taken.',
            fields: { loginId: 'This Login ID is already taken.' },
          };
        }

        const emailTaken = users.some(
          (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
        );
        if (emailTaken) {
          return {
            success: false,
            error: 'An account with this email already exists.',
            fields: { email: 'An account with this email already exists.' },
          };
        }

        const newUser: StoredUser = {
          id: `usr_${Date.now()}`,
          loginId: data.loginId.trim(),
          name: data.name?.trim() || data.loginId.trim(),
          email: data.email.trim().toLowerCase(),
          createdAt: new Date().toISOString(),
          role: 'STAFF',
          _password: data.password,
        };

        saveUsers([...users, newUser]);

        const { _password: _p, ...safeUser } = newUser;
        const newToken = makeMockToken();

        saveSession(newToken, safeUser);
        setToken(newToken);
        setUser(safeUser);
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Failed to create account. Please try again.',
        };
      }
    },
    []
  );

  // ── Logout ──
  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

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
