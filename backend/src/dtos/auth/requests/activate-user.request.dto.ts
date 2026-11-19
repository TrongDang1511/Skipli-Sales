/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/auth/requests/activate-user.request.dto.ts
 * PHÂN LOẠI: AUTH / REQUEST
 * VAI TRÒ: DTO Xác Thực Đầu Vào Cho Chức Năng Kích Hoạt Tài Khoản (Client -> Server)
 * ==============================================================================
 */

import { z } from 'zod';

export const ActivateUserRequestSchema = z.object({
  token: z
    .string({ required_error: 'Mã kích hoạt token là bắt buộc!' })
    .min(1, 'Mã kích hoạt không được để trống!'),
  username: z
    .string({ required_error: 'Vui lòng nhập Username mong muốn!' })
    .min(3, 'Username phải từ 3 ký tự trở lên!')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username chỉ chứa chữ cái, số, gạch dưới, gạch ngang và dấu chấm!'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu mới!' })
    .min(6, 'Mật khẩu mới phải từ 6 ký tự trở lên!'),
});

export type ActivateUserRequestDto = z.infer<typeof ActivateUserRequestSchema>;
