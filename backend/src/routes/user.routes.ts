/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/routes/user.routes.ts
 * VAI TRÒ: Định Tuyến Quản Lý Tài Khoản (Được bảo vệ bởi requireAuth & requireAdmin)
 * ==============================================================================
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth, requireAdmin, inviteRateLimiter } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Tất cả các route bên dưới bắt buộc phải ĐĂNG NHẬP và có quyền ADMIN
router.use(requireAuth, requireAdmin);

// 1. Mời hoặc khởi tạo nhân viên mới (Có Rate Limit chống spam mail Brevo)
router.post('/invite', inviteRateLimiter, (req, res) => userController.invite(req, res));

// 2. Lấy danh sách toàn bộ nhân viên công ty
router.get('/', (req, res) => userController.getAll(req, res));

// 3. Khóa hoặc Mở khóa tài khoản nhân viên
router.patch('/:id/toggle-status', (req, res) => userController.toggleStatus(req, res));

// 4. Xóa tài khoản nhân viên
router.delete('/:id', (req, res) => userController.delete(req, res));

export default router;
