/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/auth/requests/login.request.dto.ts
 * PHÂN LOẠI: AUTH / REQUEST
 * VAI TRÒ: DTO Xác Thực Đầu Vào Cho Chức Năng Đăng Nhập (Client -> Server)
 * ==============================================================================
 */

import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập email!' })
    .email('Email không đúng định dạng (VD: trong@skipli.com)'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu!' })
    .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự!'),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
