/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/SalesLeadsPage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (TRANG CHUYÊN SÂU QUẢN LÝ LEADS NHÀ HÀNG)
 * VAI TRÒ: Tuyến Đường /workspace/leads - 4 Thẻ KPI Tóm Tắt, LeadDataTable Thực Chiến & QuickAddLeadModal
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LeadDataTable } from '../components/lead/LeadDataTable';
import { QuickAddLeadModal } from '../components/lead/QuickAddLeadModal';
import { leadApi } from '../services/lead.api';

export const SalesLeadsPage: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  // Định dạng ngày hôm nay theo tiếng Việt chuẩn (VD: "Thứ Sáu, 20/11/2026")
  const rawFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
  const displayDate = rawFormatted.charAt(0).toUpperCase() + rawFormatted.slice(1);

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Thống kê nhanh 4 thẻ KPI dựa trên dữ liệu thật
  const [stats, setStats] = useState({
    total: 0,
    newLeads: 0,
    wonLeads: 0,
    followUpDue: 0,
    conversionRate: '0.0%',
  });

  const loadStats = async () => {
    try {
      const res = await leadApi.getLeads({ page: 1, limit: 100 });
      const items = res.items || [];
      const total = res.total || 0;
      const newCount = items.filter((l) => l.status === 'NEW').length;
      const wonCount = items.filter((l) => l.status === 'WON').length;
      const followUpCount = items.filter(
        (l) => l.nextCallDate && l.nextCallDate.slice(0, 10) === today
      ).length;
      const convRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) + '%' : '0.0%';

      setStats({
        total,
        newLeads: newCount,
        wonLeads: wonCount,
        followUpDue: followUpCount,
        conversionRate: convRate,
      });
    } catch {
      // Giữ im lặng cho stat cards nếu lỗi
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
      {/* ========================================================================= */}
      {/* 1. TOPBAR HEADER CHUẨN HÓA GỌN GÀNG, ĐÚNG NGÀY HÔM NAY                     */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span>Tiếp Cận Nhà Hàng</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Leads Của Tôi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Leads Của Tôi
          </h1>
        </div>

        {/* Cụm Điều Khiển Bên Phải Tối Giản */}
        <div className="flex items-center gap-2.5">
          {/* Badge Tiền tố cá nhân */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 font-mono font-bold shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Prefix: {user?.salesPrefix || 'TR'}</span>
          </div>

          {/* Ngày Hôm Nay Thời Gian Thực */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{displayDate}</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. NỘI DUNG CHÍNH: 4 MINI STAT CARDS & BẢNG DỮ LIỆU LEAD THỰC CHIẾN       */}
      {/* ========================================================================= */}
      <main className="p-6 sm:p-8 space-y-6">
        {/* 4 THẺ TỔNG HỢP NHANH CHUẨN THIẾT KẾ MẪU (TOTAL, NEW, CONVERSION, FOLLOW-UP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL LEADS
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.total.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Toàn bộ quán mang tiền tố [{user?.salesPrefix || 'TR'}]
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: New Leads */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                NEW LEADS
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.newLeads}
              </div>
              <div className="text-[11px] text-sky-600 font-semibold">
                Chưa thực hiện cuộc gọi đầu
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CONVERSION RATE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-emerald-700">
                {stats.conversionRate}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.wonLeads} hợp đồng đã ký
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Follow-up Due */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                FOLLOW-UP DUE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-amber-600">
                {stats.followUpDue}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold">
                Cần gọi lại hôm nay
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU LEAD CHUẨN THỰC CHIẾN (LEADDATATABLE) */}
        <LeadDataTable
          onOpenAddModal={() => setIsAddLeadModalOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Modal Thêm Lead Tốc Độ Cao */}
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

export default SalesLeadsPage;
