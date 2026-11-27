/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/models/user.model.ts
 * VAI TRÒ: Entity Model định nghĩa kiểu dữ liệu User trong Firestore
 * ==============================================================================
 */

export type UserRole = 'ADMIN' | 'SALES';

export interface User {
  id: string;                      // UID định danh duy nhất (VD: usr_1710000000)
  email: string;                   // Email đăng nhập (chuẩn hóa chữ thường, duy nhất)
  username?: string;               // Tên đăng nhập cá nhân (Sales tự chọn khi kích hoạt)
  fullName: string;                // Họ và tên hiển thị (VD: "Trọng", "Chị Sheryl")
  passwordHash?: string;           // Mật khẩu đã được mã hóa an toàn bằng bcryptjs
  role: UserRole;                  // 'ADMIN' (Quản trị/Sếp) hoặc 'SALES' (Nhân viên bán hàng)
  salesPrefix: string;             // Tiền tố mã Lead cá nhân (VD: "TR" -> Lead sinh ra là TR-1001)
  isActive: boolean;               // Trạng thái tài khoản (true = đã kích hoạt, false = chờ kích hoạt)
  activationToken?: string | null; // Mã token kích hoạt tài khoản gửi qua email (hạn 24h)
  activationExpiresAt?: string | null; // Thời điểm hết hạn của token kích hoạt (ISO Timestamp)
  resetPasswordTokenHash?: string | null; // SHA-256 hash của token đặt lại mật khẩu (dùng 1 lần)
  resetPasswordExpiresAt?: string | null; // Thời điểm hết hạn của token đặt lại mật khẩu (15 phút)
  refreshTokenHash?: string | null;// Hash của Refresh Token lưu trữ để đối soát phiên đăng nhập
  previousRefreshTokenHash?: string | null;      // Hash của token cũ vừa xoay vòng (Grace Period chống race condition)
  previousRefreshTokenExpiresAt?: string | null; // Hạn chót của thời gian ân hạn Grace Period (20s)
  createdAt: string;               // Thời điểm tạo tài khoản (ISO 8601 Timestamp)
  updatedAt: string;               // Thời điểm cập nhật tài khoản gần nhất
}
