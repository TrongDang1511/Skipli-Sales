/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/LeadSheetTabs.tsx
 * PHÂN LOẠI: UI COMPONENT (THANH CHUYỂN SHEET KIỂU GOOGLE SHEET)
 * VAI TRÒ: Hiển thị 3 Sheet (New, Follow-Up, Closed) kèm badge đếm số lượng realtime
 * ==============================================================================
 */

import React from 'react';
import { LEAD_SHEETS_CONFIG, LeadSheetCounts, LeadSheetKey } from '../../types/lead.types';

interface LeadSheetTabsProps {
  activeSheet: LeadSheetKey;
  counts: LeadSheetCounts;
  onChangeSheet: (sheet: LeadSheetKey) => void;
}

export const LeadSheetTabs: React.FC<LeadSheetTabsProps> = ({
  activeSheet,
  counts,
  onChangeSheet,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Phân loại Sheet Leads"
      className="flex items-center gap-1.5 border-b border-slate-200/80 px-4 pt-3 bg-[#FAF8F5]/70 rounded-t-3xl overflow-x-auto"
    >
      {LEAD_SHEETS_CONFIG.map((sheet) => {
        const isActive = activeSheet === sheet.key;
        const count = counts[sheet.key] ?? 0;

        return (
          <button
            key={sheet.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeSheet(sheet.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border border-b-0 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 border-slate-200/90 shadow-2xs -mb-px pb-[11px]'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${sheet.dotClass}`} />
            <span>{sheet.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? sheet.activeBadgeClass : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
