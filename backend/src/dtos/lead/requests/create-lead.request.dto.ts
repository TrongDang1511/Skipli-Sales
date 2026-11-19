/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/create-lead.request.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST
 * VAI TRÒ: DTO Xác Thực Dữ Liệu Đầu Vào Khi Tạo Lead Mới (Client -> Server)
 * ==============================================================================
 */

import { z } from 'zod';

export const CreateLeadRequestSchema = z.object({
  // 3 TRƯỜNG BẮT BUỘC CỐT LÕI (REQUIRED)
  restaurantName: z
    .string({ required_error: 'Vui lòng nhập tên nhà hàng, quán ăn!' })
    .min(2, 'Tên nhà hàng phải có ít nhất 2 ký tự!')
    .trim(),
  state: z
    .string({ required_error: 'Vui lòng chọn bang tại Mỹ!' })
    .length(2, 'Mã bang phải đúng 2 ký tự viết hoa (VD: VA, CA, TX)!')
    .transform((val) => val.toUpperCase().trim()),
  hotline: z
    .string({ required_error: 'Vui lòng nhập số điện thoại chính của nhà hàng!' })
    .min(10, 'Số điện thoại phải có ít nhất 10 chữ số!')
    .trim(),

  // CÁC TRƯỜNG TÙY CHỌN (OPTIONAL - CÓ THỂ ĐIỀN SAU)
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  ownerName: z.string().optional().default(''),
  ownerPhone: z.string().optional().default(''),
  ownerEmail: z
    .string()
    .email('Địa chỉ email không đúng định dạng!')
    .optional()
    .or(z.literal('')),
  googleMapsUrl: z
    .string()
    .url('Đường dẫn Google Maps không hợp lệ!')
    .optional()
    .or(z.literal('')),
  facebookUrl: z
    .string()
    .url('Đường dẫn Facebook không hợp lệ!')
    .optional()
    .or(z.literal('')),
  saleNote: z.string().optional().default(''),
  nextCallDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hẹn gọi lại phải theo định dạng YYYY-MM-DD!')
    .optional()
    .or(z.literal('')),
  aiEvaluation: z.string().optional().default(''),
});

export type CreateLeadRequestDto = z.infer<typeof CreateLeadRequestSchema>;
