import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  sideImageSrc?: string;
}

const FALLBACK_HERO_IMAGE = '/crm-team.jpg';

const AMBIENT_ORBS = [
  {
    className: 'skipli-orb-1 -top-40 -left-40 w-[520px] h-[520px] bg-sky-400/20',
  },
  {
    className: 'skipli-orb-2 -bottom-48 -right-48 w-[580px] h-[580px] bg-sky-600/25',
  },
  {
    className: 'skipli-orb-3 top-1/2 left-1/3 w-[420px] h-[420px] bg-cyan-400/15',
  },
] as const;

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  sideImageSrc = '/login-hero.png',
}) => {
  const [imgSrc, setImgSrc] = useState(sideImageSrc);

  return (
    <div className="skipli-auth-bg relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden font-sans selection:bg-sky-200">
      {/* Các dải sáng chuyển động mượt theo vòng lặp xoay quanh bảng màu Skipli */}
      {AMBIENT_ORBS.map((orb, index) => (
        <div
          key={index}
          className={`absolute rounded-full blur-3xl pointer-events-none ${orb.className}`}
        />
      ))}

      {/* Lưới chấm công nghệ nhịp thở nhẹ */}
      <div className="skipli-dot-grid absolute inset-0 pointer-events-none" />

      {/* Watermark logo Skipli chìm */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <img
          src="/Skipli_logo_white.png"
          alt=""
          className="w-[900px] max-w-none object-contain opacity-[0.035] -rotate-6"
        />
      </div>

      {/* Khung trung tâm kiểu Shadcn login-04 */}
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl flex flex-col gap-5">
        <Card className="overflow-hidden p-0 rounded-3xl border border-white/15 bg-white shadow-2xl shadow-black/40">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Cột trái: Form đăng nhập / kích hoạt / khôi phục mật khẩu */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
              <div className="flex items-center justify-center gap-2 mb-6 select-none">
                <img
                  src="/Skipli_logo_blue.png"
                  alt="Skipli Sales Logo"
                  className="h-7 w-auto object-contain shrink-0"
                />
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  SKIPLI <span className="text-sky-600">SALES</span>
                </span>
              </div>

              <div className="w-full my-auto">{children}</div>

              <p className="text-center text-[11px] text-slate-400 mt-6">
                Hệ thống CRM nội bộ dành cho đội ngũ Skipli Sales
              </p>
            </div>

            {/* Cột phải: Khung hình ảnh thương hiệu */}
            <div className="relative hidden md:block bg-[#0B274D] min-h-[520px]">
              <img
                src={imgSrc}
                alt="Skipli Sales Workspace"
                onError={() => {
                  if (imgSrc !== FALLBACK_HERO_IMAGE) setImgSrc(FALLBACK_HERO_IMAGE);
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071E3D]/70 via-transparent to-[#071E3D]/15 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
                  AI-Powered CRM
                </span>
                <p className="text-sm font-semibold leading-snug text-white/95">
                  Quản lý Leads nhà hàng, lịch hẹn gọi lại và hiệu suất chốt deal tập trung.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="px-6 text-center text-xs text-slate-300/75">
          Copyright © 2026 - Skipli Sales CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
