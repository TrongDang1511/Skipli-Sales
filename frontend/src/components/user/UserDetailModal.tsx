import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Tag,
  Shield,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  Edit3,
  Eye,
  AtSign,
} from 'lucide-react';
import { UserProfile } from '../../services/auth.api';
import { useToast } from '../../contexts/ToastContext';

interface UserDetailModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  initialMode?: 'view' | 'edit';
  onClose: () => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
  onToggleStatus: (userId: string, currentStatus: boolean, fullName: string) => Promise<void>;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  user,
  initialMode = 'view',
  onClose,
  onUserUpdated,
  onToggleStatus,
}) => {
  const toast = useToast();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [salesPrefix, setSalesPrefix] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setSalesPrefix(user.salesPrefix);
      setIsActive(user.isActive);
      setMode(initialMode);
    }
  }, [user, initialMode]);

  if (!isOpen || !user) return null;

  const isSelf = user.role === 'ADMIN';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Nếu trạng thái thay đổi, gọi API toggle-status hiện có
      if (isActive !== user.isActive && !isSelf) {
        await onToggleStatus(user.id, user.isActive, user.fullName);
      }

      // Cập nhật state nhân sự
      const updatedUser: UserProfile = {
        ...user,
        fullName: fullName.trim(),
        salesPrefix: salesPrefix.toUpperCase().trim(),
        isActive,
        updatedAt: new Date().toISOString(),
      };

      onUserUpdated(updatedUser);
      toast.success(`Đã cập nhật thông tin nhân viên ${updatedUser.fullName} thành công!`);
      setMode('view');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật nhân viên thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden animate-scale-in">
        {/* =================================================================== */}
        {/* HEADER MODAL: AVATAR & THÔNG TIN TỔNG QUAN                          */}
        {/* =================================================================== */}
        <div className="p-6 bg-[#FAF8F5] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl font-black text-lg flex items-center justify-center border shadow-xs shrink-0 ${
                user.role === 'ADMIN'
                  ? 'bg-[#071E3D] text-white border-slate-700'
                  : 'bg-sky-50 border-sky-200 text-sky-700'
              }`}
            >
              {user.salesPrefix || 'SH'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {user.fullName}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Chuyên Viên Sales'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Chuyển đổi View / Edit */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setMode('view')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  mode === 'view'
                    ? 'bg-[#071E3D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Hồ Sơ</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  mode === 'edit'
                    ? 'bg-[#071E3D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* NỘI DUNG 2 CỘT THEO TINH THẦN HÌNH 5 & HÌNH 6                      */}
        {/* =================================================================== */}
        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CỘT TRÁI (8 / 12 Cột): FORM THÔNG TIN NHÂN VIÊN                    */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Thông Tin Nhân Sự
              </h4>

              <div className="space-y-3.5">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ Và Tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={mode === 'view'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        mode === 'view'
                          ? 'bg-slate-50 border-slate-200 text-slate-800 cursor-not-allowed'
                          : 'bg-white border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Email (Read-only cố định trong CSDL) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Doanh Nghiệp (Tài khoản)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tên đăng nhập Username (nếu có) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (Username)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={user.username || 'Chưa thiết lập (Đăng nhập qua Email)'}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Mã Tiền Tố Sales Prefix */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Tiền Tố Prefix (Định Danh Leads)
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={mode === 'view'}
                      value={salesPrefix}
                      onChange={(e) => setSalesPrefix(e.target.value.toUpperCase())}
                      maxLength={4}
                      required
                      className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-mono font-bold uppercase border transition-all ${
                        mode === 'view'
                          ? 'bg-slate-50 border-slate-200 text-slate-800 cursor-not-allowed'
                          : 'bg-white border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tiền tố gán tự động vào khách hàng nhà hàng (VD: {salesPrefix || 'TR'}_1001).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 / 12 Cột): PHÂN QUYỀN & THÔNG TIN HỆ THỐNG             */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Quyền Hạn & Trạng Thái
            </h4>

            {/* Thẻ Trạng Thái Hoạt Động */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Trạng Thái Tài Khoản</span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang Hoạt Động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Tạm Khóa
                  </span>
                )}
              </div>

              {mode === 'edit' && !isSelf && (
                <div className="pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Chuyển Sang Tạm Khóa' : 'Kích Hoạt Tài Khoản'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Thẻ Ngày Tham Gia & Bảo Mật */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ngày Tham Gia:
                </span>
                <span className="font-bold text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Cơ Chế Bảo Mật:
                </span>
                <span className="font-semibold text-emerald-700">Dual-Token JWT</span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Quyền Tiếp Cận:
                </span>
                <span className="font-bold text-slate-800">Leads Nhà Hàng Mỹ</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* FOOTER ACTIONS                                                    */}
          {/* ================================================================= */}
          <div className="md:col-span-12 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>

            <div className="flex items-center gap-2">
              {mode === 'view' ? (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Hồ Sơ</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailModal;
