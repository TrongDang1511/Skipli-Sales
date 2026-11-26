/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/SalesLeadsPage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (TRANG CHUYÊN SÂU QUẢN LÝ LEADS NHÀ HÀNG)
 * VAI TRÒ: Tuyến Đường /workspace/leads - 4 Thẻ KPI Tóm Tắt, LeadDataTable Thực Chiến & QuickAddLeadModal
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LeadDataTable } from '../components/lead/LeadDataTable';
import { LeadPowerWorkspace } from '../components/lead/LeadPowerWorkspace';
import { QuickAddLeadModal } from '../components/lead/QuickAddLeadModal';
import { ExcelImportModal } from '../components/lead/ExcelImportModal';
import { leadApi } from '../services/lead.api';
import { Lead } from '../types/lead.types';
import { getLocalDateString } from '@/lib/utils';

export const SalesLeadsPage: React.FC = () => {
  const { user } = useAuth();
  const today = getLocalDateString();

  // Định dạng ngày hôm nay theo tiếng Việt chuẩn (VD: "Thứ Hai, 23/11/2026")
  const rawFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
  const displayDate = rawFormatted.charAt(0).toUpperCase() + rawFormatted.slice(1);

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State Power Calling Split View + Resizable Divider + Arrow Navigation
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [visibleLeads, setVisibleLeads] = useState<Lead[]>([]);
  const [leftWidthPercent, setLeftWidthPercent] = useState(60);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // Phím tắt mũi tên Lên/Xuống để chuyển nhanh giữa các Lead trong bảng trái
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLead || visibleLeads.length === 0) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const idx = visibleLeads.findIndex((l) => l.id === selectedLead.id);
        if (idx === -1) return;
        e.preventDefault();
        const nextIdx =
          e.key === 'ArrowDown'
            ? Math.min(idx + 1, visibleLeads.length - 1)
            : Math.max(idx - 1, 0);
        setSelectedLead(visibleLeads[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLead, visibleLeads]);

  // Xử lý kéo giãn thanh chia Split View (45% - 75%)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(75, Math.max(45, rawPercent));
      setLeftWidthPercent(clamped);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Thống kê nhanh 4 thẻ KPI dựa trên dữ liệu thật
  const [stats, setStats] = useState({
    total: 0,
    newLeads: 0,
    wonLeads: 0,
    followUpDue: 0,
    followUpToday: 0,
    followUpOverdue: 0,
    conversionRate: '0.0%',
  });

  const loadStats = async () => {
    try {
      const res = await leadApi.getLeads({ page: 1, limit: 100 });
      const items = res.items || [];
      const total = res.total || 0;
      const newCount = items.filter((l) => l.status === 'NEW').length;
      const wonCount = items.filter((l) => l.status === 'WON').length;

      // 1. Khách cần gọi HÔM NAY (chưa kết thúc deal)
      const todayLeads = items.filter(
        (l) =>
          l.nextCallDate &&
          l.nextCallDate.slice(0, 10) === today &&
          l.status !== 'WON' &&
          l.status !== 'LOST'
      ).length;

      // 2. Khách QUÁ HẠN chưa gọi (chưa kết thúc deal)
      const overdueLeads = items.filter(
        (l) =>
          l.nextCallDate &&
          l.nextCallDate.slice(0, 10) < today &&
          l.status !== 'WON' &&
          l.status !== 'LOST'
      ).length;

      // 3. Tổng số khách cần xử lý bám đuổi (Hôm nay + Quá hạn)
      const followUpCount = todayLeads + overdueLeads;
      const convRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) + '%' : '0.0%';

      setStats({
        total,
        newLeads: newCount,
        wonLeads: wonCount,
        followUpDue: followUpCount,
        followUpToday: todayLeads,
        followUpOverdue: overdueLeads,
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
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Import Excel */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-700 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
          </button>

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
              <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 flex-wrap">
                {stats.followUpDue === 0 ? (
                  <span>Đã hoàn thành gọi hôm nay</span>
                ) : (
                  <>
                    <span>{stats.followUpToday} hôm nay</span>
                    {stats.followUpOverdue > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 font-bold">
                          {stats.followUpOverdue} quá hạn
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* SPLIT VIEW POWER CALLING: BẢNG TRÁI + WORKSPACE PHẢI */}
        <div
          ref={splitContainerRef}
          className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0"
        >
          <div
            className="w-full min-w-0 transition-[width] duration-150"
            style={
              selectedLead && typeof window !== 'undefined' && window.innerWidth >= 1024
                ? { width: `${leftWidthPercent}%` }
                : undefined
            }
          >
            <LeadDataTable
              onOpenAddModal={() => setIsAddLeadModalOpen(true)}
              refreshTrigger={refreshTrigger}
              onLeadUpdated={loadStats}
              selectedLeadId={selectedLead?.id || null}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onLeadsLoaded={(items) => setVisibleLeads(items)}
            />
          </div>

          {selectedLead && (
            <>
              {/* Thanh chia kéo giãn (chỉ hiện trên màn hình lớn) */}
              <div
                onMouseDown={() => {
                  isDraggingRef.current = true;
                  document.body.style.cursor = 'col-resize';
                }}
                className="hidden lg:flex w-3 self-stretch items-center justify-center cursor-col-resize group select-none shrink-0"
                title="Kéo để điều chỉnh độ rộng bảng"
              >
                <div className="w-1 h-14 rounded-full bg-slate-200 group-hover:bg-sky-500 transition-colors" />
              </div>

              <div className="w-full lg:flex-1 min-w-0">
                <LeadPowerWorkspace
                  lead={selectedLead}
                  onClose={() => setSelectedLead(null)}
                  onLeadSynced={(updatedLead) => {
                    setSelectedLead(updatedLead);
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Thêm Lead Tốc Độ Cao */}
      <QuickAddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onLeadCreated={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Modal Import Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default SalesLeadsPage;
