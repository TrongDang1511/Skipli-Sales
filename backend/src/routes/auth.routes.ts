/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/routes/auth.routes.ts
 * VAI TRÒ: Định Tuyến Xác Thực, Làm Mới Phiên & Đăng Ký Rate Limiting
 * ==============================================================================
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth, loginRateLimiter, forgotPasswordRateLimiter } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// 1. Đăng nhập (Có Rate Limit chống Brute-force dò mật khẩu)
router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));

// 2. Làm mới Token (Refresh Token Rotation)
router.post('/refresh', (req, res) => authController.refresh(req, res));

// 3. Kích hoạt tài khoản từ link email
router.post('/activate', (req, res) => authController.activate(req, res));

// 4. Lấy thông tin user hiện tại (Dành cho Frontend F5 giữ trạng thái)
router.get('/me', requireAuth, (req, res) => authController.getMe(req, res));

// 5. Đăng xuất an toàn (Hủy refresh token trong DB và xóa Cookie)
router.post('/logout', requireAuth, (req, res) => authController.logout(req, res));

// 6. Quên mật khẩu (Public + Rate Limit chống spam email)
router.post('/forgot-password', forgotPasswordRateLimiter, (req, res) =>
  authController.forgotPassword(req, res)
);

// 7. Đặt lại mật khẩu mới từ link email (Public)
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;
