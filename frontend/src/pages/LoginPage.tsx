import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const loggedUser = await login({ email, password });
      toast.success(`Đăng nhập thành công! Chào mừng ${loggedUser.fullName}.`);

      // Hệ thống dựa vào JWT và role thực tế từ Backend để tự động phân luồng chuyển hướng
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/', { replace: true });
      } else {
        navigate('/workspace', { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 1. Tiêu Đề Đăng Nhập Căn Giữa (Tương tự Hình 1) */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng Nhập
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Vui lòng nhập thông tin tài khoản để tiếp tục
        </p>
      </div>

      {/* 2. Khung Thông Báo Lỗi Từ Backend (nếu có) */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Form Đăng Nhập Trực Tiếp Trên Nền Trắng Thoáng */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / Tên Đăng Nhập */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email hoặc Tên Đăng Nhập
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc.skipli@gmail.com hoặc tên đăng nhập"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all shadow-xs pr-10"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Mật Khẩu */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Mật Khẩu</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all shadow-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nút Submit Màu Xanh Dương Chủ Đạo Nổi Bật */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Đăng Nhập Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
