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
    .string({ required_error: 'Vui lòng nhập email hoặc tên đăng nhập!' })
    .min(2, 'Email hoặc tên đăng nhập phải chứa ít nhất 2 ký tự!'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu!' })
    .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự!'),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
