/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/update-lead.request.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST
 * VAI TRÒ: DTO Xác Thực Dữ Liệu Khi Cập Nhật Thông Tin Hoặc Trạng Thái Lead
 * ==============================================================================
 */

import { z } from 'zod';
import { CreateLeadRequestSchema } from './create-lead.request.dto';

export const LeadStatusSchema = z.enum([
  'NEW',
  'CALLING',
  'LOW_INTERESTED',
  'HIGH_INTERESTED',
  'HOT_LEAD',
  'WON',
  'LOST',
]);

export const UpdateLeadRequestSchema = CreateLeadRequestSchema.partial()
  .extend({
    status: LeadStatusSchema.optional(),
    callCount: z.number().int().min(0).optional(),
    lastCallDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày gọi gần nhất phải theo định dạng YYYY-MM-DD!')
      .nullable()
      .optional()
      .or(z.literal('')),
    dealValue: z.number().min(0, 'Giá trị hợp đồng không được âm!').optional(),
    lostReason: z.string().optional(),
    latestNote: z.string().optional(),
    nextCallDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hẹn gọi lại phải theo định dạng YYYY-MM-DD!')
      .nullable()
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // QUY TẮC NGHIỆP VỤ: Chỉ cho phép nextCallDate = null khi đơn hàng ở trạng thái WON hoặc LOST
      if (data.nextCallDate === null) {
        return data.status === 'WON' || data.status === 'LOST';
      }
      return true;
    },
    {
      message: 'Chỉ được xóa Ngày hẹn gọi lại (nextCallDate = null) khi trạng thái là WON hoặc LOST!',
      path: ['nextCallDate'],
    }
  );

export type UpdateLeadRequestDto = z.infer<typeof UpdateLeadRequestSchema>;
