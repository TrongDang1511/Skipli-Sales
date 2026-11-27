import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authApi } from '../services/auth.api';
import { extractApiErrorMessage } from '../services/lead.api';
import { useToast } from '../contexts/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      setIsSent(true);
      toast.success(res.message || 'Đã gửi hướng dẫn đặt lại mật khẩu!');
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Không thể gửi yêu cầu đặt lại mật khẩu!');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
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
              Liên kết có hiệu lực 15 phút
            </Badge>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kiểm Tra Hộp Thư Của Bạn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Nếu email <span className="font-semibold text-slate-800">{email}</span> tồn tại và đã kích hoạt, hệ thống đã gửi hướng dẫn đặt lại mật khẩu tới hộp thư của bạn.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              asChild
              className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm"
            >
              <Link to="/login">
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Trang Đăng Nhập</span>
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
            >
              Chưa nhận được email? Gửi lại với email khác
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <Badge
          variant="outline"
          className="mb-3 bg-sky-50 text-sky-700 border-sky-200 font-semibold gap-1.5"
        >
          <KeyRound className="w-3 h-3" />
          <span>Khôi Phục Quyền Truy Cập</span>
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quên Mật Khẩu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Nhập email tài khoản Skipli Sales để nhận liên kết đặt lại mật khẩu mới
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
            Email Công Việc
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@skipli.com"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all pr-10"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full h-12 mt-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Gửi Link Đặt Lại Mật Khẩu</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
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

export default ForgotPasswordPage;
