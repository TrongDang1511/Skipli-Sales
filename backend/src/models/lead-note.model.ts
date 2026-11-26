/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/models/lead-note.model.ts
 * PHÂN LOẠI: DATA MODEL (FIRESTORE COLLECTION: lead_notes)
 * VAI TRÒ: Lưu Lịch Sử Từng Cuộc Gọi & Ghi Chú Trao Đổi Dạng Timeline
 * ==============================================================================
 */

export type CallResultType =
  | 'ANSWERED'           // Chủ quán nghe máy, đã trao đổi
  | 'CALLBACK'           // Hẹn gọi lại vào khung giờ khác
  | 'NO_ANSWER'          // Không nghe máy / đổ chuông không bắt máy
  | 'BUSY'               // Máy bận
  | 'VOICEMAIL'          // Để lại lời nhắn hộp thư thoại
  | 'NOTE_ONLY';         // Ghi chú nội bộ (không tính cuộc gọi)

export interface LeadNote {
  id: string;                   // UID document trong Firestore (note_...)
  leadId: string;               // ID của Lead cha (Single-Field Index)
  authorId: string;             // UID người ghi chú
  authorName: string;           // Tên hiển thị người ghi chú (VD: "Đặng Tấn Tọng")
  authorPrefix: string;         // Tiền tố nhân viên (VD: "TR", "SH")
  callResult: CallResultType;   // Kết quả cuộc gọi / loại ghi chú
  content: string;              // Nội dung trao đổi chi tiết
  nextCallDate?: string | null; // Ngày hẹn gọi lại gắn với lần gọi này (nếu có)
  createdAt: string;            // Thời điểm ghi chú (ISO 8601)
}
