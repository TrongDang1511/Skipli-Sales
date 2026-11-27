/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/requests/import-leads.request.dto.ts
 * PHÂN LOẠI: LEAD / REQUEST DTO
 * VAI TRÒ: Validate Payload Import Hàng Loạt Từ Excel
 * ==============================================================================
 */

import { z } from 'zod';
import { CreateLeadRequestSchema } from './create-lead.request.dto';

export const ImportLeadsRequestSchema = z.object({
  leads: z
    .array(CreateLeadRequestSchema)
    .min(1, 'Vui lòng chọn ít nhất 1 nhà hàng hợp lệ để import!')
    .max(500, 'Chỉ import tối đa 500 nhà hàng mỗi lần!'),
});

export type ImportLeadsRequestDto = z.infer<typeof ImportLeadsRequestSchema>;
