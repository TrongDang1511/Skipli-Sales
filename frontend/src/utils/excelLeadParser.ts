/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/utils/excelLeadParser.ts
 * PHÂN LOẠI: UTILITY (SHEETJS EXCEL PARSER & TEMPLATE GENERATOR)
 * VAI TRÒ: Đọc File .xlsx/.csv Thành Mảng Lead Chuẩn & Tạo File Mẫu Tải Xuống
 * ==============================================================================
 */

import * as XLSX from 'xlsx';
import { CreateLeadInput } from '../types/lead.types';

export interface ParsedExcelRow {
  rowNumber: number;
  data: CreateLeadInput;
  localError?: string;
}

export const extractDigits = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
};

// Chuẩn hóa tên cột (bỏ dấu tiếng Việt + ký tự đặc biệt để nhận cả "Tên quán", "Restaurant Name"...)
const normalizeKey = (k: string): string =>
  k
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');

const pickField = (row: Record<string, unknown>, aliases: string[]): string => {
  for (const [key, val] of Object.entries(row)) {
    if (aliases.includes(normalizeKey(key)) && val !== undefined && val !== null) {
      return String(val).trim();
    }
  }
  return '';
};

export async function parseLeadsExcelFile(file: File): Promise<ParsedExcelRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });

  // Bỏ qua các dòng trống hoàn toàn ở cuối file Excel
  const nonEmptyRows = rawRows
    .map((raw, idx) => ({ raw, rowNumber: idx + 2 }))
    .filter(({ raw }) => Object.values(raw).some((v) => String(v ?? '').trim() !== ''));

  return nonEmptyRows.map(({ raw, rowNumber }) => {
    const restaurantName = pickField(raw, [
      'restaurantname',
      'name',
      'tenquan',
      'tennhahang',
      'restaurant',
    ]);
    const state = pickField(raw, ['state', 'bang', 'mabang']).toUpperCase().slice(0, 2);
    const hotline = pickField(raw, ['hotline', 'phone', 'sdt', 'sodienthoai', 'phonenumber']);

    const data: CreateLeadInput = {
      restaurantName,
      state,
      hotline,
      address: pickField(raw, ['address', 'diachi']),
      city: pickField(raw, ['city', 'thanhpho']),
      ownerName: pickField(raw, ['ownername', 'owner', 'chuquan', 'tenchuquan']),
      ownerPhone: pickField(raw, ['ownerphone', 'sdtchuquan']),
      ownerEmail: pickField(raw, ['owneremail', 'email']),
      googleMapsUrl: pickField(raw, ['googlemapsurl', 'googlemaps', 'maps']),
      facebookUrl: pickField(raw, ['facebookurl', 'facebook', 'fb']),
      saleNote: pickField(raw, ['salenote', 'note', 'ghichu']),
    };

    let localError: string | undefined;
    if (!restaurantName || restaurantName.length < 2) {
      localError = 'Thiếu tên nhà hàng (>= 2 ký tự)';
    } else if (state.length !== 2) {
      localError = 'Mã bang phải đúng 2 ký tự (VD: CA, TX)';
    } else if (extractDigits(hotline).length < 10) {
      localError = 'Hotline phải đủ 10 chữ số';
    }

    return { rowNumber, data, localError };
  });
}

export function downloadLeadImportTemplate(): void {
  const sample = [
    {
      restaurantName: 'Pho Saigon 168',
      state: 'CA',
      city: 'San Jose',
      address: '1234 Story Rd',
      hotline: '(408) 555-0199',
      ownerName: 'Nguyen Van A',
      ownerPhone: '',
      ownerEmail: '',
      googleMapsUrl: '',
      facebookUrl: '',
      saleNote: 'Khách tiềm năng khu vực San Jose',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads_Template');
  XLSX.writeFile(wb, 'Skipli_Leads_Import_Template.xlsx');
}
