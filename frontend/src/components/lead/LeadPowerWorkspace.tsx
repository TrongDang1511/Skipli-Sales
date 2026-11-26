/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadPowerWorkspace.tsx
 * PHÂN LOẠI: UI COMPONENT (POWER CALLING WORKSPACE & TIMELINE GHI CHÚ)
 * VAI TRÒ: Hiển Thị Chi Tiết Nhanh, Timeline Chat Bubble & Form Ghi Chú Ctrl+Enter + Optimistic UI
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Copy,
  Check,
  X,
  Send,
  Calendar,
  MapPin,
  Globe,
  Share2,
  Loader2,
  MessageSquare,
  User,
} from 'lucide-react';
import {
  Lead,
  LeadNote,
  LeadStatus,
  CallResultType,
  CALL_RESULT_CONFIG,
  LEAD_STATUS_CONFIG,
} from '../../types/lead.types';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, getLocalDateString } from '@/lib/utils';

interface LeadPowerWorkspaceProps {
  lead: Lead;
  onClose?: () => void;
  onLeadSynced: (updatedLead: Lead) => void;
  variant?: 'panel' | 'drawer';
}

const QUICK_STATUS_OPTIONS: LeadStatus[] = [
  'NEW',
  'CALLING',
  'LOW_INTERESTED',
  'HIGH_INTERESTED',
  'HOT_LEAD',
];

