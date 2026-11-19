import React from 'react';
import { Sparkles, PhoneCall, CheckCircle2, TrendingUp } from 'lucide-react';

interface BrandShowcaseProps {
  heroTitle?: string;
  heroSubtitle?: string;
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = () => {
  return (
    <div className="w-full max-w-lg bg-white/[0.12] backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl text-white relative z-10 flex flex-col justify-between space-y-8 min-h-[580px]">
      {/* 1. Headline Lớn Căn Trái (Theo phong cách Hình 1) */}
      <div className="space-y-3 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-sky-200 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Hạ Tầng Tăng Tốc Doanh Thu B2B</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black leading-tight tracking-tight text-white">
          Trợ Lý AI Gọi Điện & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-100 to-amber-200">
            Quản Lý Khách Hàng Thông Minh
          </span>
        </h1>
      </div>

      {/* 2. Hình Minh Họa Hệ Thống CRM (Mô phỏng CRM Live Sheet & AI Voice Calling) */}
      <div className="my-auto relative">
        {/* Khung Bảng Sheet Dữ Liệu CRM Kính Mờ */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-xl overflow-hidden space-y-3 text-xs">
          {/* Topbar mini của Sheet CRM */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-[11px] tracking-wide">
                Bảng Leads Nhà Hàng (CRM Live Sheet)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 text-[10px] font-semibold border border-sky-400/30">
              86 Leads Mới
            </span>
          </div>

          {/* Dòng 1: Nhà hàng Phở 79 - Đã chốt hẹn */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-white truncate text-[11px]">Phở 79 • Westminster, CA</div>
              <div className="text-[10px] text-slate-300 truncate">Chủ quán: Mr. Hùng Nguyễn</div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[10px] shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Chốt Hẹn Demo
            </span>
          </div>

          {/* Dòng 2: Golden Lotus Nail Spa - AI Voice Bot đang gọi */}
          <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-white truncate text-[11px]">Golden Lotus Spa • Garden Grove</div>
              <div className="text-[10px] text-sky-200 flex items-center gap-1.5 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-2.5 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-3.5 bg-sky-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>AI Cold-Calling (01:24)</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/30 font-semibold text-[10px] shrink-0">
              <PhoneCall className="w-3 h-3 text-amber-300 animate-pulse" />
              Đang Đàm Phán
            </span>
          </div>

          {/* Dòng 3: Tokyo Sushi Garden */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-white truncate text-[11px]">Tokyo Sushi Garden • San Jose</div>
              <div className="text-[10px] text-slate-300 truncate">Quan tâm gói POS & Marketing</div>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-medium text-[10px] shrink-0">
              Sẵn Sàng Ký
            </span>
          </div>
        </div>

        {/* Floating Mini Badge Thống Kê Hiệu Suất */}
        <div className="absolute -bottom-4 -right-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-xl shadow-sky-950/40 border border-white/25 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-200 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] font-semibold text-sky-100">Tỷ Lệ Bắt Máy & Chốt Hẹn</div>
            <div className="text-xs font-black text-white">+320% Tăng Trưởng</div>
          </div>
        </div>
      </div>

      {/* 3. Đoạn Mô Tả Ngắn Gọn Dưới Cùng (Theo đúng nội dung Skipli Sales) */}
      <div className="pt-4 border-t border-white/15 text-left">
        <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-normal">
          Tự động hóa 80% thời gian tiếp cận ban đầu, lọc đúng chủ nhà hàng đang có nhu cầu chốt hợp đồng.
        </p>
      </div>
    </div>
  );
};

export default BrandShowcase;
