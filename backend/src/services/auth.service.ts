/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/services/auth.service.ts
 * VAI TRÒ: Tầng Nghiệp Vụ Xác Thực & Quản Lý Phiên (Enterprise Security)
 * ==============================================================================
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from './email.service';
import { User } from '../models/user.model';
import {
  LoginRequestDto,
  ActivateUserRequestDto,
  InviteUserRequestDto,
  UserResponseDto,
} from '../dtos';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // Hiệu lực link đặt lại mật khẩu: 15 phút

export class AuthService {
  private userRepo: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepo = new UserRepository();
    this.emailService = new EmailService();
  }

  /**
   * Chuẩn hóa User DTO - Chỉ giữ lại đúng các trường cần thiết cho giao diện
   * Loại bỏ sạch sẽ các trường rác hoặc nhạy cảm (passwordHash, refreshTokenHash, activationToken, createdAt, updatedAt)
   */
  private sanitizeUser(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      salesPrefix: user.salesPrefix,
      isActive: user.isActive,
    };
  }

  /**
   * 1. ĐĂNG NHẬP & CẤP PHÁT DUAL-TOKEN (Access Token 15m + Refresh Token 7d)
   */
  async login(input: LoginRequestDto) {
    const identifier = input.email.trim();
    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByUsername(identifier);
    }

    // Dùng câu thông báo chung chống lộ danh tính (User Enumeration Defense)
    if (!user) {
      throw new Error('Email/Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản chưa được kích hoạt hoặc đã bị tạm khóa. Vui lòng liên hệ Admin!');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash || '');
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // Sinh Access Token (15 phút) - Chứa payload danh tính
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        salesPrefix: user.salesPrefix,
      },
      env.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    // Sinh Refresh Token (7 ngày)
    const refreshToken = jwt.sign(
      { id: user.id },
      env.jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Băm Refresh Token với bcrypt và lưu vào CSDL để đối soát
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 8);
    user.previousRefreshTokenHash = null;
    user.previousRefreshTokenExpiresAt = null;
    user.updatedAt = new Date().toISOString();
    await this.userRepo.save(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * 2. LÀM MỚI PHIÊN ĐĂNG NHẬP (Refresh Token Rotation - RTR & Reuse Detection)
   */
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Không tìm thấy Refresh Token!');
    }

    let payload: { id: string };
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { id: string };
    } catch {
      throw new Error('Refresh Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!');
    }

    const user = await this.userRepo.findById(payload.id);
    if (!user || !user.isActive) {
      throw new Error('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa!');
    }

    if (!user.refreshTokenHash) {
      throw new Error('Phiên làm việc đã bị thu hồi từ trước. Vui lòng đăng nhập lại!');
    }

    // 1. So khớp Refresh Token gửi lên với hash lưu trong CSDL
    const isTokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (isTokenMatch) {
      // CƠ CHẾ XOAY VÒNG (ROTATION): Cấp cặp token hoàn toàn mới
      const newAccessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          salesPrefix: user.salesPrefix,
        },
        env.jwtAccessSecret,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        env.jwtRefreshSecret,
        { expiresIn: '7d' }
      );

      // CƠ CHẾ GRACE PERIOD (Ân hạn 20s theo chuẩn Auth0 / RFC 6819):
      // Lưu lại hash của token cũ vừa đổi phòng trường hợp React StrictMode hoặc mạng lag retry
      user.previousRefreshTokenHash = user.refreshTokenHash;
      user.previousRefreshTokenExpiresAt = new Date(Date.now() + 20 * 1000).toISOString();

      // Cập nhật hash của Refresh Token mới vào Firestore
      user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 8);
      user.updatedAt = new Date().toISOString();
      await this.userRepo.save(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: this.sanitizeUser(user),
      };
    }

    // 2. Nếu không khớp token chính thức -> Kiểm tra xem có nằm trong Grace Period hợp lệ (20s) hay không!
    const now = Date.now();
    const isWithinGracePeriod =
      user.previousRefreshTokenHash &&
      user.previousRefreshTokenExpiresAt &&
      new Date(user.previousRefreshTokenExpiresAt).getTime() > now;

    if (isWithinGracePeriod && user.previousRefreshTokenHash) {
      const isGraceMatch = await bcrypt.compare(refreshToken, user.previousRefreshTokenHash);
      if (isGraceMatch) {
        // ĐÂY LÀ REQUEST ĐỒNG THỜI HỢP LỆ (Mạng lag retry / React StrictMode / Multi-Tab trong 20s)!
        // Cấp Access Token mới mà KHÔNG thu hồi phiên, bảo toàn quyền truy cập cho user
        const newAccessToken = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            salesPrefix: user.salesPrefix,
          },
          env.jwtAccessSecret,
          { expiresIn: '15m' }
        );

        return {
          accessToken: newAccessToken,
          refreshToken: null, // Không ghi đè lại refreshToken mới để tránh xáo trộn cookie
          user: this.sanitizeUser(user),
        };
      }
    }

    // 3. Nếu không khớp cả token hiện tại lẫn Grace Period -> ĐÍCH THỰC LÀ TOKEN REUSE ATTACK!
    user.refreshTokenHash = null;
    user.previousRefreshTokenHash = null;
    user.previousRefreshTokenExpiresAt = null;
    user.updatedAt = new Date().toISOString();
    await this.userRepo.save(user);
    throw new Error('Cảnh báo bảo mật: Refresh token không hợp lệ hoặc đã qua sử dụng! Phiên đã bị khóa.');
  }

  /**
   * 3. ĐĂNG XUẤT AN TOÀN (Thu hồi phiên triệt để trên Server)
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (user) {
      user.refreshTokenHash = null;
      user.previousRefreshTokenHash = null;
      user.previousRefreshTokenExpiresAt = null;
      user.updatedAt = new Date().toISOString();
      await this.userRepo.save(user);
    }
  }

  /**
   * 4. SẾP MỜI NHÂN VIÊN (2 Nhánh Onboarding + Kiểm tra trùng SalesPrefix)
   */
  async inviteUser(input: InviteUserRequestDto) {
    const cleanEmail = input.email.toLowerCase().trim();
    const cleanPrefix = input.salesPrefix.toUpperCase().trim();

    // 1. Kiểm tra trùng Email
    const existingEmail = await this.userRepo.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error(`Email '${cleanEmail}' đã được sử dụng trong hệ thống!`);
    }

    // 2. Kiểm tra trùng Sales Prefix
    const existingPrefix = await this.userRepo.findBySalesPrefix(cleanPrefix);
    if (existingPrefix) {
      throw new Error(`Tiền tố Sales '${cleanPrefix}' đã thuộc về nhân viên (${existingPrefix.fullName}). Vui lòng chọn tiền tố khác!`);
    }

    const userId = 'usr_' + Date.now();
    const now = new Date().toISOString();

    if (input.mode === 'invite') {
      // NHÁNH A: Tạo mã kích hoạt CSPRNG (64 ký tự hex)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const newUser: User = {
        id: userId,
        email: cleanEmail,
        fullName: input.fullName.trim(),
        role: 'SALES',
        salesPrefix: cleanPrefix,
        isActive: false,
        activationToken: token,
        activationExpiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      await this.userRepo.save(newUser);

      // Bắn email kích hoạt qua máy chủ Brevo
      const activationUrl = `${env.frontendUrl}/activate?token=${token}`;
      await this.emailService.sendActivationEmail(newUser.email, newUser.fullName, activationUrl);

      return {
        message: 'Đã gửi email mời kích hoạt tài khoản thành công!',
        user: this.sanitizeUser(newUser),
        activationToken: token, // Phục vụ automation test và hiển thị cho Admin nếu cần
      };
    } else {
      // NHÁNH B: Admin gán mật khẩu trực tiếp
      const plainPassword = input.directPassword || 'Skipli@2026';
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      const newUser: User = {
        id: userId,
        email: cleanEmail,
        fullName: input.fullName.trim(),
        passwordHash,
        role: 'SALES',
        salesPrefix: cleanPrefix,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await this.userRepo.save(newUser);

      // Bắn email thông báo qua Brevo
      await this.emailService.sendDirectAccountEmail(newUser.email, newUser.fullName, plainPassword);

      return {
        message: 'Đã khởi tạo tài khoản và gửi email thông báo thành công!',
        user: this.sanitizeUser(newUser),
      };
    }
  }

  /**
   * 5. SALES KÍCH HOẠT TÀI KHOẢN (Tự đặt Username & Password)
   */
  async activateUser(input: ActivateUserRequestDto) {
    const user = await this.userRepo.findByActivationToken(input.token);
    if (!user) {
      throw new Error('Đường link kích hoạt không hợp lệ hoặc tài khoản đã được kích hoạt trước đó!');
    }

    if (user.activationExpiresAt && new Date() > new Date(user.activationExpiresAt)) {
      throw new Error('Đường link kích hoạt đã hết hạn (quá 24 giờ). Vui lòng liên hệ Admin để nhận link mới!');
    }

    // Kiểm tra trùng username
    const cleanUsername = input.username.toLowerCase().trim();
    const existingUser = await this.userRepo.findByUsername(cleanUsername);
    if (existingUser && existingUser.id !== user.id) {
      throw new Error(`Username '${cleanUsername}' đã có người sử dụng. Vui lòng chọn tên đăng nhập khác!`);
    }

    user.username = cleanUsername;
    user.passwordHash = await bcrypt.hash(input.password, 10);
    user.isActive = true;
    user.activationToken = null;
    user.activationExpiresAt = null;
    user.updatedAt = new Date().toISOString();

    // Tự động cấp cặp token để đăng nhập ngay sau khi kích hoạt
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        salesPrefix: user.salesPrefix,
      },
      env.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 8);
    await this.userRepo.save(user);

    return {
      message: 'Kích hoạt tài khoản thành công! Chào mừng bạn gia nhập Skipli Sales CRM.',
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * 6. LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI (Dành cho Frontend khi F5 trang)
   */
  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('Tài khoản người dùng không tồn tại hoặc đã bị khóa!');
    }
    return this.sanitizeUser(user);
  }

  private hashResetToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * 7. QUÊN MẬT KHẨU - SINH TOKEN NGẮN HẠN (15 PHÚT) & GỬI EMAIL
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const genericMessage =
      'Nếu email tồn tại và đã kích hoạt trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn.';

    const user = await this.userRepo.findByEmail(email);
    // Chống dò email (User Enumeration Defense): không báo lỗi nếu email không tồn tại hoặc chưa kích hoạt
    if (!user || !user.isActive) {
      return { message: genericMessage };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = this.hashResetToken(rawToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
    user.updatedAt = new Date().toISOString();
    await this.userRepo.save(user);

    const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;
    await this.emailService.sendResetPasswordEmail(user.email, user.fullName, resetUrl);

    return { message: genericMessage };
  }

  /**
   * 8. ĐẶT LẠI MẬT KHẨU MỚI - XÁC THỰC TOKEN & HỦY PHIÊN CŨ
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = this.hashResetToken(token.trim());
    const user = await this.userRepo.findByResetPasswordTokenHash(tokenHash);

    if (!user || !user.isActive) {
      throw new Error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng!');
    }

    if (!user.resetPasswordExpiresAt || new Date(user.resetPasswordExpiresAt) <= new Date()) {
      throw new Error('Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút). Vui lòng gửi lại yêu cầu mới!');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    user.refreshTokenHash = null;
    user.previousRefreshTokenHash = null;
    user.previousRefreshTokenExpiresAt = null;
    user.updatedAt = new Date().toISOString();
    await this.userRepo.save(user);

    return {
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    };
  }
}
