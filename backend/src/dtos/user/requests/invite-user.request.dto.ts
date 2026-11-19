/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/user/requests/invite-user.request.dto.ts
 * PHÂN LOẠI: USER / REQUEST
 * VAI TRÒ: DTO Xác Thực Đầu Vào Khi Sếp Tạo / Mời Nhân Viên (Client -> Server)
 * ==============================================================================
 */

import { z } from 'zod';

export const InviteUserRequestSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập email nhân viên!' })
    .email('Email nhân viên không đúng định dạng'),
  fullName: z
    .string({ required_error: 'Vui lòng nhập họ và tên nhân viên!' })
    .min(2, 'Họ và tên nhân viên phải từ 2 ký tự trở lên!'),
  salesPrefix: z
    .string({ required_error: 'Vui lòng nhập tiền tố mã Lead!' })
    .min(1, 'Tiền tố tối thiểu 1 ký tự')
    .max(4, 'Tiền tố tối đa 4 ký tự')
    .transform((val) => val.toUpperCase().trim()),
  mode: z.enum(['invite', 'direct'], {
    required_error: 'Vui lòng chọn hình thức bàn giao tài khoản (invite hoặc direct)!',
  }),
  directPassword: z
    .string()
    .min(6, 'Mật khẩu khởi tạo trực tiếp phải từ 6 ký tự trở lên!')
    .optional(),
});

export type InviteUserRequestDto = z.infer<typeof InviteUserRequestSchema>;
