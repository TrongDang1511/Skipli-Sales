/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/AdminLeadDataTable.tsx
 * PHÂN LOẠI: UI COMPONENT (BẢNG DỮ LIỆU DÀNH RIÊNG CHO QUẢN TRỊ VIÊN)
 * VAI TRÒ: Checkbox chọn nhiều, Bàn giao hàng loạt 1-Click trên toolbar, Lọc Sales + UNASSIGNED, Lọc Bang, Menu Action chuẩn hình mẫu
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  Loader2,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { authApi, UserProfile } from '../../services/auth.api';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG, US_STATES } from '../../types/lead.types';
import { useToast } from '../../contexts/ToastContext';
import { AdminAssignDropdown } from './AdminAssignDropdown';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadEditModal } from './LeadEditModal';
import { exportLeadsToExcel } from '../../utils/excelLeadParser';

const VALID_STATUSES: LeadStatus[] = [
  'NEW',
  'CALLING',
  'LOW_INTERESTED',
  'HIGH_INTERESTED',
  'HOT_LEAD',
  'WON',
  'LOST',
];

const parseValidStatus = (raw: string | null): string =>
  raw && VALID_STATUSES.includes(raw as LeadStatus) ? raw : 'ALL';

interface AdminLeadDataTableProps {
  onOpenAddModal?: () => void;
  onOpenImportModal?: () => void;
  refreshTrigger?: number;
  onLeadUpdated?: () => void;
  externalSalesFilter?: string; // Hỗ trợ nhận filter từ thẻ KPI ở trang cha
  externalFilterTrigger?: number; // Nhịp kích hoạt mỗi lần bấm thẻ KPI (tránh xung đột khi đổi dropdown)
  onClearExternalFilter?: () => void;
  selectedLeadId?: string | null;
  onSelectLead?: (lead: Lead) => void;
}

