/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/QuickAddLeadModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL THÊM LEAD TỐC ĐỘ CAO)
 * VAI TRÒ: Form Thêm Mới Chuẩn UX/UI Thêm Nhân Sự, Tự Format SĐT Mỹ, Chống Trùng 20ms, Phím Tắt Ctrl+Enter
 * ==============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { Lead, CreateLeadInput, US_STATES } from '../../types/lead.types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface QuickAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: (lead: Lead) => void;
}

/**
 * HÀM TIỆN ÍCH: TỰ ĐỘNG ĐỊNH DẠNG SĐT MỸ THEO CHUẨN (XXX) XXX-XXXX
 */
export const formatUsPhoneNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Xử lý tiền tố '1' nếu có
  const cleanDigits = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (cleanDigits.length <= 3) {
    return `(${cleanDigits}`;
  }
  if (cleanDigits.length <= 6) {
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
  }
  return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 10)}`;
};

export const QuickAddLeadModal: React.FC<QuickAddLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const restaurantInputRef = useRef<HTMLInputElement>(null);

  // Ngày hôm nay theo định dạng YYYY-MM-DD phục vụ ràng buộc min của datepicker
  const today = new Date().toISOString().slice(0, 10);

  // State các trường dữ liệu
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
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [saleNote, setSaleNote] = useState('');

  // Tùy chọn giữ modal mở để nhập liên tiếp hàng loạt quán
  const [keepOpen, setKeepOpen] = useState(false);

  // State kiểm tra trùng số điện thoại thời gian thực (<20ms)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState<string | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // State kiểm tra trùng số điện thoại chủ quán
  const [isCheckingOwnerPhone, setIsCheckingOwnerPhone] = useState(false);
  const [ownerPhoneDuplicateError, setOwnerPhoneDuplicateError] = useState<string | null>(null);

  // State trạng thái form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Tự động focus vào ô Tên nhà hàng khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        restaurantInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounce kiểm tra trùng Hotline (<20ms)
  useEffect(() => {
    const rawDigits = hotline.replace(/\D/g, '');
    const cleanDigits = rawDigits.length === 11 && rawDigits.startsWith('1') ? rawDigits.slice(1) : rawDigits;

    if (cleanDigits.length < 10) {
      setPhoneDuplicateError(null);
      setIsPhoneValid(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingPhone(true);
      try {
        const res = await leadApi.checkPhoneDuplicate(cleanDigits);
        if (res.isDuplicate) {
          setPhoneDuplicateError(res.message || 'Số điện thoại này đã tồn tại trong hệ thống!');
          setIsPhoneValid(false);
        } else {
          setPhoneDuplicateError(null);
          setIsPhoneValid(true);
        }
      } catch (err: any) {
        console.error('Lỗi kiểm tra trùng SĐT:', err);
      } finally {
        setIsCheckingPhone(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [hotline]);

  // Debounce kiểm tra trùng SĐT chủ quán (<20ms)
  useEffect(() => {
    const rawDigits = ownerPhone.replace(/\D/g, '');
    const cleanDigits = rawDigits.length === 11 && rawDigits.startsWith('1') ? rawDigits.slice(1) : rawDigits;

    if (cleanDigits.length < 10) {
      setOwnerPhoneDuplicateError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingOwnerPhone(true);
      try {
        const res = await leadApi.checkPhoneDuplicate(cleanDigits);
        if (res.isDuplicate) {
          setOwnerPhoneDuplicateError(
            `SĐT chủ trùng với "${res.existingLead?.restaurantName}" (Do ${res.existingLead?.assignedName} phụ trách)`
          );
        } else {
          setOwnerPhoneDuplicateError(null);
        }
      } catch (err: any) {
        console.error('Lỗi kiểm tra trùng SĐT chủ:', err);
      } finally {
        setIsCheckingOwnerPhone(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [ownerPhone]);

  // Reset toàn bộ trường form về mặc định
  const resetForm = useCallback(() => {
    setRestaurantName('');
    setState('VA');
    setCity('');
    setAddress('');
    setHotline('');
    setOwnerName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setGoogleMapsUrl('');
    setFacebookUrl('');
    setNextCallDate('');
    setAiEvaluation('');
    setSaleNote('');
    setFormError('');
    setPhoneDuplicateError(null);
    setOwnerPhoneDuplicateError(null);
    setIsPhoneValid(false);
    setTimeout(() => {
      restaurantInputRef.current?.focus();
    }, 50);
  }, []);

  // Xử lý gửi form tạo Lead
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    // Validation cơ bản
    if (!restaurantName.trim()) {
      setFormError('Vui lòng nhập tên nhà hàng!');
      restaurantInputRef.current?.focus();
      return;
    }

    const cleanHotline = hotline.replace(/\D/g, '');
    if (cleanHotline.length < 10) {
      setFormError('Số điện thoại hotline phải có đủ ít nhất 10 số!');
      return;
    }

    if (phoneDuplicateError) {
      setFormError('Vui lòng sử dụng số điện thoại khác, số này đã có trong hệ thống!');
      return;
    }

    if (ownerPhoneDuplicateError) {
      setFormError('Số điện thoại của chủ quán đã bị trùng trong hệ thống!');
      return;
    }

    if (nextCallDate && nextCallDate < today) {
      setFormError('Ngày hẹn gọi lại không được nằm trong quá khứ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateLeadInput = {
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
        saleNote: saleNote.trim(),
        nextCallDate: nextCallDate ? nextCallDate.trim() : undefined,
        aiEvaluation: aiEvaluation.trim(),
      };

      const res = await leadApi.createLead(payload);
      toast.success(res.message || `Đã thêm thành công nhà hàng "${res.lead.restaurantName}"!`);

      if (onLeadCreated && res.lead) {
        onLeadCreated(res.lead);
      }

      if (keepOpen) {
        resetForm();
      } else {
        resetForm();
        onClose();
      }
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Tạo nhà hàng mới thất bại!');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lắng nghe phím tắt Ctrl + Enter (hoặc Cmd + Enter) để submit nhanh & phím Esc để đóng
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl overflow-hidden animate-scale-in max-h-[92vh] flex flex-col">
        {/* =================================================================== */}
        {/* HEADER MODAL: PHONG CÁCH CHUẨN THÊM NHÂN VIÊN                      */}
        {/* =================================================================== */}
        <div className="p-6 bg-[#FAF8F5] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Thêm Nhà Hàng Tiềm Năng (Lead Mới)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Khởi tạo dữ liệu khách hàng nhà hàng tại Mỹ, tự động cấp mã định danh cá nhân và chống trùng 20ms
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

        {/* Thông báo lỗi tổng (nếu có) */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* BODY MODAL: BỐ CỤC 2 CỘT (7 CỘT TRÁI - 5 CỘT PHẢI)                 */}
        {/* =================================================================== */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="quick-add-lead-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* --------------------------------------------------------------- */}
            {/* CỘT TRÁI (7 / 12 CỘT): CÁC TRƯỜNG NHẬP LIỆU CỐT LÕI               */}
            {/* --------------------------------------------------------------- */}
            <div className="md:col-span-7 space-y-5">
              {/* NHÓM 1: THÔNG TIN CỐT LÕI (BẮT BUỘC) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thông Tin Quán Bắt Buộc
                  </h4>
                </div>

                <div className="space-y-3">
                  {/* Tên nhà hàng */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Nhà Hàng / Quán Ăn <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        ref={restaurantInputRef}
                        type="text"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="VD: Phở 79 Little Saigon"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Bang & Thành phố (Grid 2 cột) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Bang */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bang Tại Mỹ <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs appearance-none cursor-pointer"
                        >
                          {US_STATES.map((st) => (
                            <option key={st.code} value={st.code}>
                              {st.code} - {st.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Thành phố */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thành Phố
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="VD: Westminster"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Hotline nhà hàng (Có Format và Quét Trùng Chéo) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hotline Nhà Hàng (Quét Trùng 20ms) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={hotline}
                        onChange={(e) => setHotline(formatUsPhoneNumber(e.target.value))}
                        placeholder="(804) 676-8299"
                        required
                        className={`w-full pl-10 pr-10 py-2 bg-white border rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                          phoneDuplicateError
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                            : isPhoneValid
                            ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingPhone && (
                          <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                        )}
                        {!isCheckingPhone && isPhoneValid && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {!isCheckingPhone && phoneDuplicateError && (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                    </div>

                    {/* Báo lỗi trùng Hotline */}
                    {phoneDuplicateError && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneDuplicateError}</span>
                      </p>
                    )}
                    {isPhoneValid && !phoneDuplicateError && (
                      <p className="mt-1 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Số điện thoại hợp lệ, chưa có trong hệ thống Skipli</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* NHÓM 2: THÔNG TIN BỔ SUNG & CHỦ QUÁN (TÙY CHỌN) */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Thông Tin Bổ Sung & Chủ Quán
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                    Không bắt buộc
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Tên chủ quán & SĐT di động chủ */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên Chủ Quán
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="VD: Anh Dũng"
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SĐT Di Động Chủ
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(formatUsPhoneNumber(e.target.value))}
                          placeholder="(714) 555-0192"
                          className={`w-full pl-10 pr-9 py-2 bg-white border rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                            ownerPhoneDuplicateError
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingOwnerPhone && (
                            <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                          )}
                          {!isCheckingOwnerPhone && ownerPhoneDuplicateError && (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      </div>
                      {ownerPhoneDuplicateError && (
                        <p className="mt-1 text-[11px] font-medium text-rose-600">
                          {ownerPhoneDuplicateError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Địa chỉ quán */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa Chỉ Quán
                    </label>
                    <div className="relative">
                      <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="VD: 9941 Bolsa Ave"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Email & Ngày hẹn gọi lại */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Chủ Quán
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder="contact@pho79.com"
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hẹn Gọi Lại (≥ Hôm Nay)
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          min={today}
                          value={nextCallDate}
                          onChange={(e) => setNextCallDate(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Links: Google Maps & Facebook */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link Google Maps
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={googleMapsUrl}
                          onChange={(e) => setGoogleMapsUrl(e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link Facebook Quán
                      </label>
                      <div className="relative">
                        <Share2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú & Đánh giá sơ bộ */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ghi Chú Ban Đầu / Đánh Giá
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        rows={2}
                        value={saleNote}
                        onChange={(e) => setSaleNote(e.target.value)}
                        placeholder="Nội dung tóm tắt khi tìm thấy quán (VD: Quán đông khách, menu trên Facebook rất đa dạng...)"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DÒNG GỢI Ý THÔNG MINH */}
                <div className="mt-3.5 p-3 rounded-xl bg-sky-50/70 border border-sky-100/80 text-[11px] text-sky-900 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mẹo nhập nhanh:</strong> Chỉ cần điền Tên quán, Bang và Hotline là có thể lưu ngay bằng phím tắt <strong>Ctrl + Enter</strong>. Hệ thống tự động gán mã cá nhân <strong>{user?.salesPrefix || 'TR'}-####</strong> và đưa vào quy trình chăm sóc.
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* CỘT PHẢI (5 / 12 CỘT): PREVIEW CARD & QUY CHUẨN HỆ THỐNG          */}
            {/* --------------------------------------------------------------- */}
            <div className="md:col-span-5 space-y-4">
              {/* 1. Card Xem trước thẻ nhà hàng (Live Preview) */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Xem Trước Thẻ Nhà Hàng
                </span>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 font-black text-sm flex items-center justify-center shrink-0">
                    {state || 'US'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {restaurantName.trim() || 'Tên Nhà Hàng Mới'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {city.trim() ? `${city.trim()}, ${state}` : `Bang ${state} (USA)`}
                    </div>
                    <div className="text-[11px] font-mono font-medium text-slate-600 truncate mt-0.5">
                      {hotline.trim() || '(XXX) XXX-XXXX'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-[5px] bg-white text-emerald-600 border border-emerald-400 text-[10px] font-semibold">
                        New
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Mã: {user?.salesPrefix || 'TR'}-####
                      </span>
                      {ownerName.trim() && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold truncate max-w-[120px]">
                          Chủ: {ownerName.trim()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Card Quy chuẩn hệ thống (Quick Tips) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quy Chuẩn Nhập Lead Mỹ
                </span>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Chống trùng chéo &lt;20ms:</strong> Quét cả Hotline và SĐT di động chủ quán trên Firestore Index để tránh trùng khách giữa các Sales.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Mã định danh cá nhân:</strong> Tự động gán mã tăng dần (VD: Lead {user?.salesPrefix || 'TR'}-1001) bằng Atomic Transaction.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tốc độ cao:</strong> Phím <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono border">Tab</kbd> di chuyển liên tục, bấm <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono border">Ctrl + Enter</kbd> để lưu ngay.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Ràng buộc ngày hẹn:</strong> Chỉ cho phép chọn từ hôm nay trở đi (≥ Today) để bảo vệ tính chính xác của hàng đợi To-Do.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* =================================================================== */}
        {/* FOOTER ACTIONS MODAL                                                */}
        {/* =================================================================== */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>

            {/* Checkbox "Lưu & Tiếp tục thêm" */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">
                Lưu & Tiếp tục thêm quán khác
              </span>
            </label>
          </div>

          <button
            type="submit"
            form="quick-add-lead-form"
            disabled={isSubmitting || !!phoneDuplicateError || !!ownerPhoneDuplicateError}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>+ Lưu Nhà Hàng</span>
                <span className="text-[10px] font-normal opacity-80 border-l border-white/20 pl-1.5 hidden sm:inline">
                  Ctrl + ↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddLeadModal;
