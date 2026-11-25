/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/get-leads-query.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST
 * VAI TRÒ: DTO Xác Thực Query Params Khi Lấy Danh Sách Lead (Filter, Search, Pagination)
 * ==============================================================================
 */

import { z } from 'zod';

export const GetLeadsQuerySchema = z.object({
  status: z
    .enum(['NEW', 'CALLING', 'LOW_INTERESTED', 'HIGH_INTERESTED', 'HOT_LEAD', 'WON', 'LOST'])
    .optional(),
  search: z.string().optional().default(''),
  state: z.string().optional().default(''),
  assignedTo: z.string().optional(), // Dành cho Admin muốn xem lead của 1 bạn Sales cụ thể
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(['createdAt', 'updatedAt', 'nextCallDate', 'restaurantName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetLeadsQueryDto = z.infer<typeof GetLeadsQuerySchema>;
