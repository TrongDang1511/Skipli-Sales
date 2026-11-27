/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadDataTable.tsx
 * PHÂN LOẠI: UI COMPONENT (BẢNG DỮ LIỆU LEAD CHUẨN THỰC CHIẾN)
 * VAI TRÒ: Bảng Dữ Liệu Chuẩn Bố Cục Hình Mẫu, Lọc 7 Trạng Thái, 1-Click Copy SĐT, Ràng Buộc NextCallDate, Won/Lost Popups
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Copy,
  Check,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  RefreshCw,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PhoneCall,
  Globe,
  Share2,
  MapPin,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import {
  Lead,
  LeadStatus,
  LeadSheetKey,
  LeadScheduleFilter,
  LeadSheetCounts,
  GetLeadsParams,
  LEAD_STATUS_CONFIG,
  SCHEDULE_FILTER_OPTIONS,
  FOLLOW_UP_STATUSES,
  US_STATES,
  UpdateLeadInput,
} from '../../types/lead.types';
import { useToast } from '../../contexts/ToastContext';
import { LeadSheetTabs } from './LeadSheetTabs';
import { WonDealModal } from './WonDealModal';
import { LostReasonModal } from './LostReasonModal';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadEditModal } from './LeadEditModal';
import { getLocalDateString } from '@/lib/utils';
import { exportLeadsToExcel } from '../../utils/excelLeadParser';

interface LeadDataTableProps {
  onOpenAddModal?: () => void;
  onOpenImportModal?: () => void;
  refreshTrigger?: number;
  onLeadUpdated?: () => void;
  selectedLeadId?: string | null;
  onSelectLead?: (lead: Lead) => void;
  onLeadsLoaded?: (leads: Lead[]) => void;
}

