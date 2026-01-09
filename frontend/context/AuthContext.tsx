
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; pass: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('stams_token');
    const savedUser = localStorage.getItem('stams_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; pass: string }) => {
    try {
      // محاكاة استجابة الباك اند بناءً على المدخلات
      let role = UserRole.CUSTOMER;
      let name = 'مسافر جديد';

      if (credentials.username === 'admin') {
        role = UserRole.ADMIN;
        name = 'المدير العام للمنظومة';
      } else if (credentials.username === 'agent') {
        role = UserRole.AGENT;
        name = 'وكالة الأفق للسياحة';
      } else if (credentials.username === 'supplier' || credentials.username === 'pro') {
        role = UserRole.PROVIDER;
        name = 'طيران بلقيس (مزود)';
      } else if (credentials.username.includes('@gmail.com')) {
        role = UserRole.CUSTOMER;
        name = 'مستخدم جوجل (مؤكد)';
      }

      const mockUser: User = {
        id: `u-${Date.now()}`,
        username: credentials.username,
        name: name,
        role: role,
        balance: credentials.username === 'agent' ? 50000 : 0,
        email: credentials.username,
        createdAt: new Date().toISOString()
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.STAMS_MOCK_TOKEN';

      localStorage.setItem('stams_token', mockToken);
      localStorage.setItem('stams_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('Login Failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('stams_token');
    localStorage.removeItem('stams_user');
    setToken(null);
    setUser(null);
    window.location.reload(); // إعادة تحميل التطبيق لضمان تنظيف الحالة
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
