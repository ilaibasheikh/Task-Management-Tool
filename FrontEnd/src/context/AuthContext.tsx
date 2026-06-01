import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, login, register } from '../api/auth';
import type { UserProfile } from '../types/auth';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('task-tool-token')));

  useEffect(() => {
    if (!localStorage.getItem('task-tool-token')) {
      return;
    }

    getProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem('task-tool-token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      const response = await login(email, password);
      localStorage.setItem('task-tool-token', response.token);
      setUser(response.user);
    },
    signUp: async (fullName, email, password) => {
      const response = await register(fullName, email, password);
      localStorage.setItem('task-tool-token', response.token);
      setUser(response.user);
    },
    logout: () => {
      localStorage.removeItem('task-tool-token');
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
