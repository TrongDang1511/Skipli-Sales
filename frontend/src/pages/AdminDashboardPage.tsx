import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PhoneCall,
  ArrowRight,
  Bell,
  Calendar,
  Download,
  Building2,
  TrendingUp,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dữ liệu chỉ số doanh số & Leads nhà hàng đã được cập nhật mới nhất!');
    }, 600);
  };

  // Dữ liệu biểu đồ cột xếp chồng 12 tháng (Stacked Bar Chart: AI Calls vs Demos)
  const monthlyChartData = [
    { month: 'T1', calls: 65, demos: 20 },
    { month: 'T2', calls: 80, demos: 28 },
    { month: 'T3', calls: 110, demos: 38 },
    { month: 'T4', calls: 95, demos: 34 },
    { month: 'T5', calls: 125, demos: 48 },
    { month: 'T6', calls: 140, demos: 54 },
    { month: 'T7', calls: 115, demos: 40 },
    { month: 'T8', calls: 130, demos: 45 },
    { month: 'T9', calls: 145, demos: 52 },
    { month: 'T10', calls: 160, demos: 62 },
    { month: 'T11', calls: 185, demos: 78 }, // Tháng hiện tại
    { month: 'T12', calls: 110, demos: 36 },
  ];

  return (
    <>
      {/* ======================================================================= */}
      {/* HEADER RIÊNG CỦA ROUTE TỔNG QUAN DOANH SỐ (ADMIN DASHBOARD)             */}
      {/* ======================================================================= */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Tổng Quan Doanh Số</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tổng Quan Doanh Số
          </h1>
        </div>

        {/* Cụm Điều Khiển Bên Phải */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Bộ Lọc Ngày */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Th11 - 19 Th11, 2026</span>
          </div>

          {/* Nút Xuất Báo Cáo Dropdown */}
          <button
            type="button"
            onClick={() => toast.success('Đã xuất báo cáo thống kê doanh số PDF/Excel thành công.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Xuất Dữ Liệu</span>
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
            onClick={() => toast.success('Hệ thống AI đang gọi bình thường. Không có cảnh báo.')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {/* Avatar Mini Admin */}
          <div className="w-8 h-8 rounded-full bg-[#071E3D] text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs">
            {user?.salesPrefix || 'SH'}
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* NỘI DUNG CHÍNH: DASHBOARD TRẢI RỘNG TOÀN CHIỀU NGANG                   */}
      {/* ======================================================================= */}
      <main className="p-6 sm:p-8 space-y-6">
        {/* 1. CỤM 4 THẺ KPI TOÀN BỘ CHIỀU NGANG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Doanh Thu Dự Kiến */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Doanh Thu Dự Kiến (T11)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px] flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +18.4%
                </span>
                <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                $42,850
                <span className="text-xs font-normal text-slate-400 ml-1.5 whitespace-nowrap">/ $58,000</span>
              </div>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">Còn 11 ngày</span>
            </div>

            {/* Thanh Tiến Độ Hoàn Thành Target */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-1000 shadow-xs"
                  style={{ width: '74%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Tiến độ đạt 74%</span>
                <span className="font-semibold text-sky-700">Mục tiêu: 50 Nhà Hàng</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Tổng Nhân Sự Sales */}
          <div
            onClick={() => navigate('/users')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-700 transition-colors">
                Đội Ngũ Sales
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#071E3D] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-sky-300" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                4 nhân sự
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                100% Đang hoạt động
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>Phân bổ đủ tiền tố Leads</span>
              <span className="text-sky-600 font-semibold">Xem danh sách →</span>
            </div>
          </div>

          {/* KPI 3: Cuộc Gọi AI Nhà Hàng */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cuộc Gọi AI Tự Động</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                1,248 cuộc
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                ↑ Tăng 24% so với tuần trước
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>Tỷ lệ chủ quán nghe: 68%</span>
              <span className="text-emerald-600 font-semibold">Bot 24/7</span>
            </div>
          </div>

          {/* KPI 4: Leads Nhà Hàng Mới */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Leads Nhà Hàng Mới</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                86 nhà hàng
              </div>
              <div className="text-[11px] text-sky-700 font-semibold mt-1">
                California, Texas, New York
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>Đã phân bổ cho 4 Sales</span>
              <span className="text-emerald-600 font-semibold">100% Leads sạch</span>
            </div>
          </div>
        </div>

        {/* 2. BIỂU ĐỒ CỘT XẾP CHỒNG 12 THÁNG TRẢI RỘNG TOÀN CHIỀU NGANG */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                Hiệu Suất Tiếp Cận & Đặt Lịch Demo (Revenue Overview)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                So sánh số cuộc gọi AI tự động tiếp cận vs Số lịch hẹn Demo nhà hàng chốt được của toàn đội ngũ
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#071E3D]" />
                  <span className="text-slate-600">Cuộc gọi AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                  <span className="text-slate-600">Hẹn Demo</span>
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
            <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {monthlyChartData.map((item, idx) => {
                const maxVal = 240;
                const demoHeightPercent = (item.demos / maxVal) * 100;
                const callHeightPercent = (item.calls / maxVal) * 100;
                const isCurrent = idx === 10;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col justify-end items-center h-52 relative">
                      {/* Tooltip khi hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap shadow-md z-10">
                        {item.month}: {item.calls} Cuộc gọi • {item.demos} Demo
                      </div>

                      <div
                        className="w-full max-w-[36px] flex flex-col rounded-t-lg overflow-hidden transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                        style={{ height: `${demoHeightPercent + callHeightPercent}%` }}
                      >
                        <div
                          style={{ height: `${(item.calls / (item.calls + item.demos)) * 100}%` }}
                          className={isCurrent ? 'bg-[#071E3D]' : 'bg-[#1E3A8A]'}
                          title={`Cuộc gọi AI: ${item.calls}`}
                        />
                        <div
                          style={{ height: `${(item.demos / (item.calls + item.demos)) * 100}%` }}
                          className={isCurrent ? 'bg-sky-500' : 'bg-sky-400'}
                          title={`Lịch demo chốt: ${item.demos}`}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-sky-600 font-black' : 'text-slate-400'
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

        {/* 3. BANNER CHUYỂN NHANH SANG QUẢN TRỊ NHÂN SỰ */}
        <div className="p-4 rounded-2xl bg-[#F5F2EB] border border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Quản lý danh sách nhân viên và phân bổ tiền tố Leads?
            </div>
            <div className="text-[11px] text-slate-500">
              Thêm nhân viên mới, phân quyền truy cập và kiểm soát trạng thái tài khoản.
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <span>Chuyển Sang Quản Trị Nhân Viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </>
  );
};

export default AdminDashboardPage;
