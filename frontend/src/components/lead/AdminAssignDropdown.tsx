/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/AdminAssignDropdown.tsx
 * VAI TRÒ: Dropdown Bàn Giao Sales Siêu Tinh Gọn - Nền Trắng, Viền Mảnh, Chuẩn Hình Mẫu
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Check, Search, ChevronDown, UserX } from 'lucide-react';
import { UserProfile } from '../../services/auth.api';

interface AdminAssignDropdownProps {
  currentAssignedId: string;
  currentAssignedName: string;
  currentPrefix: string;
  salesList: UserProfile[];
  onSelectSales: (salesId: string) => void;
  direction?: 'down' | 'up';
}

export const AdminAssignDropdown: React.FC<AdminAssignDropdownProps> = ({
  currentAssignedId,
  currentAssignedName,
  currentPrefix,
  salesList,
  onSelectSales,
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc danh sách Sales đang hoạt động theo từ khóa tìm kiếm
  const filteredSales = useMemo(() => {
    return salesList
      .filter((u) => u.isActive)
      .filter(
        (u) =>
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          u.salesPrefix?.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
  }, [salesList, searchTerm]);

  const isUnassigned = !currentAssignedId || currentAssignedId === '' || currentAssignedId === 'UNASSIGNED';

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      {/* Nút bấm hiển thị Người phụ trách (Chuẩn hình mẫu: Avatar tròn + Tên Sales) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-2 py-1 -mx-2 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer select-none text-left"
        title="Nhấp để chuyển giao người phụ trách"
      >
        <div
          className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${
            isUnassigned ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'
          }`}
        >
          {isUnassigned ? <UserX className="w-3 h-3" /> : currentPrefix || 'SR'}
        </div>
        <span
          className={`text-xs truncate max-w-[110px] group-hover:text-sky-600 transition-colors ${
            isUnassigned ? 'font-medium text-amber-600 italic' : 'font-bold text-slate-800'
          }`}
        >
          {isUnassigned ? 'Chưa giao' : currentAssignedName}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Lớp nền trong suốt click-away */}
      {isOpen && (
        <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsOpen(false)} />
      )}

      {/* Popover Nổi Siêu Tinh Gọn (Nền trắng, viền mảnh, không chữ rườm rà) */}
      {isOpen && (
        <div
          className={`absolute left-0 z-40 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 animate-scale-in text-xs ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Ô tìm kiếm Sales siêu gọn 28px */}
          {salesList.length > 4 && (
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên Sales..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
                autoFocus
              />
            </div>
          )}

          {/* Danh sách nhân viên Sales tinh gọn */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredSales.length === 0 ? (
              <div className="py-2.5 text-center text-slate-400 text-[11px]">
                Không tìm thấy nhân viên
              </div>
            ) : (
              filteredSales.map((sales) => {
                const isSelected = sales.id === currentAssignedId;
                return (
                  <button
                    key={sales.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (!isSelected) onSelectSales(sales.id);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/80 font-bold' : 'hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0 border border-slate-200">
                        {sales.salesPrefix || 'SR'}
                      </div>
                      <span className="truncate text-slate-800 text-xs">
                        {sales.fullName}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}

            {/* Dòng tùy chọn: Thu hồi quyền phụ trách về kho chung */}
            <div className="pt-1 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (!isUnassigned) onSelectSales('UNASSIGNED');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer text-amber-700 hover:bg-amber-50 ${
                  isUnassigned ? 'bg-amber-50 font-bold' : 'font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <UserX className="w-3 h-3" />
                  </div>
                  <span className="truncate text-xs">Chưa phân công</span>
                </div>
                {isUnassigned && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
