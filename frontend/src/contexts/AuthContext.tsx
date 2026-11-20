import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi, UserProfile } from '../services/auth.api';
import { setAccessToken } from '../services/api';
import { SkipliLogo } from '../components/common/SkipliLogo';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (credentials: { email: string; password: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  setSessionUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const hasInitializedRef = useRef<boolean>(false);

  // Khởi động ứng dụng: Gọi ngầm Silent Refresh để khôi phục phiên từ Cookie HttpOnly (Singleton Guard)
  const initializeAuth = useCallback(async () => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    try {
      const res = await authApi.refresh();
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Lắng nghe sự kiện hết hạn phiên toàn diện từ api.ts
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [initializeAuth]);

  const login = async (credentials: { email: string; password: string }): Promise<UserProfile> => {
    const res = await authApi.login(credentials);
    const loggedUser = res.data?.user;
    if (!loggedUser) {
      throw new Error('Dữ liệu người dùng không hợp lệ từ máy chủ');
    }
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Lỗi làm mới profile người dùng:', err);
    }
  };

  const setSessionUser = (newUser: UserProfile) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isInitializing,
        login,
        logout,
        refreshUserProfile,
        setSessionUser,
      }}
    >
      {isInitializing ? (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-2.5 shadow-md shadow-slate-900/10 mb-4 animate-pulse">
            <SkipliLogo size={32} className="w-full h-full text-white" />
          </div>
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Đang tải dữ liệu Skipli Sales CRM...
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
