/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/auth/requests/reset-password.request.dto.ts
 * PHÂN LOẠI: AUTH / REQUEST
 * VAI TRÒ: DTO Xác Thực Đầu Vào Cho Chức Năng Đặt Lại Mật Khẩu Mới
 * ==============================================================================
 */

import { z } from 'zod';

export const ResetPasswordRequestSchema = z.object({
  token: z
    .string({ required_error: 'Mã xác thực đặt lại mật khẩu là bắt buộc!' })
    .min(1, 'Mã xác thực không được để trống!'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu mới!' })
    .min(6, 'Mật khẩu mới phải từ 6 ký tự trở lên!'),
});

export type ResetPasswordRequestDto = z.infer<typeof ResetPasswordRequestSchema>;
