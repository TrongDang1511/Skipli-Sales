/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadEditModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL CHỈNH SỬA LEAD)
 * VAI TRÒ: Cập Nhật Thông Tin Nhà Hàng, Chủ Quán, SĐT, Ngày Hẹn, Ghi Chú Với Ràng Buộc Kiểm Tra Trùng
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  X,
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
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { Lead, UpdateLeadInput, US_STATES } from '../../types/lead.types';
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
  const today = new Date().toISOString().slice(0, 10);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Nạp dữ liệu cũ của lead khi modal mở ra
  useEffect(() => {
    if (lead) {
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
      setFormError('');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!restaurantName.trim()) {
      setFormError('Vui lòng nhập tên nhà hàng!');
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
      };

      const res = await leadApi.updateLead(lead.id, updates);
      toast.success(res.message || 'Cập nhật thông tin nhà hàng thành công!');

      if (onLeadUpdated && res.lead) {
        onLeadUpdated(res.lead);
      }
      onClose();
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Cập nhật thất bại!');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-scale-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#FAF8F5] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Chỉnh Sửa Thông Tin Nhà Hàng
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold">
                  {lead.leadCustomId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật thông tin định danh, liên hệ và lịch hẹn bám đuổi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="edit-lead-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tên quán */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Nhà Hàng / Quán Ăn <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Bang & Thành phố */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bang <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Thành Phố</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="VD: Westminster"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Địa chỉ quán */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Quán</label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 9941 Bolsa Ave"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Hotline & SĐT Chủ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hotline Nhà Hàng <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(formatUsPhoneNumber(e.target.value))}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SĐT Di Động Chủ</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(formatUsPhoneNumber(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Tên chủ & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Chủ Quán</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Chủ Quán</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Links: Google Maps & Facebook */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Google Maps</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Facebook</label>
              <div className="relative">
                <Share2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Hẹn gọi lại */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hạn Chót Hẹn Gọi Lại (Next Call Date ≥ Hôm Nay)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                min={today}
                value={nextCallDate}
                onChange={(e) => setNextCallDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú Cuộc Gọi / Đánh Giá</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={latestNote}
                onChange={(e) => setLatestNote(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Hủy
          </button>

          <button
            type="submit"
            form="edit-lead-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadEditModal;
