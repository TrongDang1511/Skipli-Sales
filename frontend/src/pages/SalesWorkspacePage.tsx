/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/SalesWorkspacePage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (TỔNG QUAN HIỆU SUẤT SALES WORKSPACE)
 * VAI TRÒ: Tuyến Đường /workspace - Dashboard Doanh Số Cá Nhân, Biểu Đồ 12 Tháng & Tóm Tắt Leads
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  PhoneCall,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  Bell,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Video,
  UserCheck,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LeadDataTable } from '../components/lead/LeadDataTable';
import { QuickAddLeadModal } from '../components/lead/QuickAddLeadModal';

export const SalesWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dữ liệu chỉ số Leads & Lịch hẹn Demo cá nhân đã được đồng bộ mới nhất!');
    }, 600);
  };

  // Dữ liệu biểu đồ cột xếp chồng 12 tháng của riêng Sales Rep (AI Calls vs Demos)
  const personalChartData = [
    { month: 'T1', calls: 22, demos: 6 },
    { month: 'T2', calls: 28, demos: 8 },
    { month: 'T3', calls: 35, demos: 11 },
    { month: 'T4', calls: 30, demos: 9 },
    { month: 'T5', calls: 42, demos: 14 },
    { month: 'T6', calls: 48, demos: 16 },
    { month: 'T7', calls: 38, demos: 12 },
    { month: 'T8', calls: 44, demos: 15 },
    { month: 'T9', calls: 50, demos: 18 },
    { month: 'T10', calls: 56, demos: 20 },
    { month: 'T11', calls: 64, demos: 24 }, // Tháng hiện tại
    { month: 'T12', calls: 32, demos: 10 },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
      {/* ======================================================================= */}
      {/* 1. TOPBAR HEADER SALES WORKSPACE DASHBOARD                              */}
      {/* ======================================================================= */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Tổng Quan Hiệu Suất Sales</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bàn Làm Việc & Doanh Số Cá Nhân
          </h1>
        </div>

        {/* Cụm Điều Khiển Bên Phải */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge Tiền tố cá nhân */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 font-mono font-bold shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Prefix: {user?.salesPrefix || 'TR'}</span>
          </div>

          {/* Bộ Lọc Ngày */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tháng 11, {new Date().getFullYear()}</span>
          </div>

          {/* Nút Thêm Lead Mới Nhanh */}
          <button
            type="button"
            onClick={() => setIsAddLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Lead</span>
          </button>

          {/* Nút Xuất Báo Cáo Dropdown */}
          <button
            type="button"
            onClick={() => toast.success('Đã xuất báo cáo hiệu suất cá nhân ra file PDF/Excel.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Xuất Báo Cáo</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* Nút Làm Mới Dữ Liệu */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Làm mới dữ liệu từ máy chủ"
            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Nút Thông Báo Bell */}
          <button
            type="button"
            onClick={() =>
              toast.success('Có 1 chủ nhà hàng tại California vừa xác nhận link hẹn Demo!')
            }
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. NỘI DUNG CHÍNH: DASHBOARD SALES REPS                                 */}
      {/* ======================================================================= */}
      <main className="p-6 sm:p-8 space-y-6">
        {/* 1. HERO BANNER CHÀO MỪNG CÁ NHÂN HÓA */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#071E3D] text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sky-300 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tiền tố Lead cá nhân: {user?.salesPrefix || 'TR'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Chào {user?.fullName || 'bạn Sales'}, hôm nay hệ thống AI đã sẵn sàng!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bot AI Cold-Calling đang tự động kết nối với các chuỗi nhà hàng tại California và Texas.
              Bạn đang có{' '}
              <strong className="text-white underline decoration-emerald-400">
                4 lịch hẹn Demo
              </strong>{' '}
              cần tiếp quản và tư vấn chiều nay.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/workspace/leads')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-sky-300" />
              <span>Mở Bàn Quản Lý Leads</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-300" />
            </button>

            <button
              type="button"
              onClick={() =>
                toast.success('Đang mở danh sách 4 lịch hẹn Demo chiều nay qua Google Meet.')
              }
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Xem 4 Lịch Hẹn Demo</span>
            </button>
          </div>
        </div>

        {/* 2. CỤM 4 THẺ KPI HỢP LÝ DÀNH RIÊNG CHO SALES REPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Doanh Số Cá Nhân & Target */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Doanh Số Cá Nhân (Tháng 11)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                +22.5%
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                $14,200
                <span className="text-xs font-normal text-slate-400 ml-1.5 whitespace-nowrap">
                  / $18,000
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
                Còn 11 ngày
              </span>
            </div>

            {/* Thanh Tiến Độ Hoàn Thành Target */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-1000 shadow-xs"
                  style={{ width: '78.8%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Đạt 78.8% chỉ tiêu</span>
                <span className="font-semibold text-emerald-700">Hoa hồng: +$2,840</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Leads Nhà Hàng Phụ Trách (Click chuyển sang /workspace/leads) */}
          <div
            onClick={() => navigate('/workspace/leads')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-600 transition-colors">
                Leads Của Tôi
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs group-hover:bg-sky-600 group-hover:text-white transition-all">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-between">
                <span>28 nhà hàng</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tiền tố: {user?.salesPrefix || 'TR'}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>Bấm để quản lý chi tiết</span>
              <span className="text-sky-600 font-semibold">Xem tất cả →</span>
            </div>
          </div>

          {/* KPI 3: Cuộc Gọi AI Tự Động Hôm Nay */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cuộc Gọi AI Hôm Nay</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-2xs">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                142 cuộc
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                ↑ Tăng 16% so với hôm qua
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>Tỷ lệ nghe máy: 68%</span>
              <span className="text-sky-600 font-semibold">96 cuộc kết nối</span>
            </div>
          </div>

          {/* KPI 4: Lịch Hẹn Demo Chốt Thành Công */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Lịch Hẹn Demo Tuần Này</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                8 lịch hẹn
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Tỷ lệ chốt hẹn: 14.2%
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>4 lịch hẹn chiều nay</span>
              <span className="text-emerald-600 font-semibold">Top 2 Đội Sales</span>
            </div>
          </div>
        </div>

        {/* 3. BIỂU ĐỒ HIỆU SUẤT CÁ NHÂN 12 THÁNG (Stacked Bar Chart cho Sales) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                Hiệu Suất Tiếp Cận & Đặt Hẹn Cá Nhân (Personal Performance Overview)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                So sánh số cuộc gọi bot AI tự động tiếp cận vs Số lịch hẹn Demo cá nhân bạn đã chốt
                được
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#071E3D]" />
                  <span className="text-slate-600">Cuộc gọi AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600">Hẹn Demo Chốt</span>
                </div>
              </div>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-[#FAF8F5] text-slate-700 font-bold focus:outline-none"
              >
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
              </select>
            </div>
          </div>

          {/* Vùng Vẽ Biểu Đồ Cột Xếp Chồng */}
          <div className="pt-4 pb-2">
            <div className="h-60 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {personalChartData.map((item, idx) => {
                const maxVal = 90;
                const demoHeightPercent = (item.demos / maxVal) * 100;
                const callHeightPercent = (item.calls / maxVal) * 100;
                const isCurrent = idx === 10;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col justify-end items-center h-48 relative">
                      {/* Tooltip khi hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap shadow-md z-10">
                        {item.month}: {item.calls} Cuộc gọi • {item.demos} Demo chốt
                      </div>

                      <div
                        className="w-full max-w-[34px] flex flex-col rounded-t-lg overflow-hidden transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                        style={{ height: `${demoHeightPercent + callHeightPercent}%` }}
                      >
                        <div
                          style={{
                            height: `${(item.calls / (item.calls + item.demos)) * 100}%`,
                          }}
                          className={isCurrent ? 'bg-[#071E3D]' : 'bg-[#1E3A8A]'}
                          title={`Cuộc gọi AI: ${item.calls}`}
                        />
                        <div
                          style={{
                            height: `${(item.demos / (item.calls + item.demos)) * 100}%`,
                          }}
                          className={isCurrent ? 'bg-emerald-500' : 'bg-emerald-400'}
                          title={`Lịch demo: ${item.demos}`}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${isCurrent ? 'text-emerald-700 font-black' : 'text-slate-400'
                        }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. BẢNG DỮ LIỆU LEADS NHÀ HÀNG TOÀN DIỆN (REALTIME FIRESTORE DATABASE) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                Danh Sách Khách Hàng Tiềm Năng (Leads Của Tôi)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý toàn bộ phễu bán hàng 7 trạng thái, tự động gán mã tiền tố [
                <strong className="text-slate-700">{user?.salesPrefix || 'TR'}</strong>] và chống
                trùng chéo 20ms
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/workspace/leads')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <span>Mở Toàn Màn Hình</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          <LeadDataTable
            onOpenAddModal={() => setIsAddLeadModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </main>

      {/* Modal Thêm Lead Mới Tốc Độ Cao */}
      <QuickAddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onLeadCreated={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default SalesWorkspacePage;
