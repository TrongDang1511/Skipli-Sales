import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  ChevronRight,
  LogOut,
  Building2,
  UserCheck,
  FileText,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../services/auth.api';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState<number>(4);

  // Cập nhật số lượng nhân sự hiển thị badge trên Sidebar
  useEffect(() => {
    let isMounted = true;
    authApi
      .getAllUsers()
      .then((res) => {
        if (isMounted && res.data?.users) {
          setUsersCount(res.data.users.length);
        }
      })
      .catch(() => {
        // Dự phòng im lặng nếu lỗi mạng
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const isOverviewActive = location.pathname === '/' || location.pathname === '/admin';
  const isUsersActive = location.pathname.startsWith('/users');
  const isLeadsActive = location.pathname.startsWith('/leads');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex font-sans antialiased selection:bg-sky-200">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVIGATION BÊN TRÁI                                            */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 shadow-xs z-30">
        <div className="p-5 space-y-6">
          {/* Logo Skipli chính thức */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div
              className="flex items-center gap-2.5 select-none cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img
                src="/Skipli_logo_blue.png"
                alt="Skipli Sales Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div>
                <div className="font-black text-slate-900 tracking-tight leading-none text-base">
                  SKIPLI <span className="text-sky-600 font-extrabold">SALES</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                  ADMIN CONTROL HUB
                </div>
              </div>
            </div>
          </div>

          {/* Menu Điều Hướng Phân Nhóm Chuẩn */}
          <nav className="space-y-5 text-xs">
            {/* NHÓM 1: TỔNG QUAN */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                TỔNG QUAN
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  isOverviewActive
                    ? 'bg-[#071E3D] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    className={`w-4 h-4 ${isOverviewActive ? 'text-sky-300' : 'text-slate-400'}`}
                  />
                  <span>Tổng Quan Doanh Số</span>
                </div>
                {isOverviewActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>

            {/* NHÓM 2: ĐỘI NGŨ & CRM */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                ĐỘI NGŨ & CRM
              </div>

              {/* Quản Trị Nhân Viên (Route /users) */}
              <button
                type="button"
                onClick={() => navigate('/users')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  isUsersActive
                    ? 'bg-[#071E3D] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 ${isUsersActive ? 'text-sky-300' : 'text-slate-400'}`}
                  />
                  <span>Quản Trị Nhân Viên</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isUsersActive
                      ? 'bg-white/20 text-sky-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {usersCount}
                </span>
              </button>

              {/* Đội Ngũ Sales */}
              <button
                type="button"
                onClick={() => {
                  navigate('/users');
                  toast.success('Đang hiển thị danh sách đội ngũ chuyên viên Sales.');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Đội Ngũ Sales</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Leads Nhà Hàng (Route /leads) */}
              <button
                type="button"
                onClick={() => navigate('/leads')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  isLeadsActive
                    ? 'bg-[#071E3D] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2
                    className={`w-4 h-4 ${isLeadsActive ? 'text-sky-300' : 'text-slate-400'}`}
                  />
                  <span>Leads Nhà Hàng</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isLeadsActive
                      ? 'bg-white/20 text-sky-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  }`}
                >
                  Leads CRM
                </span>
              </button>

              {/* Cuộc Gọi AI & Demo */}
              <button
                type="button"
                onClick={() => {
                  toast.success('Phân hệ Cuộc Gọi AI & Lịch Hẹn Demo: 1,248 cuộc gọi đã hoàn tất.');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-slate-400" />
                  <span>Cuộc Gọi AI & Demo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Hợp Đồng / Deals */}
              <button
                type="button"
                onClick={() => {
                  toast.success('Phân hệ Hợp Đồng / Deals: Tổng giá trị $42,850/tháng.');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Hợp Đồng / Deals</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>

            {/* NHÓM 3: HỆ THỐNG */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                HỆ THỐNG
              </div>
              <button
                type="button"
                onClick={() =>
                  toast.success('Phân hệ Cài đặt & Bảo mật hệ thống đang hoạt động tối ưu.')
                }
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài Đặt & Bảo Mật</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer Sidebar: User Profile & Đăng xuất */}
        <div className="p-3.5 m-4 rounded-2xl bg-[#F5F2EB] border border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#071E3D] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {user?.salesPrefix || 'SH'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.fullName || 'Chị Sheryl'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Quản trị viên
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Đăng xuất khỏi hệ thống"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER BÊN PHẢI (Render các route con qua Outlet)    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
