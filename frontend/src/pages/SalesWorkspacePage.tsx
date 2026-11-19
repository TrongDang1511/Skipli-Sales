import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  PhoneCall,
  Calendar,
  TrendingUp,
  LogOut,
  Download,
  RefreshCw,
  Bell,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Headphones,
  Video,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const SalesWorkspacePage: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
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

  // Danh sách 5 Leads Nhà Hàng Ưu Tiên của riêng Sales Rep hôm nay
  const priorityLeads = [
    {
      id: 'lead-01',
      name: 'Phở 79 Little Saigon',
      location: 'Westminster, California',
      plan: 'Gói AI Pro ($1,800/tháng)',
      time: '14:00 Chiều Nay',
      status: 'Chốt Hẹn Demo',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      phone: '+1 (714) 555-0192',
      aiScore: '94% Tiềm năng',
    },
    {
      id: 'lead-02',
      name: 'Cajun Crab & Seafood',
      location: 'Houston, Texas',
      plan: 'Gói Full Suite ($2,400/tháng)',
      time: '15:30 Chiều Nay',
      status: 'Đang Đàm Phán',
      statusColor: 'bg-sky-50 text-sky-700 border-sky-200',
      phone: '+1 (832) 555-8831',
      aiScore: '88% Tiềm năng',
    },
    {
      id: 'lead-03',
      name: 'Golden Lotus Nail & Spa',
      location: 'Garden Grove, California',
      plan: 'Gói Starter ($1,200/tháng)',
      time: 'Hôm qua (Cần gọi lại)',
      status: 'Chờ Ký Hợp Đồng',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      phone: '+1 (714) 555-4410',
      aiScore: '91% Tiềm năng',
    },
    {
      id: 'lead-04',
      name: 'Tokyo Sushi & Grill Express',
      location: 'San Jose, California',
      plan: 'Gói AI Pro ($1,800/tháng)',
      time: 'Vừa gọi lúc 11:20',
      status: 'Bot Vừa Gọi Xong',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      phone: '+1 (408) 555-7762',
      aiScore: '82% Tiềm năng',
    },
    {
      id: 'lead-05',
      name: 'Saigon Pearl Bistro & Bar',
      location: 'Dallas, Texas',
      plan: 'Gói Starter ($1,200/tháng)',
      time: 'Chờ chốt ngày mai',
      status: 'Chờ Phản Hồi',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      phone: '+1 (214) 555-3398',
      aiScore: '79% Tiềm năng',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex font-sans antialiased selection:bg-sky-200">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVIGATION BÀN LÀM VIỆC SALES (ĐỒNG NHẤT VỚI ADMIN)            */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 shadow-xs z-30">
        <div className="p-5 space-y-6">
          {/* Logo Skipli chính thức */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5 select-none">
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
            {/* NHÓM 1: TỔNG QUAN HIỆU SUẤT */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                TỔNG QUAN CÁ NHÂN
              </div>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold bg-[#071E3D] text-white shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-sky-300" />
                  <span>Tổng Quan Hiệu Suất</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>
            </div>

            {/* NHÓM 2: QUẢN LÝ TIẾP CẬN & KHÁCH HÀNG */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                TIẾP CẬN NHÀ HÀNG
              </div>

              {/* Leads Nhà Hàng Của Tôi */}
              <button
                type="button"
                onClick={() =>
                  toast.success(
                    `Hệ thống đang quản lý 28 Leads nhà hàng mang mã tiền tố [${
                      user?.salesPrefix || 'TR'
                    }].`
                  )
                }
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Leads Của Tôi</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  28 leads
                </span>
              </button>

              {/* Lịch Hẹn Demo */}
              <button
                type="button"
                onClick={() =>
                  toast.success('Hôm nay bạn có 4 lịch hẹn Demo qua Google Meet/Zoom!')
                }
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-slate-400" />
                  <span>Lịch Hẹn Demo</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  4 hôm nay
                </span>
              </button>

              {/* Cuộc Gọi AI Bot Cold-Calling */}
              <button
                type="button"
                onClick={() =>
                  toast.success('Bot AI đang gọi tự động cho 142 nhà hàng tại California.')
                }
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Headphones className="w-4 h-4 text-slate-400" />
                  <span>Cuộc Gọi AI Bot</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Hợp Đồng & Hoa Hồng */}
              <button
                type="button"
                onClick={() =>
                  toast.success('Hoa hồng dự kiến tháng 11 của bạn đạt $2,840 (20% giá trị hợp đồng).')
                }
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Hoa Hồng & Deals</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
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
      {/* 2. MAIN WORKSPACE CONTENT CONTAINER BÊN PHẢI                              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ======================================================================= */}
        {/* TOPBAR HEADER RIÊNG CỦA SALES WORKSPACE                                 */}
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
              <span>01 Th11 - 19 Th11, 2026</span>
            </div>

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

            {/* Avatar Mini Sales */}
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs">
              {user?.salesPrefix || 'TR'}
            </div>
          </div>
        </header>

        {/* ======================================================================= */}
        {/* NỘI DUNG CHÍNH: DASHBOARD SALES REPS                                    */}
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
                Bot AI Cold-Calling đang tự động kết nối với các chuỗi nhà hàng tại California và
                Texas. Bạn đang có{' '}
                <strong className="text-white underline decoration-emerald-400">
                  4 lịch hẹn Demo
                </strong>{' '}
                cần tiếp quản và tư vấn chiều nay.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 shrink-0">
              <button
                type="button"
                onClick={() =>
                  toast.success('Đang mở danh sách 4 lịch hẹn Demo chiều nay qua Google Meet.')
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Xem 4 Lịch Hẹn Demo</span>
              </button>
            </div>
          </div>

          {/* 2. CỤM 4 THẺ KPI HỢP LÝ DÀNH RIÊNG CHO SALES REPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Doanh Thu Cá Nhân & Target */}
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
                  <span className="text-xs font-normal text-slate-400 ml-1.5 whitespace-nowrap">/ $18,000</span>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">Còn 11 ngày</span>
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

            {/* KPI 2: Leads Nhà Hàng Phụ Trách */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Leads Của Tôi</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  28 nhà hàng
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tiền tố: {user?.salesPrefix || 'TR'}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
                <span>18 Đang đàm phán</span>
                <span className="text-emerald-600 font-semibold">6 Đã chốt</span>
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
                  So sánh số cuộc gọi bot AI tự động tiếp cận vs Số lịch hẹn Demo cá nhân bạn đã chốt được
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
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-700 font-black' : 'text-slate-400'
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

          {/* 4. DANH SÁCH 5 LEADS NHÀ HÀNG ƯU TIÊN TIẾP QUẢN HÔM NAY (PRIORITY LEADS) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Danh Sách Leads Nhà Hàng Ưu Tiên Tiếp Cận Hôm Nay
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Được phân bổ tự động theo mã tiền tố [<strong>{user?.salesPrefix || 'TR'}</strong>]
                  của bạn
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Hiển thị <strong>5 / 28</strong> nhà hàng
                </span>
              </div>
            </div>

            {/* Bảng Danh Sách Leads Nhà Hàng */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Tên Nhà Hàng & Địa Chỉ</th>
                    <th className="py-3 px-4">Gói Đăng Ký</th>
                    <th className="py-3 px-4">Thời Gian Hẹn / Gọi</th>
                    <th className="py-3 px-4">Điểm Tiềm Năng AI</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác Nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tên & Địa chỉ */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{lead.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{lead.location}</div>
                      </td>

                      {/* Gói đăng ký */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{lead.plan}</td>

                      {/* Thời gian hẹn */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.time}</span>
                        </div>
                      </td>

                      {/* Điểm AI Score */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          {lead.aiScore}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${lead.statusColor}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            toast.success(`Đang mở phòng Google Meet demo cho ${lead.name}...`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Vào Demo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toast.success(`Đang gọi trực tiếp tới hotline ${lead.phone}...`)
                          }
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Gọi Ngay</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalesWorkspacePage;
