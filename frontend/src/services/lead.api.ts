/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/services/lead.api.ts
 * PHÂN LOẠI: API SERVICE (TẦNG GIAO TIẾP MẠNG HTTP)
 * VAI TRÒ: Đóng Gói Các Lời Gọi HTTP Tới Backend /api/leads Bằng Axios Instance Đã Có Auth
 * ==============================================================================
 */

import { api } from './api';
import {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  GetLeadsParams,
  GetLeadsResponse,
  CheckPhoneResponse,
  LeadStatus,
} from '../types/lead.types';

/**
 * HÀM TIỆN ÍCH: BÓC TÁCH THÔNG BÁO LỖI TỪ BACKEND
 * Đảm bảo Toast luôn hiển thị đúng câu thông báo tiếng Việt từ API, không bị văng [object Object]
 */
export const extractApiErrorMessage = (error: any, fallbackMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
};

export const leadApi = {
  /**
   * 1. LẤY DANH SÁCH LEADS (HỖ TRỢ PHÂN TRANG, TÌM KIẾM, LỌC STATUS/BANG)
   * GET /api/leads
   */
  getLeads: async (params?: GetLeadsParams): Promise<GetLeadsResponse> => {
    const res = await api.get('/leads', { params });
    // Backend trả về: { success: true, data: { items: [], total, page, pageSize, totalPages } }
    return res.data.data;
  },

  /**
   * 2. LẤY CHI TIẾT LEAD THEO ID
   * GET /api/leads/:id
   */
  getLeadById: async (id: string): Promise<Lead> => {
    const res = await api.get(`/leads/${id}`);
    return res.data.data;
  },

  /**
   * 3. TẠO LEAD MỚI (SINH MÃ CÁ NHÂN TR-1001 & CHỐNG TRÙNG)
   * POST /api/leads
   */
  createLead: async (data: CreateLeadInput): Promise<{ message: string; lead: Lead }> => {
    const res = await api.post('/leads', data);
    return {
      message: res.data.message || 'Tạo nhà hàng mới thành công!',
      lead: res.data.data,
    };
  },

  /**
   * 4. KIỂM TRA TRÙNG SỐ ĐIỆN THOẠI THỜI GIAN THỰC (<20MS)
   * POST /api/leads/check-phone
   */
  checkPhoneDuplicate: async (phone: string): Promise<CheckPhoneResponse> => {
    const res = await api.post('/leads/check-phone', { phone });
    return res.data.data;
  },

  /**
   * 5. CẬP NHẬT THÔNG TIN HOẶC TRẠNG THÁI LEAD
   * PATCH /api/leads/:id
   */
  updateLead: async (
    id: string,
    data: UpdateLeadInput
  ): Promise<{ message: string; lead: Lead }> => {
    const res = await api.patch(`/leads/${id}`, data);
    return {
      message: res.data.message || 'Cập nhật thành công!',
      lead: res.data.data,
    };
  },

  /**
   * 6. HELPER CHUYÊN DỤNG: ĐỔI TRẠNG THÁI LEAD (KÈM NEXT CALL DATE / DEAL VALUE / LOST REASON)
   * PATCH /api/leads/:id
   */
  updateLeadStatus: async (
    id: string,
    status: LeadStatus,
    extraData?: {
      nextCallDate?: string | null;
      dealValue?: number;
      lostReason?: string;
    }
  ): Promise<{ message: string; lead: Lead }> => {
    const payload: UpdateLeadInput = {
      status,
      ...extraData,
    };
    return await leadApi.updateLead(id, payload);
  },

  /**
   * 7. XÓA LEAD KHỎI HỆ THỐNG
   * DELETE /api/leads/:id
   */
  deleteLead: async (id: string): Promise<string> => {
    const res = await api.delete(`/leads/${id}`);
    return res.data.message || 'Đã xóa nhà hàng thành công!';
  },
};
