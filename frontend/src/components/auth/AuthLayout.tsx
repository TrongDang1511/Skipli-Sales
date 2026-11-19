import React from 'react';
import BrandShowcase from './BrandShowcase';

interface AuthLayoutProps {
  children: React.ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, heroTitle, heroSubtitle }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-800 font-sans selection:bg-sky-200">
      {/* ========================================================================= */}
      {/* CỘT TRÁI (46–48%): Deep Navy Luxury với Logo Skipli Khổng Lồ Nền          */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[46%] relative bg-[#071E3D] p-6 sm:p-10 lg:p-12 flex items-center justify-center overflow-hidden min-h-[520px] lg:min-h-screen">
        {/* LOGO SKIPLI KHỔNG LỒ LÀM NỀN (Cỡ Background, Thay Thế Gradient) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <img
            src="/Skipli_logo_blue.png"
            alt=""
            className="w-[130%] max-w-[760px] object-contain opacity-[0.12] filter blur-[0.5px] scale-110 -rotate-3 transition-transform duration-1000"
          />
        </div>

        {/* Vệt sáng cyber công nghệ dịu nhẹ */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lưới chấm mờ công nghệ */}
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Thẻ Kính Mờ (Glassmorphism Frosted Card) Nổi Bật Trên Nền Logo Khổng Lồ */}
        <BrandShowcase heroTitle={heroTitle} heroSubtitle={heroSubtitle} />
      </div>

      {/* ========================================================================= */}
      {/* CỘT PHẢI (52–54%): Form Trải Thoáng Trên Nền Trắng, Logo Không Nền       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[52%] xl:w-[54%] bg-white flex flex-col justify-between min-h-screen px-6 py-8 sm:px-12 sm:py-12 lg:px-20 lg:py-14">
        {/* 1. Header Trên Cùng: Logo Skipli (Bỏ khung nền, chỉ giữ logo đứng độc lập) */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2.5 mb-1.5 select-none">
            <img
              src="/Skipli_logo_blue.png"
              alt="Skipli Sales Logo"
              className="h-8 w-auto object-contain shrink-0"
            />
            <span className="text-xl font-black text-slate-900 tracking-tight">
              SKIPLI <span className="text-sky-600 font-extrabold">SALES</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            AI-Powered CRM System
          </span>
        </div>

        {/* 2. Nội Dung Form (Trực Tiếp Trên Nền Trắng, Không Có Viền Card Bao Quanh) */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {children}
        </div>

        {/* 3. Chân Trang: Dòng Bản Quyền Copyright */}
        <div className="text-center text-xs text-slate-400 pt-6">
          Copyright © 2026 - Skipli Sales CRM. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
