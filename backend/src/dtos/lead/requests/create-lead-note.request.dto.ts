/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/create-lead-note.request.dto.ts
 * PHÂN LOẠI: LEAD NOTE / REQUEST DTO
 * VAI TRÒ: Validate Dữ Liệu Đầu Vào Khi Ghi Chú Cuộc Gọi Mới
 * ==============================================================================
 */

import { z } from 'zod';

export const CreateLeadNoteRequestSchema = z.object({
  callResult: z
    .enum(['ANSWERED', 'CALLBACK', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'NOTE_ONLY'])
    .default('ANSWERED'),
  content: z
    .string({ required_error: 'Vui lòng nhập nội dung ghi chú cuộc gọi!' })
    .trim()
    .min(1, 'Nội dung ghi chú không được để trống!')
    .max(2000, 'Ghi chú tối đa 2000 ký tự!'),
  nextCallDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hẹn gọi lại phải theo định dạng YYYY-MM-DD')
    .nullable()
    .optional(),
  status: z
    .enum(['NEW', 'CALLING', 'LOW_INTERESTED', 'HIGH_INTERESTED', 'HOT_LEAD', 'WON', 'LOST'])
    .optional(),
});

export type CreateLeadNoteRequestDto = z.infer<typeof CreateLeadNoteRequestSchema>;
