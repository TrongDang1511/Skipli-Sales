/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/common/api-response.dto.ts
 * PHÂN LOẠI: COMMON / RESPONSES
 * VAI TRÒ: Wrapper Phản Hồi Chuẩn Cho Toàn Bộ Hệ Thống (Enterprise Response Envelope)
 * ==============================================================================
 */

/**
 * Cấu trúc Response chuẩn hóa 100% cho mọi API (Áp dụng thống nhất từ Auth, User đến Lead, Deal)
 */
export interface ApiResponse<T = any> {
  success: boolean;       // Trạng thái thành công: true | false
  message?: string;      // Thông báo phản hồi tiếng Việt thân thiện
  data?: T;              // Dữ liệu nghiệp vụ trả về (luôn được bọc gọn trong data)
  error?: string;        // Chi tiết mã lỗi (nếu có sự cố)
}

/**
 * Cấu trúc Response chuẩn cho danh sách có Phân Trang (Pagination Envelope)
 */
export interface PaginatedResponse<T> {
  items: T[];            // Danh sách các bản ghi của trang hiện tại
  total: number;         // Tổng số lượng bản ghi trong database
  page: number;          // Trang hiện tại (1, 2, 3...)
  pageSize: number;      // Số bản ghi trên mỗi trang (10, 25, 50...)
  totalPages: number;    // Tổng số trang
}
