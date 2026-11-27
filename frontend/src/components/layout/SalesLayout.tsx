/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/layout/SalesLayout.tsx
 * PHÂN LOẠI: LAYOUT COMPONENT (KHUNG GIAO DIỆN SALES WORKSPACE)
 * VAI TRÒ: Sidebar Điều Hướng Chuẩn Tuyến Đường, Badge Số Lượng Lead Realtime, Shell Outlet Cho Sales
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leadApi } from '../../services/lead.api';

export const SalesLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [leadsCount, setLeadsCount] = useState<number>(0);

  // Cập nhật số lượng leads phụ trách hiển thị badge realtime trên Sidebar
  useEffect(() => {
    let isMounted = true;
    leadApi
      .getLeads({ page: 1, limit: 1 })
      .then((res) => {
        if (isMounted && typeof res.total === 'number') {
          setLeadsCount(res.total);
        }
      })
      .catch(() => {
        // Không block giao diện nếu lỗi mạng tạm thời
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Kiểm tra route đang active
  const isDashboardActive =
    location.pathname === '/workspace' || location.pathname === '/workspace/';
  const isLeadsActive =
    location.pathname.startsWith('/workspace/leads') || location.pathname.startsWith('/leads');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex font-sans antialiased selection:bg-sky-200">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVIGATION BÀN LÀM VIỆC SALES (ĐỒNG NHẤT VỚI ADMIN LAYOUT)     */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 shadow-xs z-30">
        <div className="p-5 space-y-6">
          {/* Logo Skipli chính thức */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div
              className="flex items-center gap-2.5 select-none cursor-pointer"
              onClick={() => navigate('/workspace')}
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
                  SALES REP WORKSPACE
                </div>
              </div>
            </div>
          </div>

          {/* Cụm Menu Điều Hướng Nghiệp Vụ Của Sales */}
          <nav className="space-y-5 text-xs">
            {/* NHÓM 1: TỔNG QUAN CÁ NHÂN */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                TỔNG QUAN CÁ NHÂN
              </div>
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  isDashboardActive
                    ? 'bg-[#071E3D] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    className={`w-4 h-4 ${isDashboardActive ? 'text-sky-300' : 'text-slate-400'}`}
                  />
                  <span>Tổng Quan Hiệu Suất</span>
                </div>
                {isDashboardActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>

            {/* NHÓM 2: TIẾP CẬN NHÀ HÀNG & CRM */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                TIẾP CẬN NHÀ HÀNG
              </div>

              {/* Leads Nhà Hàng Của Tôi (Route: /workspace/leads) */}
              <button
                type="button"
                onClick={() => navigate('/workspace/leads')}
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
                  <span>Leads Của Tôi</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isLeadsActive
                      ? 'bg-white/20 text-sky-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}
                >
                  {leadsCount} leads
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer Sidebar: User Profile & Đăng xuất */}
        <div className="p-3.5 m-4 rounded-2xl bg-[#F5F2EB] border border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              {user?.salesPrefix || 'TR'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.fullName || 'Chuyên Viên Sales'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mã: {user?.salesPrefix || 'TR'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Đăng xuất khỏi bàn làm việc"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER BÊN PHẢI (Render các trang qua Outlet)        */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SalesLayout;
