/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/get-leads-query.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST
 * VAI TRÒ: DTO Xác Thực Query Params Khi Lấy Danh Sách Lead (Filter, Search, Pagination)
 * ==============================================================================
 */

import { z } from 'zod';
import { LeadStatus } from '../../../models/lead.model';

export type LeadSheetKey = 'NEW' | 'FOLLOW_UP' | 'CLOSED';
export type LeadScheduleFilter = 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'UNSCHEDULED';

// Single Source of Truth: Ánh xạ từng Sheet sang danh sách LeadStatus tương ứng
export const LEAD_SHEET_STATUSES: Record<LeadSheetKey, LeadStatus[]> = {
  NEW: ['NEW'],
  FOLLOW_UP: ['CALLING', 'LOW_INTERESTED', 'HIGH_INTERESTED', 'HOT_LEAD'],
  CLOSED: ['WON', 'LOST'],
};

export const GetLeadsQuerySchema = z.object({
  status: z
    .enum(['NEW', 'CALLING', 'LOW_INTERESTED', 'HIGH_INTERESTED', 'HOT_LEAD', 'WON', 'LOST'])
    .optional(),
  sheet: z.enum(['NEW', 'FOLLOW_UP', 'CLOSED']).optional(),
  schedule: z.enum(['TODAY', 'OVERDUE', 'UPCOMING', 'UNSCHEDULED']).optional(),
  todayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().optional().default(''),
  state: z.string().optional().default(''),
  assignedTo: z.string().optional(), // Dành cho Admin muốn xem lead của 1 bạn Sales cụ thể
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(['createdAt', 'updatedAt', 'nextCallDate', 'restaurantName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetLeadsQueryDto = z.infer<typeof GetLeadsQuerySchema>;
