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
import { CreateLeadRequestSchema, GetLeadsQuerySchema, UpdateLeadRequestSchema } from '../dtos';
import { AuthRequest } from '../middlewares/auth.middleware';

const leadService = new LeadService();

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
   */
  async checkPhone(req: AuthRequest, res: Response) {
    try {
      const { phone } = req.body;
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
}
