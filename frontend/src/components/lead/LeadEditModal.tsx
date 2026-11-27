/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadEditModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL CHỈNH SỬA LEAD - SHADCN/UI)
 * VAI TRÒ: Cập Nhật Đầy Đủ Thông Tin Nhà Hàng, Chủ Quán, SĐT, Liên Kết, Đánh Giá AI & Lịch Hẹn
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  User,
  Smartphone,
  Navigation,
  Mail,
  Globe,
  Share2,
  Calendar,
  FileText,
  Sparkles,
  Trophy,
  XCircle,
  AlertCircle,
  Save,
  Loader2,
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
import { Textarea } from '@/components/ui/textarea';
import { getLocalDateString } from '@/lib/utils';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { Lead, UpdateLeadInput, US_STATES, LOST_REASONS } from '../../types/lead.types';
import { useToast } from '../../contexts/ToastContext';
import { formatUsPhoneNumber } from './QuickAddLeadModal';

interface LeadEditModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated?: (lead: Lead) => void;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  isOpen,
  lead,
  onClose,
  onLeadUpdated,
}) => {
  const toast = useToast();
  const today = getLocalDateString();

  const [restaurantName, setRestaurantName] = useState('');
  const [state, setState] = useState('VA');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [nextCallDate, setNextCallDate] = useState('');
  const [latestNote, setLatestNote] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [dealValue, setDealValue] = useState('0');
  const [lostReason, setLostReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (lead && isOpen) {
      setRestaurantName(lead.restaurantName || '');
      setState(lead.state || 'VA');
      setCity(lead.city || '');
      setAddress(lead.address || '');
      setHotline(lead.hotline || '');
      setOwnerName(lead.ownerName || '');
      setOwnerPhone(lead.ownerPhone || '');
      setOwnerEmail(lead.ownerEmail || '');
      setGoogleMapsUrl(lead.googleMapsUrl || '');
      setFacebookUrl(lead.facebookUrl || '');
      setNextCallDate(lead.nextCallDate || '');
      setLatestNote(lead.latestNote || '');
      setAiEvaluation(lead.aiEvaluation || '');
      setDealValue(String(lead.dealValue ?? 0));
      setLostReason(lead.lostReason || '');
      setFormError('');
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!restaurantName.trim() || restaurantName.trim().length < 2) {
      setFormError('Vui lòng nhập tên nhà hàng (ít nhất 2 ký tự)!');
      return;
    }

    const cleanHotline = hotline.replace(/\D/g, '');
    if (cleanHotline.length < 10) {
      setFormError('Hotline nhà hàng phải có đủ ít nhất 10 số!');
      return;
    }

    if (nextCallDate && nextCallDate < today) {
      setFormError('Ngày hẹn gọi lại không được nằm trong quá khứ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: UpdateLeadInput = {
        restaurantName: restaurantName.trim(),
        state: state.toUpperCase().trim(),
        hotline: hotline.trim(),
        city: city.trim(),
        address: address.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerEmail: ownerEmail.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        nextCallDate: nextCallDate ? nextCallDate.trim() : null,
        latestNote: latestNote.trim(),
        aiEvaluation: aiEvaluation.trim(),
        ...(lead.status === 'WON' ? { dealValue: Number(dealValue) || 0 } : {}),
        ...(lead.status === 'LOST' ? { lostReason: lostReason.trim() } : {}),
      };

      const res = await leadApi.updateLead(lead.id, updates);
      toast.success(res.message || 'Cập nhật thông tin nhà hàng thành công!');
      onLeadUpdated?.(res.lead);
      onClose();
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Cập nhật thất bại!');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border-slate-200 bg-white gap-0">
        {/* 1. HEADER */}
        <DialogHeader className="px-6 py-4 bg-[#FAF8F5] border-b border-slate-200/80 text-left">
          <div className="flex items-center gap-3 pr-6">
            <div className="w-10 h-10 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center shadow-xs shrink-0">
              <Store className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
                  Chỉnh Sửa Thông Tin Nhà Hàng
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-900 px-2 py-0.5 rounded-md"
                >
                  {lead.leadCustomId}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin định danh, liên hệ, liên kết mạng xã hội và đánh giá
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2. FORM BODY */}
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[68vh]">
            <div className="p-6 space-y-5 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nhóm 1: Định danh & Vị trí */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Thông Tin Định Danh & Vị Trí
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Nhà Hàng / Quán Ăn <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="VD: Pho Saigon 168"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bang <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`${inputClass} cursor-pointer font-bold`}
                      >
                        {US_STATES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.code} - {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Thành Phố</label>
                    <div className="relative">
                      <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="VD: San Jose"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Quán</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Nhóm 2: Liên hệ & Chủ quán */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Liên Hệ Nhà Hàng & Chủ Quán
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Hotline Nhà Hàng <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={hotline}
                        onChange={(e) => setHotline(formatUsPhoneNumber(e.target.value))}
                        placeholder="(408) 555-0199"
                        className={`${inputClass} font-mono font-bold`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SĐT Di Động Chủ</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(formatUsPhoneNumber(e.target.value))}
                        placeholder="(408) 555-0188"
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên Chủ Quán</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Tên chủ quán / quản lý"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Chủ Quán</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@restaurant.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Link Google Maps</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Link Facebook</label>
                    <div className="relative">
                      <Share2 className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Nhóm 3: Lịch hẹn, Kết quả Deal & Ghi chú */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lịch Hẹn, Ghi Chú & Đánh Giá
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Hạn Chót Hẹn Gọi Lại (Next Call Date ≥ Hôm Nay)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        min={today}
                        value={nextCallDate}
                        onChange={(e) => setNextCallDate(e.target.value)}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>

                  {lead.status === 'WON' && (
                    <div>
                      <label className="block font-bold text-emerald-700 mb-1">
                        Giá Trị Hợp Đồng (USD)
                      </label>
                      <div className="relative">
                        <Trophy className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={0}
                          value={dealValue}
                          onChange={(e) => setDealValue(e.target.value)}
                          className={`${inputClass} font-mono font-bold text-emerald-700`}
                        />
                      </div>
                    </div>
                  )}

                  {lead.status === 'LOST' && (
                    <div>
                      <label className="block font-bold text-rose-700 mb-1">
                        Lý Do Thất Bại (LOST)
                      </label>
                      <div className="relative">
                        <XCircle className="w-4 h-4 text-rose-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={lostReason}
                          onChange={(e) => setLostReason(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="">-- Chọn lý do --</option>
                          {LOST_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Ghi Chú Mới Nhất</span>
                    </label>
                    <Textarea
                      rows={3}
                      value={latestNote}
                      onChange={(e) => setLatestNote(e.target.value)}
                      placeholder="Tóm tắt tình trạng hoặc trao đổi gần nhất..."
                      className="rounded-2xl border-slate-200 bg-slate-50 focus-visible:bg-white text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Nhận Xét / Đánh Giá AI</span>
                    </label>
                    <Textarea
                      rows={3}
                      value={aiEvaluation}
                      onChange={(e) => setAiEvaluation(e.target.value)}
                      placeholder="Đánh giá tiềm năng hoặc gợi ý từ AI..."
                      className="rounded-2xl border-slate-200 bg-indigo-50/30 focus-visible:bg-white text-xs resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <Separator className="bg-slate-200/80" />

          {/* 3. FOOTER */}
          <DialogFooter className="px-6 py-3.5 bg-[#FAF8F5]/70 flex items-center justify-between sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditModal;
