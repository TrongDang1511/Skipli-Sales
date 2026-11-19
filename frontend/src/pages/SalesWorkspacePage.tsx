import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SkipliLogo } from '../components/common/SkipliLogo';
import { LogOut, PhoneCall, Bot, Building2, CheckCircle2 } from 'lucide-react';

export const SalesWorkspacePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center p-2 shadow-sm">
            <SkipliLogo size={24} className="w-full h-full text-white" />
          </div>
          <div>
            <div className="font-black text-slate-900 tracking-tight leading-none text-base">
              SKIPLI <span className="text-slate-500 font-normal">SALES</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
              Sales Rep Workspace
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Mã Prefix: <strong>{user?.salesPrefix}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Đăng xuất"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tài Khoản Đang Hoạt Động
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chào mừng {user?.fullName} trở lại bàn làm việc!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Mọi khách hàng nhà hàng bạn tiếp cận sẽ được tự động gắn mã tiền tố định danh{' '}
            <strong className="text-slate-800 font-mono">{user?.salesPrefix}</strong> để tính toán doanh số và hoa hồng chính xác.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Leads Nhà Hàng Của Bạn</span>
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">0 nhà hàng</div>
            <div className="text-[11px] text-slate-500 font-medium">Sẵn sàng nhận dữ liệu mới</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Cuộc Gọi AI Đang Xử Lý</span>
              <Bot className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">Hoạt động</div>
            <div className="text-[11px] text-slate-500 font-medium">Tự động kết nối khách hàng</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Tổng Cuộc Gọi Hôm Nay</span>
              <PhoneCall className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">0 cuộc</div>
            <div className="text-[11px] text-slate-500 font-medium">Chờ phân bổ lượt gọi</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesWorkspacePage;
