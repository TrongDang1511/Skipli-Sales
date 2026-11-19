import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Tag,
  KeyRound,
  AtSign,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { authApi, UserProfile } from '../../services/auth.api';
import { useToast } from '../../contexts/ToastContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: (user: UserProfile) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [salesPrefix, setSalesPrefix] = useState('');
  const [username, setUsername] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = fullName.trim();
      const cleanPrefix = salesPrefix.toUpperCase().trim();
      const hasDirectCredentials = directPassword.trim().length > 0;

      // TỰ ĐỘNG CHỌN PHƯƠNG THỨC BÀN GIAO THEO DỮ LIỆU ĐẦU VÀO
      // Nếu có nhập mật khẩu -> Nhánh B (Cấp tài khoản trực tiếp)
      // Nếu để trống mật khẩu -> Nhánh A (Gửi lời mời kích hoạt qua Email Brevo)
      const mode = hasDirectCredentials ? 'direct' : 'invite';

      const payload: {
        email: string;
        fullName: string;
        salesPrefix: string;
        mode: 'invite' | 'direct';
        directPassword?: string;
      } = {
        email: cleanEmail,
        fullName: cleanFullName,
        salesPrefix: cleanPrefix,
        mode,
      };

      if (hasDirectCredentials) {
        payload.directPassword = directPassword.trim();
      }

      const res = await authApi.inviteUser(payload);
      const createdUser = res.data?.user;

      if (mode === 'direct') {
        toast.success(`Đã cấp tài khoản trực tiếp thành công cho ${cleanFullName}!`);
      } else {
        toast.success(`Đã gửi email mời kích hoạt qua Brevo tới ${cleanEmail}!`);
      }

      if (onUserCreated && createdUser) {
        onUserCreated(createdUser);
      }

      // Reset form
      setFullName('');
      setEmail('');
      setSalesPrefix('');
      setUsername('');
      setDirectPassword('');
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Khởi tạo tài khoản nhân viên thất bại!';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden animate-scale-in">
        {/* =================================================================== */}
        {/* HEADER MODAL: TIÊU ĐỀ THEO PHONG CÁCH HÌNH 3 & 4                    */}
        {/* =================================================================== */}
        <div className="p-6 bg-[#FAF8F5] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Thêm Nhân Viên Sales Mới
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập chuyên viên tiếp cận nhà hàng Mỹ và phân bổ tiền tố Leads cá nhân
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo lỗi (nếu có) */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* FORM GỘP DUY NHẤT: BỐ CỤC 2 CỘT CHUẨN ENTERPRISE                    */}
        {/* =================================================================== */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CỘT TRÁI (7 / 12 Cột): CÁC TRƯỜNG THÔNG TIN CƠ BẢN & MẬT KHẨU       */}
          <div className="md:col-span-7 space-y-4">
            {/* Nhóm 1: Thông tin nhân sự */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông Tin Nhân Sự Bắt Buộc
                </h4>
              </div>

              <div className="space-y-3">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ Và Tên Nhân Viên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="VD: Trọng Nguyễn"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Công Vụ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: trong@skipli.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Tiền tố Sales Prefix */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Tiền Tố Prefix (2-3 ký tự) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={salesPrefix}
                      onChange={(e) => setSalesPrefix(e.target.value.toUpperCase())}
                      placeholder="VD: TR"
                      maxLength={4}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Thiết lập tài khoản trực tiếp (Tùy chọn) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thiết Lập Tài Khoản (Tùy Chọn)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                  Không bắt buộc
                </span>
              </div>

              <div className="space-y-3">
                {/* Tên đăng nhập Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (Username)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="VD: trong_skipli (tùy chọn)"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Mật khẩu khởi tạo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu Khởi Tạo
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={directPassword}
                      onChange={(e) => setDirectPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự (để trống nếu gửi mail mời)"
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* DÒNG GỢI Ý THÔNG MINH TỰ NHIÊN (Không chia nhánh) */}
              <div className="mt-3.5 p-3 rounded-xl bg-sky-50/70 border border-sky-100/80 text-[11px] text-sky-900 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Gợi ý:</strong> Để trống Tên đăng nhập & Mật khẩu nếu muốn hệ thống tự gửi
                  lời mời kích hoạt qua email Brevo; nhập đầy đủ để cấp tài khoản trực tiếp ngay lập
                  tức.
                </span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 / 12 Cột): PREVIEW CARD & HƯỚNG DẪN NHANH (HÌNH 3 & 4)    */}
          <div className="md:col-span-5 space-y-4">
            {/* 1. Card Xem trước thẻ nhân viên */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Xem Trước Thẻ Nhân Sự
              </span>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 font-black text-sm flex items-center justify-center shrink-0">
                  {salesPrefix.trim() || 'TR'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {fullName.trim() || 'Tên Nhân Viên Mới'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {email.trim() || 'email@skipli.com'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                      SALES
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Tiền tố: {salesPrefix.trim() || 'TR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Card Hướng dẫn nhanh (Quick Tips phong cách Hình 3) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quy Chuẩn Hệ Thống
              </span>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tiền tố Leads:</strong> Tự động gán mã định danh khi gọi AI (VD: Lead{' '}
                    {salesPrefix || 'TR'}_001).
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tự động kích hoạt:</strong> Tự nhận diện luồng email mời hoặc cấp ngay
                    không cần chuyển tab.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chuẩn bảo mật:</strong> Mã hóa một chiều Bcrypt & Dual-Token chống rò rỉ.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* FOOTER ACTIONS MODAL                                              */}
          {/* ================================================================= */}
          <div className="md:col-span-12 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Khởi Tạo...' : '+ Tạo & Bàn Giao Tài Khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;
