/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/middlewares/auth.middleware.ts
 * VAI TRÒ: Middleware Xác Thực JWT, Phân Quyền RBAC & Giới Hạn Tần Suất (Rate Limit)
 * ==============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'SALES';
    fullName: string;
    salesPrefix: string;
  };
}

/**
 * 1. MIDDLEWARE XÁC THỰC ACCESS TOKEN (Bearer Token từ Header)
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để thực hiện chức năng này!',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthRequest['user'];
    req.user = decoded;
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Phiên làm việc đã hết hạn. Đang tự động làm mới token...',
      });
    }
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Token xác thực không hợp lệ. Vui lòng đăng nhập lại!',
    });
  }
}

/**
 * 2. MIDDLEWARE PHÂN QUYỀN ADMIN (Chỉ Sếp Sheryl hoặc tài khoản quản trị mới được truy cập)
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập chức năng này (Yêu cầu tài khoản Quản Trị Viên)!',
    });
  }
  return next();
}

function createRateLimiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });
}

/**
 * 3. RATE LIMITER: CHỐNG TẤN CÔNG DÒ MẬT KHẨU (BRUTE-FORCE DEFENSE)
 * Tối đa 5 lần thử đăng nhập sai trong vòng 15 phút cho mỗi địa chỉ IP
 */
export const loginRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Bạn đã thử đăng nhập thất bại quá nhiều lần. Để bảo vệ tài khoản, vui lòng thử lại sau 15 phút!'
);

/**
 * 4. RATE LIMITER: CHỐNG SPAM EMAIL BREVO (SPAM DEFENSE)
 * Tối đa 15 lượt mời nhân viên trong vòng 1 giờ cho mỗi địa chỉ IP
 */
export const inviteRateLimiter = createRateLimiter(
  60 * 60 * 1000,
  15,
  'Bạn đã thực hiện quá nhiều yêu cầu gửi email mời nhân viên. Vui lòng thử lại sau 1 giờ!'
);

/**
 * 5. RATE LIMITER: CHỐNG SPAM EMAIL QUÊN MẬT KHẨU
 * Tối đa 5 yêu cầu trong vòng 15 phút cho mỗi địa chỉ IP
 */
export const forgotPasswordRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Bạn đã gửi quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút!'
);