export const LeadPowerWorkspace: React.FC<LeadPowerWorkspaceProps> = ({
  lead,
  onClose,
  onLeadSynced,
  variant = 'panel',
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form ghi chú nhanh
  const [callResult, setCallResult] = useState<CallResultType>('ANSWERED');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);
  const [content, setContent] = useState('');
  const [nextCallDate, setNextCallDate] = useState(lead.nextCallDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timelineEndRef = useRef<HTMLDivElement | null>(null);
  const today = getLocalDateString();

  // Tải Timeline và reset form mỗi khi đổi Lead được chọn
  useEffect(() => {
    let isMounted = true;
    setSelectedStatus(lead.status);
    setNextCallDate(lead.nextCallDate || '');
    setContent('');
    setIsLoadingNotes(true);

    leadApi
      .getLeadNotes(lead.id)
      .then((data) => {
        if (isMounted) setNotes(data);
      })
      .catch((err) => {
        if (isMounted) toast.error(extractApiErrorMessage(err, 'Không tải được lịch sử ghi chú!'));
      })
      .finally(() => {
        if (isMounted) setIsLoadingNotes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lead.id]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes.length]);

  const handleCopyHotline = () => {
    navigator.clipboard.writeText(lead.hotline || lead.cleanPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  // Gửi ghi chú với Optimistic UI (cập nhật tức thì <10ms, rollback nếu API báo lỗi)
  const handleSendNote = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    const optimisticId = `tmp_${Date.now()}`;
    const optimisticNote: LeadNote = {
      id: optimisticId,
      leadId: lead.id,
      authorId: user?.id || '',
      authorName: user?.fullName || 'Tôi',
      authorPrefix: user?.salesPrefix || 'SR',
      callResult,
      content: trimmed,
      nextCallDate: nextCallDate || null,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, optimisticNote]);
    setContent('');
    setIsSubmitting(true);

    try {
      const payload = {
        callResult,
        content: trimmed,
        ...(nextCallDate ? { nextCallDate } : {}),
        ...(selectedStatus !== lead.status ? { status: selectedStatus } : {}),
      };

      const res = await leadApi.createLeadNote(lead.id, payload);
      setNotes((prev) => prev.map((n) => (n.id === optimisticId ? res.note : n)));
      onLeadSynced(res.updatedLead);
    } catch (err: any) {
      // Rollback nếu API báo lỗi validation hoặc RBAC
      setNotes((prev) => prev.filter((n) => n.id !== optimisticId));
      setContent(trimmed);
      toast.error(extractApiErrorMessage(err, 'Lưu ghi chú thất bại!'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConf = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;
  const statusOptions = QUICK_STATUS_OPTIONS.includes(lead.status)
    ? QUICK_STATUS_OPTIONS
    : [lead.status, ...QUICK_STATUS_OPTIONS];

  return (
    <aside
      className={cn(
        'bg-white flex flex-col overflow-hidden',
        variant === 'panel'
          ? 'rounded-3xl border border-slate-200/80 shadow-xs h-[calc(100vh-140px)] sticky top-20'
          : 'h-full'
      )}
    >
      {/* 1. HEADER THÔNG TIN NHÀ HÀNG */}
      <div className="p-4 bg-[#FAF8F5]/80 space-y-3 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white hover:bg-slate-900"
              >
                {lead.leadCustomId}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full text-[10px] font-bold bg-white',
                  statusConf.borderClass,
                  statusConf.textClass
                )}
              >
                {statusConf.label}
              </Badge>
              {lead.assignedName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <User className="w-3 h-3 text-slate-400" />
                  {lead.assignedName}
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-slate-900 truncate pt-0.5">
              {lead.restaurantName}
            </h3>

            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">
                Bang {lead.state}
                {lead.city ? ` • ${lead.city}` : ''}
                {lead.ownerName ? ` • Chủ quán: ${lead.ownerName}` : ''}
              </span>
            </p>
          </div>

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white shrink-0"
              title="Đóng bảng Power Calling"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Hotline 1-Click Copy + Link Maps/FB + Call Count */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyHotline}
            className="h-8 px-3 rounded-xl bg-white border-slate-200 text-xs font-mono font-bold text-slate-800 hover:border-sky-400 hover:bg-sky-50/40 gap-2 shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span>{lead.hotline || lead.cleanPhone}</span>
            {copiedPhone ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-xs">
            {lead.googleMapsUrl && (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-sky-600 transition-colors"
                title="Mở Google Maps"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            {lead.facebookUrl && (
              <a
                href={lead.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-sky-600 transition-colors"
                title="Mở Fanpage Facebook"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
            )}
            <Badge
              variant="secondary"
              className="bg-white border border-slate-200 text-slate-600 font-semibold text-[11px] px-2.5 py-0.5 rounded-lg hover:bg-white"
            >
              Đã gọi: <strong className="ml-1 text-slate-900">{lead.callCount || 0}</strong>
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200/70" />

      {/* 2. THÂN: TIMELINE GHI CHÚ DẠNG CHAT BUBBLE */}
      <ScrollArea className="flex-1 bg-slate-50/40">
        <div className="p-4 space-y-3">
          {isLoadingNotes ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-sky-600 mb-2" />
              Đang tải lịch sử cuộc gọi...
            </div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-1.5">
              <MessageSquare className="w-7 h-7 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">Chưa có ghi chú cuộc gọi nào</p>
              <p className="text-[11px]">
                Nhập nội dung bên dưới và nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">Ctrl + Enter</kbd> để lưu nhanh.
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const resultCfg = CALL_RESULT_CONFIG[note.callResult] || CALL_RESULT_CONFIG.NOTE_ONLY;
              return (
                <div
                  key={note.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {note.authorPrefix}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {note.authorName}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-bold px-2 py-0 rounded-full', resultCfg.badgeClass)}
                      >
                        {resultCfg.label}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(note.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {note.nextCallDate && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3" />
                      <span>Hẹn gọi: {note.nextCallDate}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={timelineEndRef} />
        </div>
      </ScrollArea>

      <Separator className="bg-slate-200/70" />

      {/* 3. ĐÁY: FORM GHI CHÚ NHANH (CTRL + ENTER) */}
      <div className="p-3.5 bg-white space-y-2.5 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Kết quả cuộc gọi */}
          <select
            value={callResult}
            onChange={(e) => setCallResult(e.target.value as CallResultType)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            title="Kết quả cuộc gọi"
          >
            {Object.entries(CALL_RESULT_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Đổi trạng thái nhanh */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            title="Cập nhật trạng thái Lead"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {LEAD_STATUS_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>

          {/* Ngày hẹn gọi lại */}
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1 bg-slate-50">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              min={today}
              value={nextCallDate}
              onChange={(e) => setNextCallDate(e.target.value)}
              className="w-full text-xs bg-transparent text-slate-700 font-medium focus:outline-none"
              title="Hẹn gọi lại"
            />
          </div>
        </div>

        <div className="relative">
          <Textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSendNote();
              }
            }}
            placeholder="Ghi chú kết quả cuộc gọi... (Ctrl + Enter để gửi)"
            className="min-h-[68px] pr-12 rounded-2xl border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-sky-500 text-xs text-slate-800 resize-none"
          />
          <Button
            type="button"
            size="icon"
            disabled={!content.trim() || isSubmitting}
            onClick={handleSendNote}
            className="absolute right-2 bottom-2 h-8 w-8 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
            title="Lưu ghi chú (Ctrl + Enter)"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};
