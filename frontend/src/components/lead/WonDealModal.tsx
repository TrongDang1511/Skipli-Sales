/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/WonDealModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MINI-MODAL CHỐT HỢP ĐỒNG WON)
 * VAI TRÒ: Thu Thập Giá Trị Hợp Đồng ($) Bắt Buộc Khi Chốt Deal, Tự Động Xóa Lịch Hẹn
 * ==============================================================================
 */

import React, { useState } from 'react';
import { X, Trophy, DollarSign, Sparkles, AlertCircle } from 'lucide-react';
import { Lead } from '../../types/lead.types';

interface WonDealModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (dealValue: number) => Promise<void>;
}

export const WonDealModal: React.FC<WonDealModalProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  const [dealValue, setDealValue] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericValue = parseFloat(dealValue.replace(/,/g, ''));
    if (isNaN(numericValue) || numericValue <= 0) {
      setError('Vui lòng nhập giá trị hợp đồng hợp lệ (lớn hơn $0)!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(numericValue);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Chốt Hợp Đồng Thành Công
              </h3>
              <p className="text-xs text-emerald-700 font-medium truncate max-w-[240px]">
                {lead.restaurantName} ({lead.leadCustomId})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Giá Trị Hợp Đồng Chốt (USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                step="any"
                autoFocus
                required
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="500"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-black font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Số tiền này sẽ tự động được cộng dồn vào Thẻ Doanh Số (KPI) trên Dashboard.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý:</strong> Khi chuyển sang trạng thái <strong>WON</strong>, lịch hẹn gọi lại tiếp theo sẽ tự động được xóa bỏ vì deal đã được chốt thành công!
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Trophy className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Lưu...' : 'Xác Nhận Chốt Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WonDealModal;
