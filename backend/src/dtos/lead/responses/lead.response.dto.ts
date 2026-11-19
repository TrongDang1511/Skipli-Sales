/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/lead/responses/lead.response.dto.ts
 * PHÂN LOẠI: LEAD / RESPONSE
 * VAI TRÒ: DTO Chuẩn Hóa Dữ Liệu Lead Trả Về Cho Phía Client (Server -> Client)
 * ==============================================================================
 */

import { Lead } from '../../../models/lead.model';
import { PaginatedResponse } from '../../common/api-response.dto';

export type LeadResponseDto = Lead;

export type LeadPaginatedResponseDto = PaginatedResponse<LeadResponseDto>;
