/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/services/email.service.ts
 * VAI TRÒ: Gửi email tự động qua Brevo SMTP (Mời kích hoạt & Cấp tài khoản trực tiếp)
 * ==============================================================================
 */

import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.config';

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Khởi tạo kết nối SMTP Brevo nếu có cấu hình tài khoản
    if (env.smtpUser && env.smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass,
        },
      });
      this.isConfigured = true;
    } else {
      console.warn('⚠️ SMTP chưa được cấu hình đầy đủ. EmailService sẽ chạy ở chế độ MOCK (in link ra terminal).');
    }
  }

  /**
   * 1. Gửi email chứa link kích hoạt tài khoản (Nhánh A: Onboarding mời Sales tự đặt mật khẩu)
   * Link dẫn tới: http://localhost:5173/activate?token=...
   */
  async sendActivationEmail(to: string, name: string, activationUrl: string): Promise<void> {
    if (!this.transporter || !this.isConfigured) {
      console.log(`\n======================================================`);
      console.log(`📨 [MOCK EMAIL CONSOLE] Gửi link kích hoạt tới: ${to}`);
      console.log(`👤 Tên nhân viên: ${name}`);
      console.log(`👉 Link kích hoạt: ${activationUrl}`);
      console.log(`======================================================\n`);
      return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px; letter-spacing: 0.5px;">SKIPLI SALES INTERNAL</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Hệ Thống Quản Lý Bán Hàng Nội Bộ Cho Đội Ngũ Sales</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px; margin-bottom: 12px;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Sếp Sheryl vừa tạo tài khoản nhân viên mới cho bạn trên hệ thống CRM của Skipli. Vui lòng nhấn vào nút bên dưới để tự thiết lập Tên đăng nhập (Username) và Mật khẩu cá nhân của bạn:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">
              🚀 Kích Hoạt Tài Khoản Ngay
            </a>
          </div>
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
              ⏱️ <strong>Lưu ý:</strong> Đường link kích hoạt này có hiệu lực trong vòng <strong>24 giờ</strong>.<br/>
              Nếu không nhấn được nút trên, bạn vui lòng copy và dán trực tiếp đường link sau vào trình duyệt:<br/>
              <a href="${activationUrl}" style="color: #0284c7; word-break: break-all;">${activationUrl}</a>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Skipli Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.emailFrom,
      to,
      subject: '[Skipli Sales] Lời mời kích hoạt tài khoản nhân viên của bạn',
      html,
    });
  }

  /**
   * 2. Gửi email thông báo tài khoản gán sẵn (Nhánh B: Admin tạo trực tiếp username & password)
   */
  async sendDirectAccountEmail(to: string, name: string, password: string): Promise<void> {
    if (!this.transporter || !this.isConfigured) {
      console.log(`\n======================================================`);
      console.log(`📨 [MOCK EMAIL CONSOLE] Gửi thông tin tài khoản trực tiếp tới: ${to}`);
      console.log(`👤 Tên nhân viên: ${name} | Mật khẩu: ${password}`);
      console.log(`👉 Link đăng nhập: ${env.frontendUrl}/login`);
      console.log(`======================================================\n`);
      return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px;">SKIPLI SALES INTERNAL</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Thông Tin Tài Khoản Nhân Viên Mới</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Tài khoản nhân viên của bạn trên hệ thống Skipli Sales CRM đã được Admin khởi tạo thành công với thông tin như sau:
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 6px 0; color: #334155; font-size: 14px;"><strong>Email đăng nhập:</strong> <span style="color: #0284c7;">${to}</span></p>
            <p style="margin: 6px 0; color: #334155; font-size: 14px;"><strong>Mật khẩu ban đầu:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; color: #0f172a;">${password}</code></p>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Bạn có thể đăng nhập ngay vào hệ thống tại đường dẫn bên dưới:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${env.frontendUrl}/login" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              🔐 Đăng Nhập CRM Ngay
            </a>
          </div>
          <p style="color: #ef4444; font-size: 12px; margin-top: 20px;">
            ⚠️ <em>Khuyến nghị: Bạn nên đổi lại mật khẩu cá nhân ngay sau lần đăng nhập đầu tiên để đảm bảo tính an toàn.</em>
          </p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.emailFrom,
      to,
      subject: '[Skipli Sales] Thông tin tài khoản nhân viên của bạn',
      html,
    });
  }

  /**
   * 3. Gửi email chứa link đặt lại mật khẩu (hiệu lực 15 phút)
   */
  async sendResetPasswordEmail(to: string, name: string, resetUrl: string): Promise<void> {
    if (!this.transporter || !this.isConfigured) {
      console.log(`\n======================================================`);
      console.log(`📨 [MOCK EMAIL CONSOLE] Đặt lại mật khẩu cho: ${to}`);
      console.log(`👤 Tên nhân viên: ${name}`);
      console.log(`👉 Link đặt lại mật khẩu: ${resetUrl}`);
      console.log(`======================================================\n`);
      return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px; letter-spacing: 0.5px;">SKIPLI SALES INTERNAL</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Yêu Cầu Đặt Lại Mật Khẩu</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px; margin-bottom: 12px;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản Skipli Sales CRM của bạn. Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">
              🔑 Đặt Lại Mật Khẩu Mới
            </a>
          </div>
          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
            <p style="color: #9a3412; font-size: 12px; margin: 0; line-height: 1.5;">
              ⏱️ <strong>Lưu ý:</strong> Đường link này chỉ có hiệu lực trong vòng <strong>15 phút</strong> và chỉ dùng được 1 lần.<br/>
              Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.<br/>
              <a href="${resetUrl}" style="color: #0284c7; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Skipli Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.emailFrom,
      to,
      subject: '[Skipli Sales] Đặt lại mật khẩu tài khoản của bạn',
      html,
    });
  }
}
