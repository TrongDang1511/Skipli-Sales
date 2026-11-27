import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authApi } from '../services/auth.api';
import { extractApiErrorMessage } from '../services/lead.api';
import { getPasswordStrength } from '@/lib/utils';
import { useToast } from '../contexts/ToastContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const strength = getPasswordStrength(password, 6);
  const isValidLength = password.length >= 6;
  const isMatch = Boolean(password && confirmPassword && password === confirmPassword);

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4 py-6 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Liên Kết Không Hợp Lệ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Đường dẫn thiếu mã xác thực đặt lại mật khẩu. Vui lòng gửi lại yêu cầu mới từ màn hình quên mật khẩu.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold h-10 px-5"
            >
              <Link to="/forgot-password">
                <ArrowLeft className="w-4 h-4" />
                <span>Gửi Lại Yêu Cầu</span>
              </Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center space-y-5 py-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
            >
              Hoàn Tất Bảo Mật
            </Badge>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Đổi Mật Khẩu Thành Công!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Mật khẩu mới của bạn đã được lưu an toàn. Hãy chuyển về trang đăng nhập để vào lại bàn làm việc.
            </p>
          </div>

          <div className="pt-2">
            <Button
              asChild
              className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20"
            >
              <Link to="/login">
                <span>Chuyển Về Trang Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLength || !isMatch) return;

    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      toast.success(res.message || 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Đặt lại mật khẩu thất bại!');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <Badge
          variant="outline"
          className="mb-3 bg-sky-50 text-sky-700 border-sky-200 font-semibold gap-1.5"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Thiết Lập Mật Khẩu Mới</span>
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Đặt Lại Mật Khẩu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Nhập mật khẩu mới cho tài khoản Skipli Sales của bạn
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mật Khẩu Mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

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
                  {strength === 1 && <span className="text-red-600">Yếu (nên thêm chữ hoa, số)</span>}
                  {strength === 2 && <span className="text-sky-600">Khá tốt</span>}
                  {strength === 3 && <span className="text-emerald-600">Rất mạnh & an toàn</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Xác Nhận Mật Khẩu Mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all pr-10"
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

        <Button
          type="submit"
          disabled={isLoading || !isValidLength || !isMatch}
          className="w-full h-12 mt-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Lưu Mật Khẩu Mới</span>
          )}
        </Button>

        <div className="text-center pt-1">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang đăng nhập</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
