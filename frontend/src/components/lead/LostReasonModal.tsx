/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LostReasonModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MINI-MODAL LÝ DO THẤT BẠI LOST)
 * VAI TRÒ: Thu Thập Lý Do Mất Deal Bắt Buộc, Tự Động Xóa Lịch Hẹn & Cập Nhật Thống Kê
 * ==============================================================================
 */

import React, { useState } from 'react';
import { X, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Lead, LOST_REASONS } from '../../types/lead.types';

interface LostReasonModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (lostReason: string) => Promise<void>;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(LOST_REASONS[0]);
  const [customDetail, setCustomDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalReason = customDetail.trim()
      ? `${selectedReason}: ${customDetail.trim()}`
      : selectedReason;

    if (!finalReason) {
      setError('Vui lòng chọn lý do khách hàng từ chối!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
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
        <div className="p-5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-xs">
              <XCircle className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Ghi Nhận Lý Do Thất Bại (LOST)
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
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
              Lý Do Chính Khách Hàng Từ Chối <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 shadow-2xs cursor-pointer"
            >
              {LOST_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chi Tiết Bổ Sung (Tùy Chọn)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder="Ghi chú thêm chi tiết về cuộc gọi từ chối..."
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 shadow-2xs resize-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Dữ liệu này phục vụ ban quản lý phân tích nguyên nhân để cải tiến sản phẩm.
            </p>
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
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <XCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Lưu...' : 'Xác Nhận Đóng Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostReasonModal;
