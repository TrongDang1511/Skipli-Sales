/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/types/lead.types.ts
 * PHÂN LOẠI: TYPE DEFINITION & CONSTANTS (SINGLE SOURCE OF TRUTH)
 * VAI TRÒ: Đồng Bộ 100% Type Khớp Backend, Quản Lý 7 Trạng Thái, Metadata & Danh Mục Mỹ
 * ==============================================================================
 */

// 1. 7 TRẠNG THÁI CHUẨN MỰC CỦA HỆ THỐNG   BÁN HÀNG
export type LeadStatus =
  | 'NEW'              // Mới tạo, chưa gọi tiếp cận (Mặc định)
  | 'CALLING'          // Đang trong quy trình gọi tiếp cận
  | 'LOW_INTERESTED'   // Khách quan tâm thấp (cần nuôi dưỡng thêm)
  | 'HIGH_INTERESTED'  // Khách quan tâm cao (tiềm năng lớn, hỏi giá/tính năng)
  | 'HOT_LEAD'         // Khách hàng tiềm năng cao (70-80%, ưu tiên chốt ngay)
  | 'WON'              // Đã ký hợp đồng thành công (ghi nhận dealValue)
  | 'LOST';            // Thất bại / Deal hỏng (ghi nhận lostReason)

// 2. NHÓM TRẠNG THÁI BẮT BUỘC PHẢI CÓ LỊCH HẸN GỌI LẠI (NEXT CALL DATE >= TODAY)
export const FOLLOW_UP_STATUSES: LeadStatus[] = [
  'CALLING',
  'LOW_INTERESTED',
  'HIGH_INTERESTED',
  'HOT_LEAD',
];

// 2.1 CẤU HÌNH 3 SHEET TABS KIỂU GOOGLE SHEET CHO TRANG SALES
export type LeadSheetKey = 'NEW' | 'FOLLOW_UP' | 'CLOSED';
export type LeadScheduleFilter = 'ALL' | 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'UNSCHEDULED';
export type LeadSheetCounts = Record<LeadSheetKey, number>;

export const LEAD_SHEETS_CONFIG: Array<{
  key: LeadSheetKey;
  label: string;
  dotClass: string;
  activeBadgeClass: string;
}> = [
  {
    key: 'NEW',
    label: 'New',
    dotClass: 'bg-sky-500',
    activeBadgeClass: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'FOLLOW_UP',
    label: 'Follow-Up',
    dotClass: 'bg-amber-500',
    activeBadgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'CLOSED',
    label: 'Closed (Won / Lost)',
    dotClass: 'bg-emerald-500',
    activeBadgeClass: 'bg-emerald-100 text-emerald-700',
  },
];

export const SCHEDULE_FILTER_OPTIONS: Array<{ value: LeadScheduleFilter; label: string }> = [
  { value: 'ALL', label: 'Lịch gọi: Tất cả' },
  { value: 'TODAY', label: 'Cần gọi hôm nay' },
  { value: 'OVERDUE', label: 'Quá hạn chưa gọi' },
  { value: 'UPCOMING', label: 'Lịch sắp tới' },
  { value: 'UNSCHEDULED', label: 'Chưa đặt lịch' },
];

// 3. THỰC THỂ LEAD ĐẦY ĐỦ PHÍA FRONTEND (ĐỒNG BỘ 100% VỚI FIRESTORE MODEL)
export interface Lead {
  id: string;                       // Document UID của Firestore
  leadCustomId: string;             // Mã cá nhân tịnh tiến (VD: TR-1001, SH-1001)
  restaurantName: string;           // Tên nhà hàng / quán ăn
  address: string;                  // Địa chỉ số nhà / đường
  city: string;                     // Thành phố
  state: string;                    // Mã bang 2 chữ cái viết hoa (VD: VA, CA, TX)
  hotline: string;                  // Số điện thoại chính quán (định dạng hiển thị)
  cleanPhone: string;               // 10 chữ số phẳng để index & tìm kiếm
  ownerName: string;                // Tên chủ quán
  ownerPhone: string;               // SĐT di động riêng của chủ quán
  cleanOwnerPhone: string;          // 10 chữ số phẳng của SĐT chủ quán
  ownerEmail: string;               // Email liên hệ của quán/chủ quán
  googleMapsUrl: string;            // Link Google Maps
  facebookUrl: string;              // Link Fanpage Facebook
  status: LeadStatus;               // 1 trong 7 trạng thái  
  assignedTo: string;               // User ID của Sales phụ trách
  assignedPrefix: string;           // Tiền tố Sales (TR, SH, TC...)
  assignedName: string;             // Tên hiển thị của Sales phụ trách
  latestNote: string;               // Ghi chú mới nhất
  callCount: number;                // Tổng số cuộc gọi đã thực hiện
  lastCallDate: string | null;      // Ngày gọi gần nhất (ISO hoặc YYYY-MM-DD)
  nextCallDate: string | null;      // Ngày hẹn gọi lại tiếp theo (YYYY-MM-DD)
  dealValue: number;                // Giá trị hợp đồng thu về khi WON (USD)
  lostReason?: string;              // Lý do mất deal khi trạng thái là LOST
  aiEvaluation?: string;            // Nhận xét đánh giá của AI
  createdAt: string;                // Ngày tạo (ISO string)
  updatedAt: string;                // Ngày cập nhật gần nhất (ISO string)
  statusUpdatedAt?: string;         // Thời điểm đổi trạng thái   gần nhất (ISO string)
}

