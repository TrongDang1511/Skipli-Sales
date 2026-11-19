/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/controllers/user.controller.ts
 * VAI TRÒ: Controller Quản Lý Nhân Viên (Dành Riêng Cho Quản Trị Viên / Sếp Sheryl)
 * ==============================================================================
 */

import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { InviteUserRequestSchema, ApiResponse, UserResponseDto, UserListResponseDto } from '../dtos';
import { AuthRequest } from '../middlewares/auth.middleware';

const authService = new AuthService();
const userRepo = new UserRepository();

export class UserController {
  /**
   * 1. MỜI HOẶC TẠO NHÂN VIÊN MỚI (POST /api/users/invite)
   */
  async invite(req: AuthRequest, res: Response) {
    try {
      const validated = InviteUserRequestSchema.parse(req.body);
      const result = await authService.inviteUser(validated);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          activationToken: result.activationToken,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Khởi tạo tài khoản nhân viên thất bại!',
      });
    }
  }

  /**
   * 2. LẤY TOÀN BỘ DANH SÁCH NHÂN VIÊN (GET /api/users)
   */
  async getAll(_req: AuthRequest, res: Response) {
    try {
      const users = await userRepo.findAll();

      // Lọc sạch dữ liệu rác, chỉ giữ thông tin cần hiển thị trên bảng
      const sanitizedUsers = users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        username: u.username,
        role: u.role,
        salesPrefix: u.salesPrefix,
        isActive: u.isActive,
        createdAt: u.createdAt,
      }));

      return res.status(200).json({
        success: true,
        data: {
          users: sanitizedUsers,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi lấy danh sách nhân viên!',
      });
    }
  }

  /**
   * 3. KHÓA HOẶC MỞ KHÓA TÀI KHOẢN (PATCH /api/users/:id/toggle-status)
   */
  async toggleStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const targetUser = await userRepo.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên cần thao tác!',
        });
      }

      // Không cho phép tự khóa chính mình
      if (req.user?.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể tự khóa tài khoản của chính mình!',
        });
      }

      // Đảo ngược trạng thái hoạt động
      targetUser.isActive = !targetUser.isActive;
      targetUser.updatedAt = new Date().toISOString();

      // Nếu là hành động Khóa tài khoản -> Thu hồi ngay lập tức Refresh Token trong CSDL
      if (!targetUser.isActive) {
        targetUser.refreshTokenHash = null;
      }

      await userRepo.save(targetUser);

      return res.status(200).json({
        success: true,
        message: `Đã ${targetUser.isActive ? 'mở khóa' : 'tạm khóa'} tài khoản ${targetUser.fullName} thành công!`,
        data: {
          userId: targetUser.id,
          isActive: targetUser.isActive,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi cập nhật trạng thái tài khoản!',
      });
    }
  }

  /**
   * 4. XÓA TÀI KHOẢN (DELETE /api/users/:id)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể tự xóa tài khoản của chính mình!',
        });
      }

      const targetUser = await userRepo.findById(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên cần xóa!',
        });
      }

      await userRepo.delete(id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa tài khoản nhân viên ${targetUser.fullName} thành công!`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi xóa tài khoản nhân viên!',
      });
    }
  }
}
