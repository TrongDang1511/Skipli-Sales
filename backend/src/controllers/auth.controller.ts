/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/controllers/auth.controller.ts
 * VAI TRÒ: Controller Tiếp Nhận Request Xác Thực, Gán Cookie & Quản Lý Phiên
 * ==============================================================================
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  LoginRequestSchema,
  ActivateUserRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  ApiResponse,
  AuthResponseDto,
} from '../dtos';
import { AuthRequest } from '../middlewares/auth.middleware';
import { env } from '../config/env.config';

const authService = new AuthService();
const REFRESH_COOKIE_NAME = 'skipli_refresh_token';

/**
 * Cấu hình Cookie an toàn thích ứng động theo môi trường (Dev vs Production)
 */
function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true, // Chống đánh cắp qua JavaScript XSS
    secure: env.isProduction, // Chỉ truyền qua HTTPS khi deploy Production
    sameSite: (env.isProduction ? 'strict' : 'lax') as 'strict' | 'lax', // Chống CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  };
}

function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: (env.isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
  };
}

function extractControllerErrorMessage(err: any, fallback: string): string {
  return err?.issues?.[0]?.message || err?.message || fallback;
}

export class AuthController {
  /**
   * 1. ĐĂNG NHẬP (POST /api/auth/login)
   * CHUẨN THỰC TẾ: Refresh Token chỉ nằm trong HttpOnly Cookie, KHÔNG nằm trong JSON body!
   */
  async login(req: Request, res: Response) {
    try {
      const validated = LoginRequestSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(validated);

      // Gán Refresh Token vào HttpOnly Cookie bảo mật
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: {
          accessToken,
          user,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Đăng nhập thất bại!',
      });
    }
  }

  /**
   * 2. LÀM MỚI PHIÊN (POST /api/auth/refresh)
   * Đọc từ HttpOnly Cookie (chuẩn trình duyệt) hoặc fallback từ Body nếu có
   */
  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy phiên làm việc trong Cookie. Vui lòng đăng nhập lại!',
        });
      }

      const { accessToken, refreshToken, user } = await authService.refreshTokens(token);

      // Ghi đè Refresh Token mới vào Cookie (Xoay vòng Token - RTR)
      if (refreshToken) {
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
      }

      return res.status(200).json({
        success: true,
        message: 'Làm mới phiên làm việc thành công!',
        data: {
          accessToken,
          user,
        },
      });
    } catch (err: any) {
      res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions());
      return res.status(401).json({
        success: false,
        message: err.message || 'Phiên làm việc không hợp lệ!',
      });
    }
  }

  /**
   * 3. KÍCH HOẠT TÀI KHOẢN (POST /api/auth/activate)
   */
  async activate(req: Request, res: Response) {
    try {
      const validated = ActivateUserRequestSchema.parse(req.body);
      const { message, user, accessToken, refreshToken } = await authService.activateUser(validated);

      // Tự động gán Cookie đăng nhập ngay sau kích hoạt
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

      return res.status(200).json({
        success: true,
        message,
        data: {
          accessToken,
          user,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Kích hoạt tài khoản thất bại!',
      });
    }
  }

  /**
   * 4. ĐĂNG XUẤT (POST /api/auth/logout)
   */
  async logout(req: AuthRequest, res: Response) {
    try {
      if (req.user?.id) {
        await authService.logout(req.user.id);
      }

      res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'Đã đăng xuất an toàn khỏi hệ thống!',
      });
    } catch (err: any) {
      res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions());
      return res.status(200).json({
        success: true,
        message: 'Đã đăng xuất!',
      });
    }
  }

  /**
   * 5. LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP (GET /api/auth/me)
   */
  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin phiên xác thực!',
        });
      }

      const user = await authService.getMe(req.user.id);
      return res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        message: err.message || 'Không thể lấy thông tin người dùng!',
      });
    }
  }

  /**
   * 6. QUÊN MẬT KHẨU (POST /api/auth/forgot-password)
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const validated = ForgotPasswordRequestSchema.parse(req.body);
      const result = await authService.forgotPassword(validated.email);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: extractControllerErrorMessage(err, 'Không thể gửi yêu cầu đặt lại mật khẩu!'),
      });
    }
  }

  /**
   * 7. ĐẶT LẠI MẬT KHẨU MỚI (POST /api/auth/reset-password)
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const validated = ResetPasswordRequestSchema.parse(req.body);
      const result = await authService.resetPassword(validated.token, validated.password);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: extractControllerErrorMessage(err, 'Đặt lại mật khẩu thất bại!'),
      });
    }
  }
}
