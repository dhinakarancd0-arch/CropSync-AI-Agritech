import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('agridirect_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authService.getMe()
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('agridirect_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('agridirect_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user as User);
  };

  const register = async (data: Record<string, any>) => {
    const res = await authService.register(data);
    localStorage.setItem('agridirect_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user as User);
  };

  const logout = () => {
    localStorage.removeItem('agridirect_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
