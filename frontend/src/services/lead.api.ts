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
  LeadNote,
  CreateLeadInput,
  CreateLeadNoteInput,
  ImportLeadsResult,
  DashboardPeriod,
  AdminDashboardResponse,
  SalesDashboardResponse,
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
export const extractApiErrorMessage = (error: any, fallbackMessage: string = 'Đã có lỗi xảy ra!'): string => {
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

  /**
   * 8. BÀN GIAO 1 LEAD CHO SALES HOẶC THU HỒI VỀ KHO (CHỈ ADMIN)
   * PATCH /api/leads/:id/assign
   */
  assignLead: async (
    id: string,
    targetSalesId: string
  ): Promise<{ message: string; lead: Lead }> => {
    const res = await api.patch(`/leads/${id}/assign`, { targetSalesId });
    return {
      message: res.data.message || 'Bàn giao nhà hàng thành công!',
      lead: res.data.data,
    };
  },

  /**
   * 9. BÀN GIAO HÀNG LOẠT NHIỀU LEADS CÙNG LÚC (CHỈ ADMIN)
   * POST /api/leads/bulk-assign
   */
  bulkAssignLeads: async (
    leadIds: string[],
    targetSalesId: string
  ): Promise<{ message: string; updatedCount: number }> => {
    const res = await api.post('/leads/bulk-assign', { leadIds, targetSalesId });
    return {
      message: res.data.message || 'Bàn giao hàng loạt thành công!',
      updatedCount: res.data.data?.updatedCount || leadIds.length,
    };
  },

  /**
   * 10. LẤY TIMELINE GHI CHÚ CUỘC GỌI CỦA 1 LEAD
   * GET /api/leads/:id/notes
   */
  getLeadNotes: async (leadId: string): Promise<LeadNote[]> => {
    const res = await api.get(`/leads/${leadId}/notes`);
    return res.data.data || [];
  },

  /**
   * 11. THÊM GHI CHÚ CUỘC GỌI MỚI (OPTIMISTIC WORKSPACE)
   * POST /api/leads/:id/notes
   */
  createLeadNote: async (
    leadId: string,
    data: CreateLeadNoteInput
  ): Promise<{ message: string; note: LeadNote; updatedLead: Lead }> => {
    const res = await api.post(`/leads/${leadId}/notes`, data);
    return {
      message: res.data.message || 'Đã lưu ghi chú!',
      note: res.data.data.note,
      updatedLead: res.data.data.updatedLead,
    };
  },

  /**
   * 12. KIỂM TRA TRÙNG NHIỀU SĐT CÙNG LÚC CHO BẢNG PREVIEW EXCEL
   * POST /api/leads/check-phone
   */
  checkPhonesDuplicate: async (
    phones: string[]
  ): Promise<Record<string, { restaurantName: string; assignedName: string; leadCustomId: string }>> => {
    const res = await api.post('/leads/check-phone', { phones });
    return res.data.data?.duplicates || {};
  },

  /**
   * 13. IMPORT HÀNG LOẠT LEADS TỪ EXCEL
   * POST /api/leads/import
   */
  importLeads: async (
    leads: CreateLeadInput[]
  ): Promise<{ message: string; result: ImportLeadsResult }> => {
    const res = await api.post('/leads/import', { leads });
    return {
      message: res.data.message || 'Import thành công!',
      result: res.data.data,
    };
  },

  /**
   * 14. LẤY DỮ LIỆU THỐNG KÊ THẬT CHO ADMIN DASHBOARD
   * GET /api/leads/admin-dashboard
   */
  getAdminDashboard: async (
    period: DashboardPeriod,
    todayDate: string
  ): Promise<AdminDashboardResponse> => {
    const res = await api.get('/leads/admin-dashboard', {
      params: { period, todayDate },
    });
    return res.data.data;
  },

  /**
   * 15. LẤY DỮ LIỆU THỐNG KÊ THẬT CHO SALES DASHBOARD
   * GET /api/leads/sales-dashboard
   */
  getSalesDashboard: async (
    period: DashboardPeriod,
    todayDate: string
  ): Promise<SalesDashboardResponse> => {
    const res = await api.get('/leads/sales-dashboard', {
      params: { period, todayDate },
    });
    return res.data.data;
  },

  /**
   * 16. LẤY TOÀN BỘ LEADS KHỚP BỘ LỌC ĐỂ XUẤT EXCEL (GOM TRANG LIMIT=100 SONG SONG)
   */
  getAllLeadsForExport: async (
    params?: Omit<GetLeadsParams, 'page' | 'limit'>
  ): Promise<Lead[]> => {
    const firstPage = await leadApi.getLeads({ ...params, page: 1, limit: 100 });
    const allItems: Lead[] = [...(firstPage.items || [])];

    if (firstPage.totalPages > 1) {
      const restPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, idx) =>
          leadApi.getLeads({ ...params, page: idx + 2, limit: 100 })
        )
      );
      restPages.forEach((pageRes) => {
        allItems.push(...(pageRes.items || []));
      });
    }

    return allItems;
  },
};