export const AdminLeadDataTable: React.FC<AdminLeadDataTableProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  refreshTrigger = 0,
  onLeadUpdated,
  externalSalesFilter,
  externalFilterTrigger = 0,
  onClearExternalFilter,
  selectedLeadId = null,
  onSelectLead,
}) => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State danh sách & phân trang
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State danh sách nhân viên Sales để phân bổ
  const [salesList, setSalesList] = useState<UserProfile[]>([]);

  // State bộ lọc (khởi tạo trực tiếp từ URL Query Params nếu có)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() =>
    parseValidStatus(searchParams.get('status'))
  );
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [salesFilter, setSalesFilter] = useState<string>(
    () => searchParams.get('assignedTo')?.trim() || 'ALL'
  );

  const updateUrlFilters = useCallback(
    (nextStatus: string, nextAssigned: string) => {
      const nextParams = new URLSearchParams(searchParams);
      if (nextStatus === 'ALL') nextParams.delete('status');
      else nextParams.set('status', nextStatus);

      if (nextAssigned === 'ALL') nextParams.delete('assignedTo');
      else nextParams.set('assignedTo', nextAssigned);

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Đồng bộ nếu URL thay đổi từ bên ngoài (Back/Forward hoặc deep-link mới)
  useEffect(() => {
    const urlStatus = parseValidStatus(searchParams.get('status'));
    const urlAssigned = searchParams.get('assignedTo')?.trim() || 'ALL';

    setStatusFilter((prev) => (prev !== urlStatus ? urlStatus : prev));
    setSalesFilter((prev) => (prev !== urlAssigned ? urlAssigned : prev));
  }, [searchParams]);

  // Chỉ đồng bộ bộ lọc từ trang cha khi người dùng chủ động nhấp vào thẻ KPI
  const lastHandledFilterTickRef = useRef(0);
  useEffect(() => {
    if (externalFilterTrigger === 0 || externalFilterTrigger === lastHandledFilterTickRef.current) {
      return;
    }
    lastHandledFilterTickRef.current = externalFilterTrigger;
    const nextAssigned = externalSalesFilter || 'ALL';
    setSalesFilter(nextAssigned);
    setPage(1);
    updateUrlFilters(statusFilter, nextAssigned);
  }, [externalFilterTrigger, externalSalesFilter, statusFilter, updateUrlFilters]);

  // State chọn nhiều (Bulk Selection) & Toolbar Inline Assignment
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkTargetSalesId, setBulkTargetSalesId] = useState<string>('');
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // State Action Menu & Modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [detailModalLead, setDetailModalLead] = useState<Lead | null>(null);
  const [editModalLead, setEditModalLead] = useState<Lead | null>(null);

  // Tải danh sách Sales đang hoạt động
  useEffect(() => {
    authApi
      .getAllUsers()
      .then((res: any) => {
        if (res.data?.users) {
          setSalesList(res.data.users.filter((u: UserProfile) => u.isActive));
        }
      })
      .catch(() => {});
  }, []);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const buildFilterParams = useCallback(
    () => ({
      status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
      state: stateFilter !== 'ALL' ? stateFilter : undefined,
      search: debouncedSearch || undefined,
      assignedTo: salesFilter !== 'ALL' ? salesFilter : undefined,
    }),
    [statusFilter, stateFilter, debouncedSearch, salesFilter]
  );

  // Tải dữ liệu Leads toàn công ty
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadApi.getLeads({
        page,
        limit,
        ...buildFilterParams(),
      });

      setLeads(res.items || []);
      setTotalLeads(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / limit) || 1);
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Lấy danh sách nhà hàng thất bại!'));
    } finally {
      setIsLoading(false);
    }
  }, [page, buildFilterParams]);

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const items = await leadApi.getAllLeadsForExport(buildFilterParams());
      if (items.length === 0) {
        toast.error('Không có nhà hàng nào khớp bộ lọc để xuất Excel!');
        return;
      }
      exportLeadsToExcel(items, 'Skipli_Admin_Leads');
      toast.success(`Đã xuất ${items.length} nhà hàng ra file Excel!`);
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Xuất file Excel thất bại!'));
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

  // Xử lý Bàn giao 1-Click
  const handleAssignSingleLead = async (leadId: string, targetSalesId: string) => {
    try {
      const res = await leadApi.assignLead(leadId, targetSalesId);
      toast.success(res.message);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...res.lead } : l))
      );
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Bàn giao nhà hàng thất bại!'));
    }
  };

  // Xử lý Bàn giao hàng loạt 1-Click Inline trên Toolbar
  const handleConfirmInlineBulkAssign = async () => {
    if (!bulkTargetSalesId || selectedLeadIds.length === 0) {
      toast.warning('Vui lòng chọn nhân viên tiếp nhận bàn giao!');
      return;
    }
    setIsSubmittingBulk(true);
    try {
      const res = await leadApi.bulkAssignLeads(selectedLeadIds, bulkTargetSalesId);
      toast.success(res.message);
      setSelectedLeadIds([]);
      setBulkTargetSalesId('');
      fetchLeads();
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Bàn giao hàng loạt thất bại!'));
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Checkbox: Chọn tất cả
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length && leads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  // Checkbox: Chọn từng dòng
  const handleToggleSelectOne = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // Xóa lead (Quyền Quản Trị)
  const handleDeleteLead = async (lead: Lead) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhà hàng "${lead.restaurantName}"?`)) return;
    try {
      await leadApi.deleteLead(lead.id);
      toast.success('Đã xóa nhà hàng thành công!');
      fetchLeads();
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Xóa nhà hàng thất bại!'));
    }
  };

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC CHUẨN MINIMALIST                   */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Ô Tìm Kiếm Bo Tròn Rộng Thoáng */}
        <div className="relative flex-1 max-w-lg min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search leads by name, phone, code..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
          />
        </div>

        {/* Các Dropdown Bộ Lọc & Nút Thao Tác */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc Theo Bang (US States) */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer appearance-none"
            >
              <option value="ALL">Toàn Bang (Mỹ)</option>
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  Bang {st.code} - {st.name}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc Theo Nhân Viên Sales (Kèm tùy chọn UNASSIGNED) */}
          <div className="relative">
            <select
              value={salesFilter}
              onChange={(e) => {
                const nextAssigned = e.target.value;
                setSalesFilter(nextAssigned);
                onClearExternalFilter?.();
                setPage(1);
                updateUrlFilters(statusFilter, nextAssigned);
              }}
              className={`pl-8 pr-3 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer appearance-none ${
                salesFilter === 'UNASSIGNED'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">Sales: All</option>
              <option value="UNASSIGNED">Chưa phân công (Unassigned)</option>
              {salesList.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.salesPrefix || 'SR'}] {s.fullName}
                </option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc Trạng Thái Status (Chuẩn Tiếng Anh như hình mẫu) */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setStatusFilter(nextStatus);
                setPage(1);
                updateUrlFilters(nextStatus, salesFilter);
              }}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer appearance-none"
            >
              <option value="ALL">Status: All</option>
              <option value="NEW">New</option>
              <option value="CALLING">Calling</option>
              <option value="LOW_INTERESTED">Low Interest</option>
              <option value="HIGH_INTERESTED">High Interest</option>
              <option value="HOT_LEAD">Hot</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Nút Làm Mới */}
          <button
            type="button"
            onClick={() => {
              fetchLeads();
              onLeadUpdated?.();
            }}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Tải lại danh sách và đồng bộ chỉ số KPI"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Nút Export Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-700 disabled:opacity-50 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xuất toàn bộ danh sách khớp bộ lọc hiện tại ra file Excel"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            ) : (
              <Download className="w-4 h-4 text-sky-600" />
            )}
            <span>Export Excel</span>
          </button>

          {/* Nút Import Excel */}
          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-700 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel</span>
            </button>
          )}

          {/* Nút Thêm Mới Lead */}
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* THANH CÔNG CỤ NỔI BÀN GIAO HÀNG LOẠT 1-CLICK (INLINE BULK ASSIGN)  */}
      {/* =================================================================== */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-bold text-sky-950">
              Đã chọn {selectedLeadIds.length} nhà hàng
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown chọn Sales trực tiếp ngay trên thanh công cụ */}
            <select
              value={bulkTargetSalesId}
              onChange={(e) => setBulkTargetSalesId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer shadow-2xs"
            >
              <option value="">-- Chọn Sales bàn giao --</option>
              <option value="UNASSIGNED">Thu hồi (Chưa phân công)</option>
              {salesList.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.salesPrefix || 'SR'}] {s.fullName}
                </option>
              ))}
            </select>

            {/* Nút Bàn Giao 1-Click */}
            <button
              type="button"
              disabled={!bulkTargetSalesId || isSubmittingBulk}
              onClick={handleConfirmInlineBulkAssign}
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isSubmittingBulk ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Bàn giao ngay</span>
            </button>

            {/* Nút Bỏ chọn */}
            <button
              type="button"
              onClick={() => {
                setSelectedLeadIds([]);
                setBulkTargetSalesId('');
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* BẢNG DỮ LIỆU CHÍNH (ADMIN LEADS TABLE)                              */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF8F5]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th className="w-10 px-4 py-4 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="cursor-pointer text-slate-400 hover:text-slate-600"
                  >
                    {selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length ? (
                      <CheckSquare className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4">LEAD NAME</th>
                <th className="px-4 py-4">KHU VỰC</th>
                <th className="px-4 py-4">HOTLINE</th>
                <th className="px-4 py-4 text-center">STATUS</th>
                <th className="px-4 py-4">LỊCH HẸN</th>
                <th className="px-4 py-4">GHI CHÚ</th>
                <th className="px-4 py-4">ASSIGNED TO</th>
                <th className="px-4 py-4 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading && leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    <p className="font-medium">Đang tải danh sách nhà hàng...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                    <p className="font-bold text-slate-700 text-sm">Không tìm thấy nhà hàng nào</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => {
                  const statusConf = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const isActiveWorkspace = selectedLeadId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${
                        isActiveWorkspace
                          ? 'bg-sky-50/80 ring-1 ring-inset ring-sky-200'
                          : isSelected
                            ? 'bg-sky-50/40'
                            : ''
                      }`}
                      onClick={() => setDetailModalLead(lead)}
                    >
                      {/* Cột 1: Checkbox */}
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(lead.id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Cột 2: Tên quán & Mã Lead */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate max-w-[200px]">
                          {lead.restaurantName}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">
                          {lead.leadCustomId}
                        </span>
                      </td>

                      {/* Cột 3: Khu vực */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-800 block">Bang {lead.state}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                          {lead.city || 'Chưa có TP'}
                        </span>
                      </td>

                      {/* Cột 4: Hotline */}
                      <td className="px-4 py-4 font-mono font-bold text-slate-800">
                        {lead.hotline || lead.cleanPhone}
                      </td>

                      {/* Cột 5: Status Badge (Viền outline theo hình mẫu) */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.borderClass} ${statusConf.textClass} bg-white shadow-2xs`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Cột 6: Lịch Hẹn */}
                      <td className="px-4 py-4 text-slate-600">
                        {lead.nextCallDate ? lead.nextCallDate : '—'}
                      </td>

                      {/* Cột 7: Ghi Chú Mới Nhất + Nút Cây Bút Mở Timeline */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border max-w-[200px] ${
                            isActiveWorkspace
                              ? 'bg-sky-50/90 border-sky-300'
                              : 'bg-slate-50/80 border-slate-200/80'
                          }`}
                        >
                          <span
                            className={`text-[11px] truncate ${
                              lead.latestNote ? 'text-slate-700 font-medium' : 'text-slate-400 italic'
                            }`}
                            title={lead.latestNote || 'Chưa có ghi chú'}
                          >
                            {lead.latestNote || 'Chưa có ghi chú'}
                          </span>
                          {onSelectLead && (
                            <button
                              type="button"
                              onClick={() => onSelectLead(lead)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                                isActiveWorkspace
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-400 hover:text-sky-600 hover:bg-white'
                              }`}
                              title="Xem Timeline & Ghi chú cuộc gọi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Cột 8: ASSIGNED TO (Dropdown 1-Click Bàn Giao Siêu Tinh Gọn) */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <AdminAssignDropdown
                          currentAssignedId={lead.assignedTo}
                          currentAssignedName={lead.assignedName}
                          currentPrefix={lead.assignedPrefix}
                          salesList={salesList}
                          onSelectSales={(salesId) => handleAssignSingleLead(lead.id, salesId)}
                          direction={index >= leads.length - 2 && leads.length > 2 ? 'up' : 'down'}
                        />
                      </td>

                      {/* Cột 9: Action 3 Chấm Chuẩn Hình Mẫu (View / Edit / Delete) */}
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === lead.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-in text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDetailModalLead(lead);
                                }}
                                className="w-full px-3 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setEditModalLead(lead);
                                }}
                                className="w-full px-3 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDeleteLead(lead);
                                }}
                                className="w-full px-3 py-1.5 text-left font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang (Pagination Footer Đồng Bộ) */}
        {totalPages > 1 && (
          <div className="p-4 px-6 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{leads.length}</strong> / <strong>{totalLeads}</strong> nhà hàng
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-700 px-2">
                Trang {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals Popup Phụ Trợ */}
      <LeadDetailModal
        isOpen={!!detailModalLead}
        lead={detailModalLead}
        onClose={() => setDetailModalLead(null)}
        onEdit={(lead) => setEditModalLead(lead)}
      />

      <LeadEditModal
        isOpen={!!editModalLead}
        lead={editModalLead}
        onClose={() => setEditModalLead(null)}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          onLeadUpdated?.();
        }}
      />
    </div>
  );
};
