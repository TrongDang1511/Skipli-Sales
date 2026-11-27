import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { getPasswordStrength } from '@/lib/utils';
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

export const ActivateAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setSessionUser } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const strength = getPasswordStrength(password, 8);
  const isMatch = password && confirmPassword && password === confirmPassword;

  // Nếu không có token trên URL
  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4 py-8 max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Liên Kết Không Hợp Lệ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Đường link này thiếu mã xác thực hợp lệ. Vui lòng kiểm tra lại email của bạn hoặc liên hệ Quản trị viên để được cấp lại link mời mới.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Trang Đăng Nhập</span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || strength < 2) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authApi.activate({ token, username, password });
      const activatedUser = res.data?.user;
      if (activatedUser) {
        setSessionUser(activatedUser);
      }
      toast.success('Kích hoạt tài khoản thành công! Chào mừng bạn gia nhập Skipli Sales.');
      navigate(activatedUser?.role === 'ADMIN' ? '/' : '/workspace', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Kích hoạt tài khoản thất bại!';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Tiêu Đề Kích Hoạt */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xác Thực Email Hợp Lệ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kích Hoạt Tài Khoản
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Thiết lập tên đăng nhập và mật khẩu để bắt đầu làm việc
        </p>
      </div>

      {/* Thông Báo Lỗi Backend */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Kích Hoạt */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên Đăng Nhập (Username)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="VD: trongnguyen"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all shadow-xs pr-10"
            />
            <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dùng để đăng nhập thay cho email doanh nghiệp.</p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật Khẩu Mới</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
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

          {/* Thanh đo độ mạnh mật khẩu */}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1.5 h-1.5 w-full">
                <div
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    strength >= 1 ? (strength === 1 ? 'bg-red-500' : 'bg-sky-400') : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    strength >= 2 ? 'bg-sky-600' : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    strength === 3 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Độ an toàn:</span>
                <span className="font-bold">
                  {strength === 1 && <span className="text-red-600">Yếu (cần thêm hoa, số)</span>}
                  {strength === 2 && <span className="text-sky-600">Khá tốt</span>}
                  {strength === 3 && <span className="text-emerald-600">Rất mạnh & an toàn</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Xác Nhận Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all shadow-xs pr-10"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {confirmPassword && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {isMatch ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mật khẩu khớp hoàn toàn
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Mật khẩu chưa trùng khớp
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nút Kích Hoạt Màu Xanh Dương Chủ Đạo Nổi Bật */}
        <button
          type="submit"
          disabled={isLoading || !isMatch || strength < 2}
          className="w-full mt-3 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Hoàn Tất Kích Hoạt & Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Link quay lại */}
        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← Quay lại trang đăng nhập
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ActivateAccountPage;
