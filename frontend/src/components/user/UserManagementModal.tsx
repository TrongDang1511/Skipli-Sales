import React, { useState } from 'react';
import { authApi, UserProfile } from '../../services/auth.api';
import { useToast } from '../../contexts/ToastContext';
import { X, Mail, KeyRound, User, Tag, Send, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'INVITE' | 'DIRECT'>('INVITE');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [salesPrefix, setSalesPrefix] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload: {
        email: string;
        fullName: string;
        salesPrefix: string;
        mode: 'invite' | 'direct';
        directPassword?: string;
      } = {
        email,
        fullName,
        salesPrefix: salesPrefix.toUpperCase().trim(),
        mode: activeTab === 'INVITE' ? 'invite' : 'direct',
      };

      if (activeTab === 'DIRECT') {
        payload.directPassword = directPassword;
      }

      const res = await authApi.inviteUser(payload);
      const createdUser = res.data?.user;

      toast.success(
        activeTab === 'INVITE'
          ? `Đã gửi email mời Brevo kèm link kích hoạt tới ${email}!`
          : `Đã khởi tạo tài khoản thành công cho ${fullName}!`
      );

      if (onUserCreated && createdUser) {
        onUserCreated(createdUser);
      }

      setEmail('');
      setFullName('');
      setSalesPrefix('');
      setDirectPassword('');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Khởi tạo tài khoản nhân viên thất bại!';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mời Nhân Viên Sales Mới</h3>
            <p className="text-xs text-slate-500">Cấp quyền truy cập CRM và gắn tiền tố Leads nhà hàng.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs Chế độ cấp */}
        <div className="flex border-b border-slate-200 bg-[#FAF8F5]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('INVITE');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'INVITE'
              ? 'border-sky-600 text-sky-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            Nhánh A: Mời Qua Email Brevo
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('DIRECT');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'DIRECT'
              ? 'border-sky-600 text-sky-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
            Nhánh B: Cấp Tài Khoản Trực Tiếp
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ Và Tên</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Bạn Trọng"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Nhận Lời Mời</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trong@skipli.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiền Tố Sales Prefix (2-3 Ký Tự)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={3}
                value={salesPrefix}
                onChange={(e) => setSalesPrefix(e.target.value.toUpperCase().trim())}
                placeholder="VD: TR"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs font-mono font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 uppercase transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Dùng để định danh Leads cá nhân (Ví dụ: Lead <code>TR_001</code>).
            </p>
          </div>

          {activeTab === 'DIRECT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu Khởi Tạo</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={directPassword}
                  onChange={(e) => setDirectPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {activeTab === 'INVITE' ? 'Gửi Email Mời' : 'Cấp Tài Khoản'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;
