/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/AdminLeadsPage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (TRANG QUẢN TRỊ & PHÂN BỔ LEADS TOÀN CÔNG TY)
 * VAI TRÒ: Tuyến Đường /leads - Topbar Header chuẩn hệ thống, 4 Thẻ KPI Quản Trị Tràn Đầy Không Gian & AdminLeadDataTable
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Building2, UserX, Target, DollarSign, Calendar } from 'lucide-react';
import { AdminLeadDataTable } from '../components/lead/AdminLeadDataTable';
import { LeadPowerWorkspace } from '../components/lead/LeadPowerWorkspace';
import { QuickAddLeadModal } from '../components/lead/QuickAddLeadModal';
import { ExcelImportModal } from '../components/lead/ExcelImportModal';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { leadApi } from '../services/lead.api';
import { Lead } from '../types/lead.types';

export const AdminLeadsPage: React.FC = () => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // State lọc được kích hoạt từ thẻ KPI
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | undefined>(undefined);
  const [kpiClickTick, setKpiClickTick] = useState(0);

  // 4 Thẻ KPI Cấp Quản Trị
  const [kpis, setKpis] = useState({
    totalLeads: 0,
    unassignedLeads: 0,
    activePipeline: 0,
    totalWonValue: 0,
  });

  // Định dạng ngày hôm nay theo tiếng Việt chuẩn (VD: "Thứ Hai, 23/11/2026")
  const rawFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
  const displayDate = rawFormatted.charAt(0).toUpperCase() + rawFormatted.slice(1);

  // Tải số liệu KPI toàn công ty
  const loadKpis = async () => {
    try {
      const res = await leadApi.getLeads({ page: 1, limit: 100 });
      const items = res.items || [];
      const total = res.total || 0;

      const unassigned = items.filter(
        (l) => !l.assignedTo || l.assignedTo.trim() === '' || l.assignedTo === 'UNASSIGNED'
      ).length;
      const active = items.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length;
      const wonValue = items
        .filter((l) => l.status === 'WON')
        .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

      setKpis({
        totalLeads: total,
        unassignedLeads: unassigned,
        activePipeline: active,
        totalWonValue: wonValue,
      });
    } catch (err) {
      console.error('Lỗi tải dữ liệu KPI toàn công ty:', err);
    }
  };

  useEffect(() => {
    loadKpis();
  }, [refreshTrigger]);

  return (
    <>
      {/* =================================================================== */}
      {/* 1. TOPBAR HEADER CHUẨN ĐỒNG BỘ TOÀN HỆ THỐNG                        */}
      {/* =================================================================== */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span>Đội Ngũ & CRM</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Leads Nhà Hàng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý & Phân Bổ Leads Toàn Công Ty
          </h1>
        </div>

        {/* Cụm Điều Khiển Bên Phải */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Ngày Hôm Nay Thời Gian Thực */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{displayDate}</span>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MAIN CONTENT TẬN DỤNG TRỌN VẸN KHÔNG GIAN (KHÔNG BỊ CO CỤM)      */}
      {/* =================================================================== */}
      <main className="p-6 sm:p-8 space-y-6 flex-1 min-w-0">
        {/* 4 THẺ KPI TOÀN CÔNG TY (TRÀN ĐỀU & TƯƠNG TÁC NHẤP LỌC NHANH)     */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Thẻ 1: Tổng Leads */}
          <div
            onClick={() => {
              setActiveKpiFilter(undefined);
              setKpiClickTick((t) => t + 1);
            }}
            className={`bg-white rounded-3xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all select-none ${
              activeKpiFilter === undefined
                ? 'border-sky-300 ring-2 ring-sky-400/10'
                : 'border-slate-200/80 hover:border-sky-300'
            }`}
            title="Nhấp để xem toàn bộ danh sách"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                TOTAL LEADS
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {kpis.totalLeads}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Toàn bộ nhà hàng trên sàn</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Thẻ 2: Chưa Phân Công (Nhấp Lọc Nhanh) */}
          <div
            onClick={() => {
              setActiveKpiFilter(activeKpiFilter === 'UNASSIGNED' ? undefined : 'UNASSIGNED');
              setKpiClickTick((t) => t + 1);
            }}
            className={`rounded-3xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all select-none ${
              activeKpiFilter === 'UNASSIGNED'
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200/80 hover:border-amber-300'
            }`}
            title="Nhấp để lọc danh sách các quán chưa có người phụ trách"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                UNASSIGNED
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {kpis.unassignedLeads}
              </span>
              <span className="text-[11px] text-amber-600/80 mt-0.5 block">
                {activeKpiFilter === 'UNASSIGNED' ? '✓ Đang lọc quán chưa giao' : 'Nhấp để lọc phân công'}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          {/* Thẻ 3: Đang Tiếp Cận (Active Pipeline) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                ACTIVE PIPELINE
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {kpis.activePipeline}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Đang được Sales bám đuổi</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
          </div>

          {/* Thẻ 4: Tổng Doanh Số Won */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                TOTAL WON REVENUE
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
                ${kpis.totalWonValue.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Doanh thu chốt hợp đồng</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BẢNG DỮ LIỆU ADMIN DATA TABLE TRÀN ĐẦY MÀN HÌNH                    */}
        {/* =================================================================== */}
        <AdminLeadDataTable
          onOpenAddModal={() => setIsAddLeadModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          refreshTrigger={refreshTrigger}
          onLeadUpdated={loadKpis}
          externalSalesFilter={activeKpiFilter}
          externalFilterTrigger={kpiClickTick}
          onClearExternalFilter={() => setActiveKpiFilter(undefined)}
          selectedLeadId={selectedLead?.id || null}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />

        {/* Drawer Timeline & Ghi Chú Power Calling cho Admin */}
        <Sheet
          open={Boolean(selectedLead)}
          onOpenChange={(open) => {
            if (!open) setSelectedLead(null);
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-[460px] p-0 border-l border-slate-200 overflow-hidden [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Lịch sử ghi chú cuộc gọi</SheetTitle>
            {selectedLead && (
              <LeadPowerWorkspace
                variant="drawer"
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onLeadSynced={(updatedLead) => {
                  setSelectedLead(updatedLead);
                  setRefreshTrigger((prev) => prev + 1);
                  loadKpis();
                }}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Modal Thêm Lead Nhanh */}
        <QuickAddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
          onLeadCreated={() => {
            setRefreshTrigger((prev) => prev + 1);
            loadKpis();
          }}
        />

        {/* Modal Import Excel */}
        <ExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImported={() => {
            setRefreshTrigger((prev) => prev + 1);
            loadKpis();
          }}
        />
      </main>
    </>
  );
};
