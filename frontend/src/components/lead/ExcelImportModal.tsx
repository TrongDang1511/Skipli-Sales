/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/components/lead/ExcelImportModal.tsx
 * PHÂN LOẠI: UI COMPONENT (MODAL IMPORT LEADS TỪ EXCEL)
 * VAI TRÒ: Upload & Tải File Mẫu -> Xem Trước (Preview) & Chống Trùng -> Import Batch
 * ==============================================================================
 */

import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '../../contexts/ToastContext';
import { leadApi, extractApiErrorMessage } from '../../services/lead.api';
import { ImportLeadPreviewItem, ImportLeadsResult } from '../../types/lead.types';
import {
  parseLeadsExcelFile,
  downloadLeadImportTemplate,
  extractDigits,
} from '../../utils/excelLeadParser';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

type ModalStep = 'UPLOAD' | 'PREVIEW' | 'RESULT';

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<ModalStep>('UPLOAD');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportLeadPreviewItem[]>([]);
  const [importResult, setImportResult] = useState<ImportLeadsResult | null>(null);

  const resetState = () => {
    setStep('UPLOAD');
    setFileName('');
    setIsDragging(false);
    setIsParsing(false);
    setIsImporting(false);
    setPreviewRows([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    onClose();
  };

  // Đọc file Excel trên Frontend + gọi API check-phone để đánh dấu dòng trùng DB
  const handleFileSelected = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      toast.error('Vui lòng chọn file định dạng .xlsx, .xls hoặc .csv!');
      return;
    }

    setIsParsing(true);
    setFileName(file.name);

    try {
      const parsed = await parseLeadsExcelFile(file);
      if (parsed.length === 0) {
        toast.error('File Excel không có dòng dữ liệu nào!');
        setIsParsing(false);
        return;
      }
      if (parsed.length > 500) {
        toast.error(`File có ${parsed.length} dòng — hệ thống chỉ hỗ trợ tối đa 500 dòng mỗi lần!`);
        setIsParsing(false);
        return;
      }

      // Gom toàn bộ SĐT hợp lệ để hỏi Backend 1 lần duy nhất
      const phonesToCheck: string[] = [];
      parsed.forEach((row) => {
        if (!row.localError) {
          const p1 = extractDigits(row.data.hotline);
          if (p1.length >= 10) phonesToCheck.push(p1);
          if (row.data.ownerPhone) {
            const p2 = extractDigits(row.data.ownerPhone);
            if (p2.length >= 10) phonesToCheck.push(p2);
          }
        }
      });

      const dbDuplicates =
        phonesToCheck.length > 0 ? await leadApi.checkPhonesDuplicate(phonesToCheck) : {};

      // Chấm trạng thái từng dòng (INVALID / DUPLICATE_IN_DB / DUPLICATE_IN_FILE / VALID)
      const seenInFile = new Set<string>();
      const items: ImportLeadPreviewItem[] = parsed.map((row) => {
        if (row.localError) {
          return {
            ...row.data,
            rowNumber: row.rowNumber,
            status: 'INVALID',
            errorMessage: row.localError,
          };
        }

        const cleanHotline = extractDigits(row.data.hotline);
        const cleanOwner = row.data.ownerPhone ? extractDigits(row.data.ownerPhone) : '';
        const dbMatch =
          dbDuplicates[cleanHotline] || (cleanOwner ? dbDuplicates[cleanOwner] : undefined);

        if (dbMatch) {
          return {
            ...row.data,
            rowNumber: row.rowNumber,
            status: 'DUPLICATE_IN_DB',
            duplicateInfo: `Trùng với ${dbMatch.leadCustomId} (${dbMatch.restaurantName} - ${dbMatch.assignedName})`,
          };
        }

        if (seenInFile.has(cleanHotline)) {
          return {
            ...row.data,
            rowNumber: row.rowNumber,
            status: 'DUPLICATE_IN_FILE',
            duplicateInfo: 'Trùng SĐT với dòng phía trên trong file',
          };
        }

        seenInFile.add(cleanHotline);
        if (cleanOwner.length >= 10) seenInFile.add(cleanOwner);

        return {
          ...row.data,
          rowNumber: row.rowNumber,
          status: 'VALID',
        };
      });

      setPreviewRows(items);
      setStep('PREVIEW');
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Không đọc được file Excel!'));
    } finally {
      setIsParsing(false);
    }
  };

  const validRows = previewRows.filter((r) => r.status === 'VALID');
  const duplicateCount = previewRows.filter(
    (r) => r.status === 'DUPLICATE_IN_DB' || r.status === 'DUPLICATE_IN_FILE'
  ).length;
  const invalidCount = previewRows.filter((r) => r.status === 'INVALID').length;

  const handleConfirmImport = async () => {
    if (validRows.length === 0 || isImporting) return;
    setIsImporting(true);

    try {
      const payload = validRows.map(({ rowNumber, status, errorMessage, duplicateInfo, ...lead }) => lead);
      const res = await leadApi.importLeads(payload);
      setImportResult(res.result);
      setStep('RESULT');
      toast.success(res.message);
      onImported();
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Import danh sách nhà hàng thất bại!'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-slate-200 bg-white gap-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-[#FAF8F5] border-b border-slate-200/80 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Import Danh Sách Nhà Hàng Từ Excel
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Hỗ trợ file .xlsx, .xls, .csv (tối đa 500 dòng/lần) — tự động lọc trùng SĐT.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {/* BƯỚC 1: UPLOAD */}
          {step === 'UPLOAD' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) handleFileSelected(droppedFile);
                }}
                onClick={() => !isParsing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/70'
                    : 'border-slate-200 bg-[#FAF8F5]/60 hover:border-sky-400 hover:bg-sky-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) handleFileSelected(selected);
                  }}
                />
                {isParsing ? (
                  <div className="space-y-2 text-sky-700">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    <p className="text-sm font-bold">Đang đọc file & kiểm tra trùng SĐT...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Kéo thả file Excel vào đây hoặc bấm để chọn file
                    </p>
                    <p className="text-xs text-slate-500">
                      Cột bắt buộc: <strong>restaurantName</strong> (Tên quán), <strong>state</strong> (Bang 2 ký tự), <strong>hotline</strong> (SĐT 10 số)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex-wrap">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Chưa có file chuẩn?</span> Tải file mẫu có sẵn đầy đủ tên cột chuẩn của hệ thống.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadLeadImportTemplate}
                  className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File Mẫu (.xlsx)</span>
                </Button>
              </div>
            </div>
          )}

          {/* BƯỚC 2: PREVIEW */}
          {step === 'PREVIEW' && (
            <div className="space-y-3.5">
              {/* Thống kê & Quy tắc gán */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1">
                    File: {fileName} ({previewRows.length} dòng)
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-2.5 py-1">
                    Hợp lệ: {validRows.length}
                  </Badge>
                  {duplicateCount > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold px-2.5 py-1">
                      Trùng SĐT: {duplicateCount}
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold px-2.5 py-1">
                      Lỗi dữ liệu: {invalidCount}
                    </Badge>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chọn file khác</span>
                </Button>
              </div>

              {/* Bảng Preview */}
              <ScrollArea className="h-[320px] rounded-2xl border border-slate-200/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#FAF8F5] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 z-10">
                    <tr>
                      <th className="px-3 py-2.5 w-14">Dòng</th>
                      <th className="px-3 py-2.5">Tên nhà hàng</th>
                      <th className="px-3 py-2.5 w-16">Bang</th>
                      <th className="px-3 py-2.5 w-32">Hotline</th>
                      <th className="px-3 py-2.5">Trạng thái kiểm tra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={
                          row.status === 'VALID'
                            ? 'bg-white'
                            : row.status === 'DUPLICATE_IN_FILE'
                              ? 'bg-amber-50/40'
                              : 'bg-rose-50/40'
                        }
                      >
                        <td className="px-3 py-2.5 font-mono text-slate-400">#{row.rowNumber}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 max-w-[200px] truncate">
                          {row.restaurantName || '—'}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                          {row.state || '—'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">
                          {row.hotline || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.status === 'VALID' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Hợp lệ
                            </span>
                          )}
                          {row.status === 'DUPLICATE_IN_FILE' && (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              {row.duplicateInfo}
                            </span>
                          )}
                          {row.status === 'DUPLICATE_IN_DB' && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {row.duplicateInfo}
                            </span>
                          )}
                          {row.status === 'INVALID' && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {row.errorMessage}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          {/* BƯỚC 3: KẾT QUẢ */}
          {step === 'RESULT' && importResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  Đã import thành công {importResult.importedCount} nhà hàng!
                </h4>
                <p className="text-xs text-slate-500">
                  Bỏ qua {importResult.skippedDuplicateCount} dòng trùng SĐT và{' '}
                  {importResult.skippedInvalidCount} dòng lỗi dữ liệu.
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-slate-200/80" />

        {/* FOOTER */}
        <DialogFooter className="px-6 py-3.5 bg-[#FAF8F5]/70 flex items-center justify-end gap-2">
          {step === 'UPLOAD' && (
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl text-xs">
              Đóng
            </Button>
          )}

          {step === 'PREVIEW' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isImporting}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={validRows.length === 0 || isImporting}
                onClick={handleConfirmImport}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1.5"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang import...</span>
                  </>
                ) : (
                  <span>Import {validRows.length} nhà hàng hợp lệ</span>
                )}
              </Button>
            </>
          )}

          {step === 'RESULT' && (
            <Button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
            >
              Hoàn tất & Xem bảng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
