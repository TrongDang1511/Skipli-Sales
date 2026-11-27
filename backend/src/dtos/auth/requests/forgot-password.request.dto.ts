/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/auth/requests/forgot-password.request.dto.ts
 * PHÂN LOẠI: AUTH / REQUEST
 * VAI TRÒ: DTO Xác Thực Đầu Vào Cho Chức Năng Quên Mật Khẩu
 * ==============================================================================
 */

import { z } from 'zod';

export const ForgotPasswordRequestSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập email!' })
    .trim()
    .email('Địa chỉ email không hợp lệ!'),
});

export type ForgotPasswordRequestDto = z.infer<typeof ForgotPasswordRequestSchema>;
