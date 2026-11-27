/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/controllers/lead.controller.ts
 * PHÂN LOẠI: CONTROLLER (TẦNG TIẾP NHẬN HTTP REQUEST)
 * VAI TRÒ: Điều Hướng Request, Validate DTO Và Trả Về Phản Hồi ApiResponse Chuẩn
 * ==============================================================================
 */

import { Response } from 'express';
import { LeadService } from '../services/lead.service';
import { LeadNoteService } from '../services/lead-note.service';
import {
  CreateLeadRequestSchema,
  ImportLeadsRequestSchema,
  CreateLeadNoteRequestSchema,
  GetLeadsQuerySchema,
  UpdateLeadRequestSchema,
  AssignLeadRequestSchema,
  BulkAssignLeadsRequestSchema,
} from '../dtos';
import { AuthRequest } from '../middlewares/auth.middleware';

const leadService = new LeadService();
const leadNoteService = new LeadNoteService();

export class LeadController {
  /**
   * 1. TẠO LEAD MỚI (POST /api/leads)
   */
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const validatedData = CreateLeadRequestSchema.parse(req.body);
      const newLead = await leadService.createLead(validatedData, req.user);

      return res.status(201).json({
        success: true,
        message: `Đã tạo thành công nhà hàng "${newLead.restaurantName}" với mã ${newLead.leadCustomId}!`,
        data: newLead,
      });
    } catch (err: any) {
      const isDuplicate = err.message?.includes('đã tồn tại') || err.message?.includes('đã trùng');
      const statusCode = isDuplicate ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Tạo nhà hàng mới thất bại!',
      });
    }
  }

  /**
   * 2. LẤY DANH SÁCH LEADS (GET /api/leads)
   */
  async getLeads(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const validatedQuery = GetLeadsQuerySchema.parse(req.query);
      const result = await leadService.getLeads(validatedQuery, req.user);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lấy danh sách nhà hàng thất bại!',
      });
    }
  }

  /**
   * 3. KIỂM TRA TRÙNG SỐ ĐIỆN THOẠI (POST /api/leads/check-phone)
   * Hỗ trợ cả kiểm tra 1 số ({ phone }) lẫn kiểm tra theo lô ({ phones[] }) cho Preview Excel
   */
  async checkPhone(req: AuthRequest, res: Response) {
    try {
      const { phone, phones } = req.body;

      if (Array.isArray(phones)) {
        if (phones.length === 0 || phones.length > 500) {
          return res.status(400).json({
            success: false,
            message: 'Danh sách số điện thoại kiểm tra phải từ 1 đến 500 số!',
          });
        }
        const batchResult = await leadService.checkPhonesBatch(
          phones.map((item) => String(item ?? ''))
        );
        return res.status(200).json({
          success: true,
          data: batchResult,
        });
      }

      if (!phone) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại cần kiểm tra!' });
      }

      const result = await leadService.checkPhoneDuplicate(phone);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Kiểm tra số điện thoại thất bại!',
      });
    }
  }

  /**
   * 4. LẤY CHI TIẾT LEAD (GET /api/leads/:id)
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const lead = await leadService.getLeadById(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 404;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Không tìm thấy nhà hàng!',
      });
    }
  }

  /**
   * 5. CẬP NHẬT THÔNG TIN / TRẠNG THÁI LEAD (PATCH /api/leads/:id)
   */
  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const validatedData = UpdateLeadRequestSchema.parse(req.body);
      const updatedLead = await leadService.updateLead(req.params.id, validatedData, req.user);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin nhà hàng thành công!',
        data: updatedLead,
      });
    } catch (err: any) {
      let statusCode = 400;
      if (err.message?.includes('quyền')) statusCode = 403;
      if (err.message?.includes('đã trùng')) statusCode = 409;

      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Cập nhật thất bại!',
      });
    }
  }

  /**
   * 6. XÓA LEAD (DELETE /api/leads/:id)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      await leadService.deleteLead(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        message: 'Đã xóa nhà hàng khỏi hệ thống thành công!',
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Xóa nhà hàng thất bại!',
      });
    }
  }

  /**
   * 7. ADMIN BÀN GIAO 1 LEAD CHO SALES (PATCH /api/leads/:id/assign)
   */
  async assignLead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const { id } = req.params;
      const validated = AssignLeadRequestSchema.parse(req.body);
      const lead = await leadService.assignLead(id, validated.targetSalesId, req.user);

      return res.status(200).json({
        success: true,
        message: `Đã cập nhật phân bổ nhà hàng "${lead.restaurantName}" cho ${lead.assignedName} thành công!`,
        data: lead,
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Bàn giao nhà hàng thất bại!',
      });
    }
  }

  /**
   * 8. ADMIN BÀN GIAO HÀNG LOẠT (POST /api/leads/bulk-assign)
   */
  async bulkAssign(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const validated = BulkAssignLeadsRequestSchema.parse(req.body);
      const result = await leadService.bulkAssignLeads(
        validated.leadIds,
        validated.targetSalesId,
        req.user
      );

      return res.status(200).json({
        success: true,
        message: `Đã bàn giao thành công ${result.updatedCount} nhà hàng!`,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Bàn giao hàng loạt thất bại!',
      });
    }
  }

  /**
   * 9. LẤY TIMELINE GHI CHÚ CỦA 1 LEAD (GET /api/leads/:id/notes)
   */
  async getNotes(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }
      const notes = await leadNoteService.getNotesByLeadId(req.params.id, req.user);
      return res.status(200).json({ success: true, data: notes });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Lấy lịch sử ghi chú thất bại!',
      });
    }
  }

  /**
   * 10. THÊM GHI CHÚ CUỘC GỌI MỚI (POST /api/leads/:id/notes)
   */
  async addNote(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }
      const validated = CreateLeadNoteRequestSchema.parse(req.body);
      const result = await leadNoteService.addNote(req.params.id, validated, req.user);
      return res.status(201).json({
        success: true,
        message: 'Đã lưu ghi chú cuộc gọi thành công!',
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Lưu ghi chú cuộc gọi thất bại!',
      });
    }
  }

  /**
   * 11. IMPORT HÀNG LOẠT LEADS TỪ EXCEL (POST /api/leads/import)
   */
  async importLeads(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }

      const validated = ImportLeadsRequestSchema.parse(req.body);
      const result = await leadService.importLeads(validated, req.user);

      return res.status(201).json({
        success: true,
        message: `Đã import thành công ${result.importedCount} nhà hàng!`,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Import danh sách nhà hàng thất bại!',
      });
    }
  }

  /**
   * 12. THỐNG KÊ ADMIN DASHBOARD (GET /api/leads/admin-dashboard)
   */
  async getAdminDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }
      const rawPeriod = String(req.query.period || '30d');
      const period = (['today', '7d', '30d', 'all'].includes(rawPeriod)
        ? rawPeriod
        : '30d') as 'today' | '7d' | '30d' | 'all';
      const todayDate = String(req.query.todayDate || '');

      const data = await leadService.getAdminDashboard(period, todayDate, req.user);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      const statusCode = err.message?.includes('quyền') ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Tải dữ liệu Admin Dashboard thất bại!',
      });
    }
  }

  /**
   * 13. THỐNG KÊ SALES DASHBOARD (GET /api/leads/sales-dashboard)
   */
  async getSalesDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại!' });
      }
      const rawPeriod = String(req.query.period || '7d');
      const period = (['today', '7d', '30d', 'all'].includes(rawPeriod)
        ? rawPeriod
        : '7d') as 'today' | '7d' | '30d' | 'all';
      const todayDate = String(req.query.todayDate || '');

      const data = await leadService.getSalesDashboard(period, todayDate, req.user);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Tải dữ liệu Sales Dashboard thất bại!',
      });
    }
  }
}