// 4. DTO ĐẦU VÀO FORM TẠO LEAD MỚI (QUICK ADD LEAD FORM)
export interface CreateLeadInput {
  restaurantName: string;           // 🔴 Bắt buộc
  state: string;                    // 🔴 Bắt buộc (Mã 2 ký tự)
  hotline: string;                  // 🔴 Bắt buộc (Định dạng US Phone)
  address?: string;                 // ⚪ Tùy chọn
  city?: string;                    // ⚪ Tùy chọn
  ownerName?: string;               // ⚪ Tùy chọn
  ownerPhone?: string;              // ⚪ Tùy chọn
  ownerEmail?: string;              // ⚪ Tùy chọn
  googleMapsUrl?: string;           // ⚪ Tùy chọn
  facebookUrl?: string;             // ⚪ Tùy chọn
  saleNote?: string;                // ⚪ Tùy chọn
  nextCallDate?: string;            // ⚪ Tùy chọn (Nếu có phải >= Today)
  aiEvaluation?: string;            // ⚪ Tùy chọn
}

// 5. DTO CẬP NHẬT THÔNG TIN / TRẠNG THÁI LEAD
export interface UpdateLeadInput extends Omit<Partial<CreateLeadInput>, 'nextCallDate'> {
  nextCallDate?: string | null;     // Cho phép truyền null để xóa ngày hẹn khi WON hoặc LOST
  lastCallDate?: string | null;     // Ngày gọi gần nhất (YYYY-MM-DD)
  callCount?: number;               // Số cuộc gọi đã thực hiện
  status?: LeadStatus;
  dealValue?: number;
  lostReason?: string;
  latestNote?: string;
}

// 5.1 DTO BÀN GIAO 1 LEAD CHO SALES HOẶC THU HỒI VỀ KHO
export interface AssignLeadInput {
  targetSalesId: string;
}

// 5.2 DTO BÀN GIAO HÀNG LOẠT (BULK ASSIGN)
export interface BulkAssignLeadsInput {
  leadIds: string[];
  targetSalesId: string;
}

// 6. THAM SỐ TRUY VẤN DANH SÁCH LEADS (FILTER & PAGINATION)
export interface GetLeadsParams {
  page?: number;                    // Trang hiện tại (mặc định: 1)
  limit?: number;                   // Số dòng mỗi trang (mặc định: 25)
  status?: LeadStatus;              // Lọc theo trạng thái
  sheet?: LeadSheetKey;             // Lọc theo nhóm Sheet (NEW | FOLLOW_UP | CLOSED)
  schedule?: Exclude<LeadScheduleFilter, 'ALL'>; // Lọc theo Lịch gọi
  todayDate?: string;               // Ngày hiện tại YYYY-MM-DD theo múi giờ Client
  state?: string;                   // Lọc theo bang
  search?: string;                  // Từ khóa tìm kiếm (Tên quán, SĐT, Mã TR-...)
  assignedTo?: string;              // Lọc theo Sales phụ trách (dành cho Admin)
}

// 7. PHẢN HỒI DANH SÁCH PHÂN TRANG TỪ BACKEND
export interface GetLeadsResponse {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sheetCounts?: LeadSheetCounts;
}

// 8. KẾT QUẢ KIỂM TRA TRÙNG SỐ ĐIỆN THOẠI (<20MS)
export interface CheckPhoneResponse {
  isDuplicate: boolean;
  existingLead?: Lead;
  message?: string;
}

// 8.1 LOẠI KẾT QUẢ CUỘC GỌI & TIMELINE GHI CHÚ (POWER CALLING WORKSPACE)
export type CallResultType =
  | 'ANSWERED'
  | 'CALLBACK'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'VOICEMAIL'
  | 'NOTE_ONLY';

