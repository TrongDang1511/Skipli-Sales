/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/services/lead-note.service.ts
 * PHÂN LOẠI: SERVICE (NGHIỆP VỤ TIMELINE & POWER CALLING)
 * VAI TRÒ: Kiểm Tra RBAC, Lưu Note Mới & Đồng Bộ Ngược Lead Cha (latestNote, callCount)
 * ==============================================================================
 */

import crypto from 'crypto';
import { LeadNoteRepository } from '../repositories/lead-note.repository';
import { LeadService } from './lead.service';
import { CreateLeadNoteRequestDto } from '../dtos';
import { LeadNote } from '../models/lead-note.model';
import { Lead } from '../models/lead.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export class LeadNoteService {
  private noteRepo: LeadNoteRepository;
  private leadService: LeadService;

  constructor() {
    this.noteRepo = new LeadNoteRepository();
    this.leadService = new LeadService();
  }

  /**
   * 1. LẤY TIMELINE GHI CHÚ CỦA 1 LEAD (CÓ KIỂM TRA QUYỀN SỞ HỮU RBAC)
   */
  async getNotesByLeadId(
    leadId: string,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<LeadNote[]> {
    // Tái sử dụng getLeadById để chặn Sales xem trộm timeline quán của Sales khác
    const lead = await this.leadService.getLeadById(leadId, currentUser);
    const notes = await this.noteRepo.findByLeadId(leadId);

    // Tự động đồng bộ ghi chú ban đầu của các Lead cũ/vừa import vào lead_notes để không bị mất khi thêm note mới
    const initialContent = (lead.latestNote || '').trim();
    if (notes.length === 0 && initialContent !== '') {
      const initialNote: LeadNote = {
        id: 'note_' + crypto.randomUUID(),
        leadId: lead.id,
        authorId: lead.assignedTo || currentUser.id,
        authorName: lead.assignedTo ? lead.assignedName : 'Ghi chú ban đầu',
        authorPrefix: lead.assignedPrefix || lead.leadCustomId?.split('-')[0] || 'LD',
        callResult: 'NOTE_ONLY',
        content: initialContent,
        nextCallDate: lead.nextCallDate || null,
        createdAt: lead.createdAt || new Date().toISOString(),
      };
      await this.noteRepo.create(initialNote);
      return [initialNote];
    }

    return notes;
  }

  /**
   * 2. THÊM GHI CHÚ CUỘC GỌI MỚI + ĐỒNG BỘ LEAD CHA
   */
  async addNote(
    leadId: string,
    dto: CreateLeadNoteRequestDto,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<{ note: LeadNote; updatedLead: Lead }> {
    const lead = await this.leadService.getLeadById(leadId, currentUser);
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // 1. Tạo bản ghi note mới trong lead_notes
    const newNote: LeadNote = {
      id: 'note_' + crypto.randomUUID(),
      leadId: lead.id,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorPrefix: currentUser.salesPrefix || 'SR',
      callResult: dto.callResult,
      content: dto.content,
      nextCallDate: dto.nextCallDate !== undefined ? dto.nextCallDate : lead.nextCallDate || null,
      createdAt: now,
    };

    // 2. Đồng bộ Lead cha qua LeadService.updateLead TRƯỚC khi ghi note để bảo toàn các rule validation
    const isRealCall = dto.callResult !== 'NOTE_ONLY';
    const updatedLead = await this.leadService.updateLead(
      lead.id,
      {
        latestNote: dto.content,
        callCount: isRealCall ? (lead.callCount || 0) + 1 : lead.callCount || 0,
        lastCallDate: isRealCall ? today : lead.lastCallDate || null,
        ...(dto.nextCallDate !== undefined ? { nextCallDate: dto.nextCallDate } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      currentUser
    );

    const savedNote = await this.noteRepo.create(newNote);
    return { note: savedNote, updatedLead };
  }
}
