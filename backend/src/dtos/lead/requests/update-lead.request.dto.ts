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

export const UpdateLeadRequestSchema = CreateLeadRequestSchema.partial().extend({
  status: LeadStatusSchema.optional(),
  callCount: z.number().int().min(0).optional(),
  dealValue: z.number().min(0, 'Giá trị hợp đồng không được âm!').optional(),
  lostReason: z.string().optional(),
  latestNote: z.string().optional(),
});

export type UpdateLeadRequestDto = z.infer<typeof UpdateLeadRequestSchema>;