export interface LeadNote {
  id: string;
  leadId: string;
  authorId: string;
  authorName: string;
  authorPrefix: string;
  callResult: CallResultType;
  content: string;
  nextCallDate?: string | null;
  createdAt: string;
}

export interface CreateLeadNoteInput {
  callResult: CallResultType;
  content: string;
  nextCallDate?: string | null;
  status?: LeadStatus;
}

export const CALL_RESULT_CONFIG: Record<
  CallResultType,
  { label: string; badgeClass: string }
> = {
  ANSWERED: { label: 'Nghe máy', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CALLBACK: { label: 'Hẹn gọi lại', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  NO_ANSWER: { label: 'Không bắt máy', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  BUSY: { label: 'Máy bận', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  VOICEMAIL: { label: 'Hộp thư thoại', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  NOTE_ONLY: { label: 'Ghi chú', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
};

// 8.2 IMPORT LEADS TỪ EXCEL (PREVIEW & KẾT QUẢ BATCH)
export type ImportRowStatus = 'VALID' | 'INVALID' | 'DUPLICATE_IN_FILE' | 'DUPLICATE_IN_DB';

export interface ImportLeadPreviewItem extends CreateLeadInput {
  rowNumber: number;
  status: ImportRowStatus;
  errorMessage?: string;
  duplicateInfo?: string;
}

export interface ImportLeadsResult {
  importedCount: number;
  skippedDuplicateCount: number;
  skippedInvalidCount: number;
  skippedDetails: Array<{
    rowNumber: number;
    restaurantName: string;
    hotline: string;
    reason: string;
  }>;
}

// 9. BẢNG CẤU HÌNH GIAO DIỆN VÀ METADATA CHO 7 TRẠNG THÁI (SINGLE SOURCE OF TRUTH)
export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  {
    label: string;
    description: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotColor: string;
    isFollowUp: boolean;
  }
> = {
  NEW: {
    label: 'New',
    description: 'Not yet contacted',
    bgClass: 'bg-white',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-400',
    dotColor: 'bg-emerald-500',
    isFollowUp: false,
  },
  CALLING: {
    label: 'Calling',
    description: 'In outreach process',
    bgClass: 'bg-white',
    textClass: 'text-sky-600',
    borderClass: 'border-sky-400',
    dotColor: 'bg-sky-500',
    isFollowUp: true,
  },
  LOW_INTERESTED: {
    label: 'Low Interest',
    description: 'Needs further nurturing',
    bgClass: 'bg-white',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-400',
    dotColor: 'bg-amber-400',
    isFollowUp: true,
  },
  HIGH_INTERESTED: {
    label: 'High Interest',
    description: 'High prospect, inquired pricing',
    bgClass: 'bg-white',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-400',
    dotColor: 'bg-indigo-500',
    isFollowUp: true,
  },
  HOT_LEAD: {
    label: 'Hot',
    description: '70-80% close probability',
    bgClass: 'bg-white',
    textClass: 'text-rose-600',
    borderClass: 'border-rose-400',
    dotColor: 'bg-rose-500',
    isFollowUp: true,
  },
  WON: {
    label: 'Won',
    description: 'Deal closed & signed',
    bgClass: 'bg-white',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-500',
    dotColor: 'bg-blue-600',
    isFollowUp: false,
  },
  LOST: {
    label: 'Lost',
    description: 'Deal lost or declined',
    bgClass: 'bg-white',
    textClass: 'text-slate-500',
    borderClass: 'border-slate-300',
    dotColor: 'bg-slate-400',
    isFollowUp: false,
  },
};

// 10. DANH MỤC LÝ DO MẤT DEAL CHUẨN ĐỊNH SẴN (CHO POPUP LOST REASON)
export const LOST_REASONS: string[] = [
  'Chi phí cao / Không đủ ngân sách',
  'Đang dùng giải pháp khác (Toast / Clover / Square)',
  'Chủ quán không quan tâm / Từ chối thẳng',
  'Quán tạm dừng hoạt động / Sắp sang nhượng',
  'Tính năng chưa đáp ứng đúng nhu cầu',
  'Không thể liên hệ được chủ quán (No Answer nhiều lần)',
  'Lý do khác',
];

// 11. DANH SÁCH CÁC BANG TẠI MỸ (PHỤC VỤ DROPDOWN LỌC VÀ FORM THÊM)
export const US_STATES = [
  { code: 'VA', name: 'Virginia' },
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'CO', name: 'Colorado' },
  { code: 'GA', name: 'Georgia' },
  { code: 'IL', name: 'Illinois' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'OH', name: 'Ohio' },
  { code: 'WA', name: 'Washington' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'NV', name: 'Nevada' },
  { code: 'OR', name: 'Oregon' },
  { code: 'NJ', name: 'New Jersey' },
];
