/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadDetailModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL XEM CHI TIẾT LEAD)
 * VAI TRÒ: Hiển Thị Đầy Đủ Thông Tin Nhà Hàng, Chủ Quán, Lịch Hẹn, Trạng Thái, Doanh Số & Lịch Sử
 * ==============================================================================
 */

import React from 'react';
import {
  X,
  Phone,
  User,
  Smartphone,
  Mail,
  Globe,
  Share2,
  FileText,
  Trophy,
  XCircle,
  Pencil,
  Copy,
  Check,
} from 'lucide-react';
import { Lead, LEAD_STATUS_CONFIG } from '../../types/lead.types';

interface LeadDetailModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  lead,
  onClose,
  onEdit,
}) => {
  const [copiedPhone, setCopiedPhone] = React.useState(false);

  if (!isOpen || !lead) return null;

  const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-[#FAF8F5] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              {lead.state || 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {lead.restaurantName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold">
                  {lead.leadCustomId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lead.address ? `${lead.address}, ` : ''}{lead.city ? `${lead.city}, ` : ''}Bang {lead.state} (USA)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Trạng thái hiện tại & Phụ trách */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Trạng Thái:</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-semibold border bg-white ${statusConfig.textClass} ${statusConfig.borderClass}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="text-slate-400">Phụ trách:</span>
              <span className="font-bold text-slate-800">{lead.assignedName}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                {lead.assignedPrefix}
              </span>
            </div>
          </div>

          {/* Khối Thông Tin Liên Hệ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hotline Quán */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Hotline Nhà Hàng
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-800">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>{lead.hotline}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPhone(lead.hotline)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Sao chép số điện thoại"
                >
                  {copiedPhone ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Chủ Quán */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Chủ Sở Hữu / Quản Lý
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <User className="w-4 h-4 text-amber-600" />
                <span>{lead.ownerName || 'Chưa cập nhật'}</span>
              </div>
              {lead.ownerPhone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.ownerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email & Liên Kết */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5 text-xs">
            {lead.ownerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Email:</span>
                <a href={`mailto:${lead.ownerEmail}`} className="text-sky-600 hover:underline font-medium">
                  {lead.ownerEmail}
                </a>
              </div>
            )}
            {lead.googleMapsUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-500">Google Maps:</span>
                <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium truncate max-w-sm">
                  {lead.googleMapsUrl}
                </a>
              </div>
            )}
            {lead.facebookUrl && (
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-500">Fanpage Facebook:</span>
                <a href={lead.facebookUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline font-medium truncate max-w-sm">
                  {lead.facebookUrl}
                </a>
              </div>
            )}
            {!lead.ownerEmail && !lead.googleMapsUrl && !lead.facebookUrl && (
              <p className="text-slate-400 italic">Chưa có thông tin liên kết mạng xã hội hay email.</p>
            )}
          </div>

          {/* Tiến độ bán hàng: Lịch hẹn & Cuộc gọi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Số Cuộc Gọi</span>
              <span className="text-base font-black text-slate-800">{lead.callCount} cuộc</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Hẹn Gọi Lại</span>
              <span className={`text-xs font-bold ${lead.nextCallDate ? 'text-sky-700' : 'text-slate-400 italic'}`}>
                {lead.nextCallDate || 'Chưa đặt lịch'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Gọi Gần Nhất</span>
              <span className="text-xs font-medium text-slate-700">
                {lead.lastCallDate || 'Chưa gọi'}
              </span>
            </div>
          </div>

          {/* Kết quả WON hoặc LOST nếu có */}
          {lead.status === 'WON' && lead.dealValue > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-800 block">Hợp Đồng Thành Công (WON)</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  ${lead.dealValue.toLocaleString()} USD
                </span>
              </div>
            </div>
          )}

          {lead.status === 'LOST' && lead.lostReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-800 block">Lý Do Thất Bại (LOST)</span>
                <span className="text-xs text-rose-700 font-medium">
                  {lead.lostReason}
                </span>
              </div>
            </div>
          )}

          {/* Ghi chú ban đầu */}
          {lead.latestNote && (
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-700">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Ghi Chú Cuộc Gọi / Đánh Giá:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {lead.latestNote}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ngày tạo: {new Date(lead.createdAt).toLocaleString('vi-VN')}</span>
            <span>Cập nhật: {new Date(lead.updatedAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Pencil className="w-4 h-4" />
              <span>Chỉnh Sửa Thông Tin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
