/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadDetailModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL XEM CHI TIẾT LEAD - SHADCN/UI)
 * VAI TRÒ: Hiển Thị Đầy Đủ Toàn Bộ Các Trường Dữ Liệu Lead Trong Database Cho Sales & Admin
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  Phone,
  User,
  Smartphone,
  Mail,
  Globe,
  Share2,
  FileText,
  Sparkles,
  Trophy,
  XCircle,
  Pencil,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Hash,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Lead, LEAD_STATUS_CONFIG } from '../../types/lead.types';

interface LeadDetailModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
}

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return 'Chưa có';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN');
};

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  lead,
  onClose,
  onEdit,
}) => {
  const [copiedKey, setCopiedKey] = useState<'hotline' | 'ownerPhone' | 'id' | null>(null);

  if (!lead) return null;

  const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;

  const handleCopy = (value: string, key: 'hotline' | 'ownerPhone' | 'id') => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderEmpty = (text = 'Chưa cập nhật') => (
    <span className="text-slate-400 italic font-normal">{text}</span>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border-slate-200 bg-white gap-0">
        {/* 1. HEADER */}
        <DialogHeader className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-200/80 text-left">
          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              {lead.state || 'US'}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                  {lead.restaurantName}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-900 px-2 py-0.5 rounded-md"
                >
                  {lead.leadCustomId}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold bg-white ${statusConfig.textClass} ${statusConfig.borderClass}`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {lead.address || 'Chưa có địa chỉ'} • {lead.city || 'Chưa có thành phố'} • Bang {lead.state || '—'} (USA)
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2. BODY (SCROLLABLE - HIỂN THỊ ĐẦY ĐỦ TẤT CẢ TRƯỜNG DB) */}
        <ScrollArea className="max-h-[68vh]">
          <div className="p-6 space-y-5 text-xs">
            {/* NHÓM A: TRẠNG THÁI & PHÂN CÔNG */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5]/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Trạng Thái Phễu
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`bg-white font-bold ${statusConfig.textClass} ${statusConfig.borderClass}`}
                  >
                    {statusConfig.label}
                  </Badge>
                  <span className="text-[11px] text-slate-500">{statusConfig.description}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sales Phụ Trách
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-bold text-slate-800">
                    {lead.assignedName || 'Chưa phân công'}
                  </span>
                  {lead.assignedPrefix && (
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800 font-mono text-[10px]">
                      {lead.assignedPrefix}
                    </Badge>
                  )}
                  {lead.assignedTo && (
                    <span className="text-[10px] font-mono text-slate-400">
                      (UID: {lead.assignedTo})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* NHÓM B: ĐỊA CHỈ & LIÊN HỆ NHÀ HÀNG */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Thông Tin Nhà Hàng & Địa Chỉ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Hotline Chính Nhà Hàng
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-900">
                      <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{lead.hotline || '—'}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(lead.hotline, 'hotline')}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
                      title="Sao chép Hotline"
                    >
                      {copiedKey === 'hotline' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    SĐT chuẩn hóa (10 số): <strong className="text-slate-700">{lead.cleanPhone || '—'}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Vị Trí Chi Tiết
                  </span>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400">Địa chỉ: </span>
                      <span className="font-semibold text-slate-800">
                        {lead.address || renderEmpty()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span>
                        <span className="text-slate-400">Thành phố: </span>
                        <span className="font-semibold text-slate-800">
                          {lead.city || renderEmpty()}
                        </span>
                      </span>
                      <span>
                        <span className="text-slate-400">Bang: </span>
                        <span className="font-mono font-bold text-slate-800">{lead.state || '—'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NHÓM C: CHỦ SỞ HỮU & KÊNH LIÊN KẾT */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Chủ Quán & Kênh Liên Kết
              </h4>
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Tên Chủ Quán / Quản Lý
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{lead.ownerName || renderEmpty()}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      SĐT Riêng Chủ Quán
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.ownerPhone || renderEmpty()}</span>
                        {lead.cleanOwnerPhone && (
                          <span className="text-[10px] text-slate-400">({lead.cleanOwnerPhone})</span>
                        )}
                      </div>
                      {lead.ownerPhone && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(lead.ownerPhone, 'ownerPhone')}
                          className="h-6 w-6 rounded-md text-slate-400 hover:text-slate-700"
                          title="Sao chép SĐT chủ quán"
                        >
                          {copiedKey === 'ownerPhone' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Email liên hệ:</span>
                    {lead.ownerEmail ? (
                      <a
                        href={`mailto:${lead.ownerEmail}`}
                        className="text-sky-600 hover:underline font-medium truncate"
                      >
                        {lead.ownerEmail}
                      </a>
                    ) : (
                      renderEmpty()
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Google Maps:</span>
                    {lead.googleMapsUrl ? (
                      <a
                        href={lead.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-1 truncate max-w-md"
                      >
                        <span className="truncate">{lead.googleMapsUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      renderEmpty()
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Facebook:</span>
                    {lead.facebookUrl ? (
                      <a
                        href={lead.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline font-medium inline-flex items-center gap-1 truncate max-w-md"
                      >
                        <span className="truncate">{lead.facebookUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      renderEmpty()
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* NHÓM D: TIẾN ĐỘ BÁN HÀNG & KẾT QUẢ DEAL */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tiến Độ Gọi Điện & Kết Quả Deal
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Số Cuộc Gọi</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {lead.callCount ?? 0} cuộc
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Hẹn Gọi Lại
                  </span>
                  <span
                    className={`text-xs font-bold mt-1 block font-mono ${
                      lead.nextCallDate ? 'text-sky-700' : 'text-slate-400 italic font-sans font-normal'
                    }`}
                  >
                    {lead.nextCallDate || 'Chưa đặt lịch'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Gọi Gần Nhất
                  </span>
                  <span className="text-xs font-semibold text-slate-700 mt-1 block font-mono">
                    {lead.lastCallDate || 'Chưa gọi'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-600" /> Giá Trị Deal
                  </span>
                  <span
                    className={`text-xs font-black mt-1 block font-mono ${
                      lead.dealValue > 0 ? 'text-emerald-700' : 'text-slate-400 font-sans font-normal'
                    }`}
                  >
                    {lead.dealValue > 0 ? `$${lead.dealValue.toLocaleString()} USD` : '$0'}
                  </span>
                </div>
              </div>

              {(lead.status === 'LOST' || lead.lostReason) && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-rose-800 block">
                      Lý Do Thất Bại (LOST)
                    </span>
                    <span className="text-xs text-rose-700">
                      {lead.lostReason || 'Chưa ghi nhận lý do'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* NHÓM E: GHI CHÚ GẦN NHẤT & ĐÁNH GIÁ AI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ghi Chú Mới Nhất</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap min-h-[52px]">
                  {lead.latestNote || renderEmpty('Chưa có ghi chú nào')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nhận Xét / Đánh Giá AI</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/70 whitespace-pre-wrap min-h-[52px]">
                  {lead.aiEvaluation || renderEmpty('Chưa có đánh giá AI')}
                </p>
              </div>
            </div>

            {/* NHÓM F: DẤU THỜI GIAN & SYSTEM ID */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Hash className="w-3 h-3 text-slate-400" />
                  Document ID: <strong className="text-slate-700">{lead.id}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(lead.id, 'id')}
                  className="text-[10px] font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  {copiedKey === 'id' ? 'Đã copy ID' : 'Copy ID'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60">
                <span>Tạo lúc: <strong className="text-slate-700">{formatDateTime(lead.createdAt)}</strong></span>
                <span>Cập nhật: <strong className="text-slate-700">{formatDateTime(lead.updatedAt)}</strong></span>
                <span>Đổi trạng thái: <strong className="text-slate-700">{formatDateTime(lead.statusUpdatedAt)}</strong></span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="bg-slate-200/80" />

        {/* 3. FOOTER */}
        <DialogFooter className="px-6 py-3.5 bg-[#FAF8F5]/70 flex items-center justify-between sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
            Đóng
          </Button>

          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Chỉnh Sửa Thông Tin</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;
