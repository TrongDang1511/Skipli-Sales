/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/assign-lead.request.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST DTO
 * VAI TRÒ: Xác thực dữ liệu đầu vào khi Admin bàn giao 1 Lead hoặc nhiều Leads cho Sales (hoặc thu hồi về kho chung)
 * ==============================================================================
 */

import { z } from 'zod';

// 1. DTO Bàn giao 1 Lead lẻ (Hỗ trợ targetSalesId là ID nhân viên hoặc 'UNASSIGNED' để thu hồi về kho)
export const AssignLeadRequestSchema = z.object({
  targetSalesId: z
    .string({ required_error: 'Vui lòng chọn nhân viên Sales tiếp nhận lead!' })
    .min(1, 'ID nhân viên tiếp nhận không được để trống!'),
});

export type AssignLeadRequestDto = z.infer<typeof AssignLeadRequestSchema>;

// 2. DTO Bàn giao hàng loạt nhiều Leads cùng lúc (Bulk Assign)
export const BulkAssignLeadsRequestSchema = z.object({
  leadIds: z
    .array(z.string().min(1), { required_error: 'Danh sách ID nhà hàng không hợp lệ!' })
    .min(1, 'Vui lòng chọn ít nhất 1 nhà hàng để bàn giao!'),
  targetSalesId: z
    .string({ required_error: 'Vui lòng chọn nhân viên Sales tiếp nhận lead!' })
    .min(1, 'ID nhân viên tiếp nhận không được để trống!'),
});

export type BulkAssignLeadsRequestDto = z.infer<typeof BulkAssignLeadsRequestSchema>;