export const LeadDataTable: React.FC<LeadDataTableProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  refreshTrigger = 0,
  onLeadUpdated,
  selectedLeadId = null,
  onSelectLead,
  onLeadsLoaded,
}) => {
  const toast = useToast();
  const today = getLocalDateString();

  const getQuickDate = (daysToAdd: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return getLocalDateString(d);
  };

  // State danh sách & phân trang
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State bộ lọc, Sheet & tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeSheet, setActiveSheet] = useState<LeadSheetKey>('NEW');
  const [scheduleFilter, setScheduleFilter] = useState<LeadScheduleFilter>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [sheetCounts, setSheetCounts] = useState<LeadSheetCounts>({
    NEW: 0,
    FOLLOW_UP: 0,
    CLOSED: 0,
  });

  // State các popups phụ trợ
  const [wonModalLead, setWonModalLead] = useState<Lead | null>(null);
  const [lostModalLead, setLostModalLead] = useState<Lead | null>(null);
  const [detailModalLead, setDetailModalLead] = useState<Lead | null>(null);
  const [editModalLead, setEditModalLead] = useState<Lead | null>(null);

  // State menu 3 chấm mở cho dòng nào
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // State mở dropdown chọn Status cho dòng nào
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);

  // State mở popover chọn Lịch hẹn gọi tiếp theo cho dòng nào
  const [activeDateLeadId, setActiveDateLeadId] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState<string>('');

  // State đang cập nhật số lần gọi cho lead nào
  const [isUpdatingCallCount, setIsUpdatingCallCount] = useState<string | null>(null);

  // State copy số điện thoại
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State đang xuất Excel
  const [isExporting, setIsExporting] = useState(false);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword.trim());
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Đóng menu 3 chấm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Build params bộ lọc hiện tại (dùng chung cho fetchLeads và Export Excel)
  const buildFilterParams = useCallback((): Omit<GetLeadsParams, 'page' | 'limit'> => {
    const params: Omit<GetLeadsParams, 'page' | 'limit'> = {
      sheet: activeSheet,
      todayDate: today,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (stateFilter !== 'ALL') {
      params.state = stateFilter;
    }
    if (scheduleFilter !== 'ALL') {
      params.schedule = scheduleFilter;
    }

    return params;
  }, [activeSheet, debouncedSearch, scheduleFilter, stateFilter, today]);

  // Lấy dữ liệu từ API theo Sheet & bộ lọc hiện tại
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadApi.getLeads({
        page,
        limit,
        ...buildFilterParams(),
      });
      const loadedItems = res.items || [];
      setLeads(loadedItems);
      onLeadsLoaded?.(loadedItems);
      setTotalLeads(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.sheetCounts) {
        setSheetCounts(res.sheetCounts);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách lead:', err);
      toast.error(extractApiErrorMessage(err, 'Lấy danh sách nhà hàng thất bại!'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, buildFilterParams]);

  // Xuất toàn bộ leads theo bộ lọc hiện tại ra file Excel (.xlsx)
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const items = await leadApi.getAllLeadsForExport(buildFilterParams());
      if (items.length === 0) {
        toast.info('Không có dữ liệu phù hợp bộ lọc để xuất Excel!');
        return;
      }
      exportLeadsToExcel(items, 'Skipli_Sales_Leads');
      toast.success(`Đã xuất thành công ${items.length} nhà hàng ra file Excel!`);
    } catch (err: any) {
      console.error('Lỗi xuất Excel:', err);
      toast.error(extractApiErrorMessage(err, 'Xuất file Excel thất bại!'));
    } finally {
      setIsExporting(false);
    }
  };

  // Kích hoạt fetch khi dependencies hoặc refreshTrigger thay đổi
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

  // Sao chép nhanh SĐT (1-Click Copy)
  const handleCopyPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    const cleanPhoneOnly = phone.replace(/\D/g, '');
    navigator.clipboard.writeText(cleanPhoneOnly || phone);
    setCopiedId(id);
    toast.success(`Đã sao chép SĐT: ${phone}`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  /**
   * XỬ LÝ ĐỔI TRẠNG THÁI TRỰC TIẾP TRÊN DÒNG BẢNG
   * TÍCH HỢP ĐẦY ĐỦ 4 QUY TẮC NGHIỆP VỤ CỐT LÕI
   */
  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (lead.status === newStatus) return;

    // QUY TẮC 1: Nếu chuyển sang nhóm chăm sóc bám đuổi -> Bắt buộc kiểm tra nextCallDate >= today
    if (FOLLOW_UP_STATUSES.includes(newStatus)) {
      const hasValidNextCall = lead.nextCallDate && lead.nextCallDate.trim() >= today;

      if (!hasValidNextCall) {
        // CHẶN LẠI VÀ BẮN TOAST CẢNH BÁO VÀNG!
        toast.warning(
          `⚠️ Bắt buộc phải cập nhật Ngày hẹn gọi lại (Next Call Date ≥ hôm nay) trước khi chuyển "${lead.restaurantName}" sang trạng thái "${LEAD_STATUS_CONFIG[newStatus].label}"!`
        );
        return;
      }
    }

    // QUY TẮC 2: Nếu chuyển sang WON -> Mở popup nhập Giá trị hợp đồng ($)
    if (newStatus === 'WON') {
      setWonModalLead(lead);
      return;
    }

    // QUY TẮC 3: Nếu chuyển sang LOST -> Mở popup chọn Lý do thất bại
    if (newStatus === 'LOST') {
      setLostModalLead(lead);
      return;
    }

    // Nếu chuyển sang trạng thái thường (NEW hoặc các trạng thái đã thỏa mãn nextCallDate)
    try {
      await leadApi.updateLeadStatus(lead.id, newStatus);
      toast.success(
        `Đã chuyển trạng thái quán "${lead.restaurantName}" sang "${LEAD_STATUS_CONFIG[newStatus].label}"!`
      );
      // Cập nhật state trực tiếp tại client để UI đổi màu tức thì
      setLeads((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, status: newStatus } : item))
      );
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Cập nhật trạng thái thất bại!'));
    }
  };

  // Xác nhận lưu chốt WON từ WonDealModal
  const handleConfirmWon = async (dealValue: number) => {
    if (!wonModalLead) return;
    try {
      await leadApi.updateLeadStatus(wonModalLead.id, 'WON', {
        dealValue,
        nextCallDate: null, // Clear ngày hẹn
      });
      toast.success(
        `🎉 Chúc mừng bạn đã chốt thành công hợp đồng $${dealValue.toLocaleString()} cho quán "${wonModalLead.restaurantName}"!`
      );
      setLeads((prev) =>
        prev.map((item) =>
          item.id === wonModalLead.id
            ? { ...item, status: 'WON', dealValue, nextCallDate: null }
            : item
        )
      );
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Cập nhật chốt hợp đồng thất bại!'));
      throw err;
    }
  };

  // Xác nhận lưu LOST từ LostReasonModal
  const handleConfirmLost = async (lostReason: string) => {
    if (!lostModalLead) return;
    try {
      await leadApi.updateLeadStatus(lostModalLead.id, 'LOST', {
        lostReason,
        nextCallDate: null, // Clear ngày hẹn
      });
      toast.info(`Đã lưu lý do từ chối cho quán "${lostModalLead.restaurantName}"!`);
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lostModalLead.id
            ? { ...item, status: 'LOST', lostReason, nextCallDate: null }
            : item
        )
      );
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Ghi nhận thất bại lỗi!'));
      throw err;
    }
  };

  // Xóa lead
  const handleDeleteLead = async (lead: Lead) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa nhà hàng "${lead.restaurantName}" (${lead.leadCustomId}) khỏi hệ thống?`
    );
    if (!confirmDelete) return;

    try {
      await leadApi.deleteLead(lead.id);
      toast.success(`Đã xóa thành công nhà hàng "${lead.restaurantName}"!`);
      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      setTotalLeads((prev) => Math.max(0, prev - 1));
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Xóa nhà hàng thất bại!'));
    }
  };

  // Cập nhật nhanh Ngày hẹn gọi lại từ inline popover
  const handleQuickSetNextCallDate = async (lead: Lead, dateStr: string | null) => {
    setActiveDateLeadId(null);
    if (lead.nextCallDate === dateStr) return;

    if (dateStr && dateStr < today) {
      toast.warning('Ngày hẹn gọi lại không được nằm trong quá khứ!');
      return;
    }

    try {
      await leadApi.updateLead(lead.id, { nextCallDate: dateStr });
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, nextCallDate: dateStr } : item
        )
      );
      toast.success(
        dateStr
          ? `📅 Đã đặt lịch gọi lại cho "${lead.restaurantName}": ${dateStr}!`
          : `Đã xóa lịch hẹn cho quán "${lead.restaurantName}"!`
      );
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Cập nhật ngày hẹn gọi lại thất bại!'));
    }
  };

  // Cập nhật nhanh Số lần đã gọi inline (+1, -1 hoặc ghi nhận cuộc gọi)
  const handleUpdateCallCount = async (lead: Lead, newCount: number, isLogCall = false) => {
    if (newCount < 0) return;
    setIsUpdatingCallCount(lead.id);

    const updates: UpdateLeadInput = {
      callCount: newCount,
      ...(isLogCall ? { lastCallDate: today } : {}),
    };

    try {
      await leadApi.updateLead(lead.id, updates);
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id
            ? {
                ...item,
                callCount: newCount,
                ...(isLogCall ? { lastCallDate: today } : {}),
              }
            : item
        )
      );
      if (isLogCall) {
        toast.success(`📞 Đã ghi nhận cuộc gọi thứ ${newCount} cho "${lead.restaurantName}"!`);
      } else {
        toast.info(`Đã cập nhật số lần gọi: ${newCount} lần cho "${lead.restaurantName}"`);
      }
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Cập nhật số lần gọi thất bại!'));
    } finally {
      setIsUpdatingCallCount(null);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Lớp nền trong suốt click-away để đóng Action menu & Status dropdown & Date popover */}
      {(activeMenuId !== null || activeStatusDropdownId !== null || activeDateLeadId !== null) && (
        <div
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => {
            setActiveMenuId(null);
            setActiveStatusDropdownId(null);
            setActiveDateLeadId(null);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC (TOOLBAR PHONG CÁCH HÌNH MẪU)         */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        {/* Ô Tìm kiếm bên trái */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên quán, hotline, SĐT chủ, mã TR-..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
          />
        </div>

        {/* Các bộ lọc & Nút bấm bên phải */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Lọc Bang */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer appearance-none"
            >
              <option value="ALL">Toàn Bang</option>
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc Lịch Gọi (Thay thế bộ lọc Status khi đã chia 3 Sheet) */}
          <div className="relative">
            <select
              value={scheduleFilter}
              onChange={(e) => {
                setScheduleFilter(e.target.value as LeadScheduleFilter);
                setPage(1);
              }}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer appearance-none"
            >
              {SCHEDULE_FILTER_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white text-slate-800"
                  style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                >
                  {opt.label}
                </option>
              ))}
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
            className="p-2 rounded-xl text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Tải lại danh sách và cập nhật chỉ số"
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
      {/* BẢNG DỮ LIỆU CHÍNH (LEAD DATA TABLE)                                */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Thanh chuyển 3 Sheet kiểu Google Sheet (New / Follow-Up / Closed) */}
        <LeadSheetTabs
          activeSheet={activeSheet}
          counts={sheetCounts}
          onChangeSheet={(nextSheet) => {
            setActiveSheet(nextSheet);
            setPage(1);
          }}
        />

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF8F5]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th className="px-6 py-4">Nhà Hàng & Mã Lead</th>
                <th className="px-4 py-4">Khu Vực</th>
                <th className="px-4 py-4">Hotline & Chủ Quán</th>
                <th className="px-4 py-4 text-center">STATUS</th>
                <th className="px-4 py-4">Lịch Hẹn Gọi Tiếp Theo</th>
                <th className="px-4 py-4">Ghi Chú</th>
                <th className="px-4 py-4">Phụ Trách</th>
                <th className="px-4 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading && leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    <p className="font-medium">Đang tải danh sách nhà hàng...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Không tìm thấy nhà hàng nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái.
                    </p>
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => {
                  const statusConf = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;
                  const isOverdue = lead.nextCallDate && lead.nextCallDate < today;
                  const isTodayCall = lead.nextCallDate === today;

                  const isRowSelected = selectedLeadId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${
                        isRowSelected ? 'bg-sky-50/80 ring-1 ring-inset ring-sky-200' : ''
                      }`}
                      onClick={() => setDetailModalLead(lead)}
                    >
                      {/* Cột 1: Tên quán & Mã Lead */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {lead.state || 'US'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate max-w-[200px]">
                              {lead.restaurantName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                                {lead.leadCustomId}
                              </span>
                              {lead.googleMapsUrl && (
                                <a
                                  href={lead.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-600 hover:text-emerald-800"
                                  title="Xem trên Google Maps"
                                >
                                  <Globe className="w-3 h-3" />
                                </a>
                              )}
                              {lead.facebookUrl && (
                                <a
                                  href={lead.facebookUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Xem Fanpage Facebook"
                                >
                                  <Share2 className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Khu vực Bang & Thành phố */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-800 block">
                          Bang {lead.state}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                          {lead.city || 'Chưa có TP'}
                        </span>
                      </td>

                      {/* Cột 3: Hotline & Chủ quán (Có nút 1-click copy) */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {lead.hotline}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(e, lead.hotline, lead.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Sao chép SĐT 1-click"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {lead.ownerName && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                            Chủ: {lead.ownerName}
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Status Outlined Badge (Khớp 100% mẫu thiết kế) */}
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveStatusDropdownId(
                                activeStatusDropdownId === lead.id ? null : lead.id
                              )
                            }
                            className={`px-2.5 py-0.5 rounded-[6px] text-xs font-semibold border bg-white cursor-pointer transition-all hover:brightness-95 active:scale-95 inline-flex items-center justify-center min-w-[72px] shadow-2xs ${statusConf.borderClass} ${statusConf.textClass}`}
                            title="Nhấp để thay đổi trạng thái"
                          >
                            {statusConf.label}
                          </button>

                          {/* Floating Dropdown Chọn Trạng Thái (Nền trắng, sạch sẽ, không lỗi giao diện OS) */}
                          {activeStatusDropdownId === lead.id && (
                            <div
                              className={`absolute left-1/2 -translate-x-1/2 z-30 w-40 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 animate-scale-in text-xs ${index >= leads.length - 2 && leads.length > 2
                                  ? 'bottom-full mb-1.5'
                                  : 'top-full mt-1.5'
                                }`}
                            >
                              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 text-left">
                                Change Status
                              </div>
                              {(
                                [
                                  'NEW',
                                  'CALLING',
                                  'LOW_INTERESTED',
                                  'HIGH_INTERESTED',
                                  'HOT_LEAD',
                                  'WON',
                                  'LOST',
                                ] as LeadStatus[]
                              ).map((st) => {
                                const cfg = LEAD_STATUS_CONFIG[st];
                                const isCurrent = lead.status === st;
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      setActiveStatusDropdownId(null);
                                      handleStatusChange(lead, st);
                                    }}
                                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isCurrent ? 'bg-slate-50/80 font-bold' : 'font-medium'
                                      }`}
                                  >
                                    <span
                                      className={`px-2 py-0.5 rounded-[5px] text-[11px] font-semibold border bg-white ${cfg.borderClass} ${cfg.textClass}`}
                                    >
                                      {cfg.label}
                                    </span>
                                    {isCurrent && (
                                      <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Nếu WON hiện số tiền, nếu LOST hiện lý do */}
                        {lead.status === 'WON' && lead.dealValue > 0 && (
                          <div className="text-[10px] font-bold text-emerald-700 mt-1 font-mono">
                            +${lead.dealValue.toLocaleString()}
                          </div>
                        )}
                        {lead.status === 'LOST' && lead.lostReason && (
                          <div
                            className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px] mx-auto"
                            title={lead.lostReason}
                          >
                            {lead.lostReason}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Lịch Hẹn Gọi Tiếp Theo & Số Lần Đã Gọi (Thao tác nhanh Inline) */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {/* Hàng 1: Ngày Hẹn Gọi Tiếp Theo (Nhấp mở Popover chọn nhanh) */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDateLeadId(activeDateLeadId === lead.id ? null : lead.id);
                              setCustomDateInput(lead.nextCallDate || today);
                            }}
                            className="group/date flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer text-left"
                            title="Nhấp để đổi ngày hẹn gọi lại"
                          >
                            <Calendar
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isOverdue
                                  ? 'text-rose-500'
                                  : isTodayCall
                                    ? 'text-amber-500'
                                    : lead.nextCallDate
                                      ? 'text-sky-600'
                                      : 'text-slate-400'
                              }`}
                            />
                            <span
                              className={`font-semibold text-xs ${
                                isOverdue
                                  ? 'text-rose-600 font-bold'
                                  : isTodayCall
                                    ? 'text-amber-700 font-bold'
                                    : lead.nextCallDate
                                      ? 'text-slate-800'
                                      : 'text-slate-400 italic'
                              }`}
                            >
                              {lead.nextCallDate ? lead.nextCallDate : 'Chưa đặt lịch'}
                              {isTodayCall && ' (Hôm nay)'}
                              {isOverdue && ' (Quá hạn)'}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/date:text-slate-600 shrink-0 ml-0.5" />
                          </button>

                          {/* Floating Popover Chọn Lịch Hẹn Nhanh */}
                          {activeDateLeadId === lead.id && (
                            <div
                              className={`absolute left-0 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 animate-scale-in text-xs ${
                                index >= leads.length - 2 && leads.length > 2
                                  ? 'bottom-full mb-1.5'
                                  : 'top-full mt-1.5'
                              }`}
                            >
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 mb-2">
                                Đặt Lịch Gọi Lại
                              </div>

                              {/* Phím tắt nhanh 1-Click: Hôm nay, Ngày mai, +3 ngày, Tuần sau */}
                              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickSetNextCallDate(lead, getQuickDate(0))}
                                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-medium border border-slate-200/60 transition-colors text-center cursor-pointer"
                                >
                                  Hôm nay
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSetNextCallDate(lead, getQuickDate(1))}
                                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-medium border border-slate-200/60 transition-colors text-center cursor-pointer"
                                >
                                  Ngày mai
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSetNextCallDate(lead, getQuickDate(3))}
                                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-medium border border-slate-200/60 transition-colors text-center cursor-pointer"
                                >
                                  +3 Ngày
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSetNextCallDate(lead, getQuickDate(7))}
                                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-medium border border-slate-200/60 transition-colors text-center cursor-pointer"
                                >
                                  Tuần sau (+7n)
                                </button>
                              </div>

                              {/* Chọn ngày tùy chỉnh */}
                              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400 font-medium">Chọn ngày cụ thể:</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="date"
                                    min={today}
                                    value={customDateInput}
                                    onChange={(e) => setCustomDateInput(e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (customDateInput) {
                                        handleQuickSetNextCallDate(lead, customDateInput);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Lưu
                                  </button>
                                </div>
                              </div>

                              {/* Nút Xóa lịch hẹn (nếu đã WON hoặc LOST) */}
                              {(lead.status === 'WON' || lead.status === 'LOST') && lead.nextCallDate && (
                                <div className="pt-2 mt-2 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickSetNextCallDate(lead, null)}
                                    className="w-full py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer"
                                  >
                                    Xóa lịch hẹn này
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hàng 2: Số Lần Đã Gọi (Bộ đếm nhanh - / +1 cuộc gọi) */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[11px] text-slate-400 shrink-0">
                            Đã gọi:
                          </span>

                          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              disabled={lead.callCount <= 0 || isUpdatingCallCount === lead.id}
                              onClick={() => handleUpdateCallCount(lead, Math.max(0, lead.callCount - 1), false)}
                              className="px-2 py-0.5 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
                              title="Giảm 1 cuộc gọi"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-slate-800 border-x border-slate-100 min-w-[22px] text-center bg-slate-50/50">
                              {lead.callCount}
                            </span>
                            <button
                              type="button"
                              disabled={isUpdatingCallCount === lead.id}
                              onClick={() => handleUpdateCallCount(lead, lead.callCount + 1, true)}
                              className="px-2 py-0.5 text-xs font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 transition-colors flex items-center gap-1 cursor-pointer select-none"
                              title="Ghi nhận vừa gọi (+1 cuộc gọi & cập nhật hôm nay)"
                            >
                              <PhoneCall className="w-2.5 h-2.5" />
                              <span>+1</span>
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">lần</span>
                        </div>
                      </td>

                      {/* Cột 6: Ghi Chú Mới Nhất + Nút Cây Bút Mở Timeline */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border max-w-[210px] ${
                            isRowSelected
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
                                isRowSelected
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-400 hover:text-sky-600 hover:bg-white'
                              }`}
                              title="Mở Timeline & Ghi chú cuộc gọi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Cột 7: Phụ trách (Assigned To) */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {lead.assignedPrefix || 'SR'}
                          </div>
                          <span className="font-bold text-slate-700 text-xs truncate max-w-[100px]">
                            {lead.assignedName}
                          </span>
                        </div>
                      </td>

                      {/* Cột 8: Thao tác Action 3 Chấm */}
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === lead.id ? null : lead.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Menu thả xuống */}
                          {activeMenuId === lead.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-in">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDetailModalLead(lead);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-600" />
                                <span>Xem chi tiết</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setEditModalLead(lead);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                                <span>Chỉnh sửa</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDeleteLead(lead);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa quán</span>
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

        {/* Phân trang (Pagination Footer) */}
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

      {/* =================================================================== */}
      {/* CÁC POPUP DIALOG PHỤ TRỢ                                           */}
      {/* =================================================================== */}
      {/* 1. Modal Nhập Deal Value khi WON */}
      <WonDealModal
        isOpen={!!wonModalLead}
        lead={wonModalLead}
        onClose={() => setWonModalLead(null)}
        onConfirm={handleConfirmWon}
      />

      {/* 2. Modal Chọn Lý Do khi LOST */}
      <LostReasonModal
        isOpen={!!lostModalLead}
        lead={lostModalLead}
        onClose={() => setLostModalLead(null)}
        onConfirm={handleConfirmLost}
      />

      {/* 3. Modal Xem Chi Tiết Lead */}
      <LeadDetailModal
        isOpen={!!detailModalLead}
        lead={detailModalLead}
        onClose={() => setDetailModalLead(null)}
        onEdit={(lead) => setEditModalLead(lead)}
      />

      {/* 4. Modal Chỉnh Sửa Lead */}
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

export default LeadDataTable;
