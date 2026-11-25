/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/models/lead.model.ts
 * PHÂN LOẠI: ENTITY MODEL (THỰC THỂ DỮ LIỆU CỐT LÕI)
 * VAI TRÒ: Định nghĩa Schema Chuẩn Cho Thực Thể Lead Trong Firestore
 * ==============================================================================
 */

// Danh sách 7 trạng thái chuẩn trong phễu bán hàng Skipli
export type LeadStatus =
  | 'NEW'              // Mới tạo, chưa gọi điện lần nào (Mặc định)
  | 'CALLING'          // Đang trong quy trình gọi tiếp cận
  | 'LOW_INTERESTED'   // Khách quan tâm thấp (Cần nuôi dưỡng thêm)
  | 'HIGH_INTERESTED'  // Khách quan tâm cao ⭐ (Hỏi sâu tính năng, giá cả)
  | 'HOT_LEAD'         // Khách hàng tiềm năng cao 🔥 (70-80%, ưu tiên chốt deal)
  | 'WON'              // Đã chốt hợp đồng thành công 🏆 (Ghi nhận doanh số dealValue)
  | 'LOST';            // Thất bại / Deal hỏng (Lưu lại lý do lostReason)

export interface Lead {
  id: string;                      // Document UID ngẫu nhiên trong Firestore
  leadCustomId: string;            // Mã định danh hiển thị thân thiện (VD: "TR-1001", "LD-1001")
  restaurantName: string;          // Tên thương mại của nhà hàng, quán ăn (Bắt buộc)
  address?: string;                // Địa chỉ số nhà, tên đường của quán ăn (Tùy chọn)
  city?: string;                   // Thành phố (Tùy chọn)
  state: string;                   // Mã 2 ký tự bang tại Mỹ viết hoa (VD: "VA", "CA", "TX") (Bắt buộc)
  hotline: string;                 // Số điện thoại chính của nhà hàng hiển thị định dạng chuẩn (Bắt buộc)
  cleanPhone: string;              // 10 chữ số phẳng (VD: "8046768299") được đánh Index chống trùng 20ms
  ownerName?: string;              // Tên chủ nhà hàng hoặc người có quyền quyết định (Tùy chọn)
  ownerPhone?: string;             // Số điện thoại di động riêng của chủ nhà hàng (Tùy chọn)
  cleanOwnerPhone?: string;        // 10 chữ số phẳng của SĐT chủ nhà hàng (quét chống trùng chéo)
  ownerEmail?: string;             // Địa chỉ email liên hệ của quán hoặc chủ quán (Tùy chọn)
  googleMapsUrl?: string;          // Đường dẫn định vị Google Maps để xem hình ảnh, vị trí quán (Tùy chọn)
  facebookUrl?: string;            // Đường dẫn Fanpage Facebook của nhà hàng (Tùy chọn)
  status: LeadStatus;              // Trạng thái hiện tại trong phễu bán hàng (7 trạng thái)
  assignedTo: string;              // UID của tài khoản Sales phụ trách lead này
  assignedPrefix: string;          // Tiền tố mã của Sales phụ trách (VD: "TR", "TC", "SH")
  assignedName: string;            // Họ và tên hiển thị của Sales phụ trách (VD: "Trọng", "Tuấn")
  latestNote?: string;             // Nội dung tóm tắt của cuộc gọi gần nhất
  callCount: number;               // Tổng số lần Sales đã gọi điện tiếp cận (Khởi tạo = 0)
  lastCallDate?: string | null;    // Ngày thực hiện cuộc gọi gần nhất (Định dạng YYYY-MM-DD)
  nextCallDate?: string | null;    // Hạn chót ngày hẹn gọi lại tiếp theo (Định dạng YYYY-MM-DD, >= today)
  dealValue?: number;              // Giá trị hợp đồng thu về khi trạng thái là WON (VD: $500)
  lostReason?: string;             // Lý do mất deal khi trạng thái là LOST (VD: "Giá quá cao")
  aiEvaluation?: string;           // Nhận xét, đánh giá sơ bộ của AI về tiềm năng quán
  createdAt: string;               // Thời gian tạo bản ghi (ISO 8601 String)
  updatedAt: string;               // Thời gian cập nhật bản ghi gần nhất (ISO 8601 String)
  statusUpdatedAt?: string;        // Thời điểm chuyển trạng thái phễu gần nhất (ISO 8601 String)
}
