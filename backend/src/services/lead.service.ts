/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/services/lead.service.ts
 * PHÂN LOẠI: SERVICE (TẦNG XỬ LÝ NGHIỆP VỤ CỐT LÕI)
 * VAI TRÒ: Chuẩn Hóa SĐT, Chống Trùng 20ms, Sinh Mã Cá Nhân, Phân Quyền RBAC, Ràng Buộc NextCallDate
 * ==============================================================================
 */

import crypto from 'crypto';
import { LeadRepository, LeadSheetCounts } from '../repositories/lead.repository';
import { LeadNoteRepository } from '../repositories/lead-note.repository';
import { UserRepository } from '../repositories/user.repository';
import {
  CreateLeadRequestDto,
  ImportLeadsRequestDto,
  GetLeadsQueryDto,
  UpdateLeadRequestDto,
  LEAD_SHEET_STATUSES,
} from '../dtos';
import { Lead, LeadStatus } from '../models/lead.model';
import { LeadNote } from '../models/lead-note.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export class LeadService {
  private leadRepo: LeadRepository;
  private noteRepo: LeadNoteRepository;
  private userRepo: UserRepository;

  constructor() {
    this.leadRepo = new LeadRepository();
    this.noteRepo = new LeadNoteRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * HÀM TIỆN ÍCH: CHUẨN HÓA SỐ ĐIỆN THOẠI THÀNH 10 CHỮ SỐ PHẲNG
   * Ví dụ: "+1 (804) 676-8299" -> "8046768299"
   */
  public extractCleanPhone(rawPhone: string): string {
    if (!rawPhone) return '';
    const digitsOnly = rawPhone.replace(/\D/g, ''); // Loại bỏ toàn bộ ký tự không phải số
    // Nếu có mã quốc gia Mỹ '1' ở đầu (11 số), cắt lấy 10 số sau
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return digitsOnly.slice(1);
    }
    return digitsOnly;
  }

  /**
   * 1. KIỂM TRA TRÙNG CHÉO SỐ ĐIỆN THOẠI (<20MS)
   * Kiểm tra trên cả Hotline quán và SĐT riêng của chủ quán
   */
  async checkPhoneDuplicate(phone: string): Promise<{
    isDuplicate: boolean;
    existingLead?: Lead;
    message?: string;
  }> {
    const cleanPhone = this.extractCleanPhone(phone);
    if (cleanPhone.length < 10) {
      return { isDuplicate: false, message: 'Số điện thoại chưa đủ 10 số' };
    }

    const existingLead = await this.leadRepo.findByCleanPhoneOrOwnerPhone(cleanPhone);
    if (existingLead) {
      return {
        isDuplicate: true,
        existingLead,
        message: `Số điện thoại này đã tồn tại trong hệ thống! (Quán: ${existingLead.restaurantName} - Do ${existingLead.assignedName} phụ trách)`,
      };
    }

    return {
      isDuplicate: false,
      message: 'Số điện thoại hợp lệ, chưa có trong hệ thống.',
    };
  }

  /**
   * 1.1 QUÉT TRÙNG DANH SÁCH SĐT CHO MÀN HÌNH PREVIEW EXCEL
   */
  async checkPhonesBatch(rawPhones: string[]): Promise<{
    duplicates: Record<string, { restaurantName: string; assignedName: string; leadCustomId: string }>;
  }> {
    const cleanList = rawPhones
      .map((p) => this.extractCleanPhone(p))
      .filter((p) => p.length >= 10);

    const existingLeads = await this.leadRepo.findByCleanPhoneOrOwnerPhone(cleanList);
    const duplicates: Record<
      string,
      { restaurantName: string; assignedName: string; leadCustomId: string }
    > = {};

    existingLeads.forEach((lead) => {
      const info = {
        restaurantName: lead.restaurantName,
        assignedName: lead.assignedName || 'Chưa phân công',
        leadCustomId: lead.leadCustomId,
      };
      if (lead.cleanPhone) duplicates[lead.cleanPhone] = info;
      if (lead.cleanOwnerPhone) duplicates[lead.cleanOwnerPhone] = info;
    });

    return { duplicates };
  }

  /**
   * 2. TẠO LEAD MỚI (KIỂM TRA TRÙNG CHÉO & RÀNG BUỘC NGÀY HẸN)
   */
  async createLead(
    dto: CreateLeadRequestDto,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<Lead> {
    const cleanPhone = this.extractCleanPhone(dto.hotline);

    if (cleanPhone.length < 10) {
      throw new Error('Số điện thoại chính của nhà hàng không hợp lệ (phải có ít nhất 10 số)!');
    }

    // 1. Quét chống trùng chéo trên hotline
    const existingHotline = await this.leadRepo.findByCleanPhoneOrOwnerPhone(cleanPhone);
    if (existingHotline) {
      throw new Error(
        `Số điện thoại ${dto.hotline} đã trùng với nhà hàng "${existingHotline.restaurantName}" (Do ${existingHotline.assignedName} phụ trách)!`
      );
    }

    // 2. Nếu có nhập số di động riêng của chủ quán -> quét chống trùng chéo luôn
    let cleanOwnerPhone = '';
    if (dto.ownerPhone && dto.ownerPhone.trim() !== '') {
      cleanOwnerPhone = this.extractCleanPhone(dto.ownerPhone);
      if (cleanOwnerPhone.length >= 10) {
        const existingOwner = await this.leadRepo.findByCleanPhoneOrOwnerPhone(cleanOwnerPhone);
        if (existingOwner) {
          throw new Error(
            `Số điện thoại chủ quán ${dto.ownerPhone} đã trùng với nhà hàng "${existingOwner.restaurantName}" (Do ${existingOwner.assignedName} phụ trách)!`
          );
        }
      }
    }

    // 3. Nếu có nhập nextCallDate ngay từ form tạo -> kiểm tra không được là ngày trong quá khứ
    const today = new Date().toISOString().slice(0, 10);
    if (dto.nextCallDate && dto.nextCallDate.trim() !== '') {
      if (dto.nextCallDate < today) {
        throw new Error(`Ngày hẹn gọi lại (${dto.nextCallDate}) không được nằm trong quá khứ!`);
      }
    }

    // 4. Sinh mã định danh theo tiền tố của người tạo (kể cả khi hệ thống có nhiều Admin)
    // Nếu Admin tạo -> mặc định chưa phân công để Admin tự bàn giao sau
    const isAdminCreator = currentUser.role === 'ADMIN';
    const prefix = currentUser.salesPrefix || 'LD';
    const sequence = await this.leadRepo.getNextLeadSequence(prefix);
    const leadCustomId = `${prefix}-${sequence}`;
    const now = new Date().toISOString();

    const newLead: Lead = {
      id: 'lead_' + crypto.randomUUID(),
      leadCustomId,
      restaurantName: dto.restaurantName,
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state,
      hotline: dto.hotline,
      cleanPhone,
      ownerName: dto.ownerName || '',
      ownerPhone: dto.ownerPhone || '',
      cleanOwnerPhone,
      ownerEmail: dto.ownerEmail || '',
      googleMapsUrl: dto.googleMapsUrl || '',
      facebookUrl: dto.facebookUrl || '',
      status: 'NEW', // Mặc định khi mới tạo là NEW
      assignedTo: isAdminCreator ? '' : currentUser.id,
      assignedPrefix: isAdminCreator ? '' : prefix,
      assignedName: isAdminCreator ? 'Chưa phân công' : currentUser.fullName,
      latestNote: dto.saleNote || '',
      callCount: 0,
      lastCallDate: null,
      nextCallDate: dto.nextCallDate || null,
      dealValue: 0,
      aiEvaluation: dto.aiEvaluation || '',
      createdAt: now,
      updatedAt: now,
      statusUpdatedAt: now,
    };

    const savedLead = await this.leadRepo.create(newLead);

    // Nếu có ghi chú ban đầu khi tạo Lead -> lưu luôn vào timeline lead_notes
    const initialNoteContent = (savedLead.latestNote || '').trim();
    if (initialNoteContent !== '') {
      await this.noteRepo.create({
        id: 'note_' + crypto.randomUUID(),
        leadId: savedLead.id,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorPrefix: prefix,
        callResult: 'NOTE_ONLY',
        content: initialNoteContent,
        nextCallDate: savedLead.nextCallDate || null,
        createdAt: now,
      });
    }

    return savedLead;
  }

  /**
   * 2.1 IMPORT HÀNG LOẠT LEADS TỪ EXCEL (SALES: TỰ GÁN; ADMIN: CHƯA PHÂN CÔNG)
   */
  async importLeads(
    dto: ImportLeadsRequestDto,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<{
    importedCount: number;
    skippedDuplicateCount: number;
    skippedInvalidCount: number;
    skippedDetails: Array<{
      rowNumber: number;
      restaurantName: string;
      hotline: string;
      reason: string;
    }>;
  }> {
    const isAdmin = currentUser.role === 'ADMIN';

    // 1. Quét trùng trên toàn bộ SĐT hợp lệ của file bằng 1 lần query batch
    const allCleanPhones: string[] = [];
    dto.leads.forEach((item) => {
      const c1 = this.extractCleanPhone(item.hotline);
      if (c1.length >= 10) allCleanPhones.push(c1);
      if (item.ownerPhone) {
        const c2 = this.extractCleanPhone(item.ownerPhone);
        if (c2.length >= 10) allCleanPhones.push(c2);
      }
    });

    const existingLeads = await this.leadRepo.findByCleanPhoneOrOwnerPhone(allCleanPhones);
    const dbPhoneSet = new Set<string>();
    existingLeads.forEach((l) => {
      if (l.cleanPhone) dbPhoneSet.add(l.cleanPhone);
      if (l.cleanOwnerPhone) dbPhoneSet.add(l.cleanOwnerPhone);
    });

    // 2. Lọc dòng hợp lệ, chống trùng cả trong nội bộ file lẫn trên DB
    const seenInFile = new Set<string>();
    const validItems: Array<{
      dto: CreateLeadRequestDto;
      cleanPhone: string;
      cleanOwnerPhone: string;
    }> = [];
    const skippedDetails: Array<{
      rowNumber: number;
      restaurantName: string;
      hotline: string;
      reason: string;
    }> = [];
    let skippedDuplicateCount = 0;
    let skippedInvalidCount = 0;
    const today = new Date().toISOString().slice(0, 10);

    dto.leads.forEach((item, index) => {
      const rowNumber = index + 1;
      const cleanPhone = this.extractCleanPhone(item.hotline);
      const cleanOwnerPhone = item.ownerPhone ? this.extractCleanPhone(item.ownerPhone) : '';

      if (cleanPhone.length < 10) {
        skippedInvalidCount++;
        skippedDetails.push({
          rowNumber,
          restaurantName: item.restaurantName,
          hotline: item.hotline,
          reason: 'SĐT chưa đủ 10 số',
        });
        return;
      }
      if (item.nextCallDate && item.nextCallDate < today) {
        skippedInvalidCount++;
        skippedDetails.push({
          rowNumber,
          restaurantName: item.restaurantName,
          hotline: item.hotline,
          reason: 'Ngày hẹn nằm trong quá khứ',
        });
        return;
      }
      if (
        dbPhoneSet.has(cleanPhone) ||
        (cleanOwnerPhone.length >= 10 && dbPhoneSet.has(cleanOwnerPhone))
      ) {
        skippedDuplicateCount++;
        skippedDetails.push({
          rowNumber,
          restaurantName: item.restaurantName,
          hotline: item.hotline,
          reason: 'SĐT đã tồn tại trong hệ thống',
        });
        return;
      }
      if (seenInFile.has(cleanPhone)) {
        skippedDuplicateCount++;
        skippedDetails.push({
          rowNumber,
          restaurantName: item.restaurantName,
          hotline: item.hotline,
          reason: 'Trùng SĐT với dòng trước trong file',
        });
        return;
      }

      seenInFile.add(cleanPhone);
      if (cleanOwnerPhone.length >= 10) seenInFile.add(cleanOwnerPhone);
      validItems.push({ dto: item, cleanPhone, cleanOwnerPhone });
    });

    if (validItems.length === 0) {
      return {
        importedCount: 0,
        skippedDuplicateCount,
        skippedInvalidCount,
        skippedDetails,
      };
    }

    // 3. Xin dải số thứ tự theo tiền tố người tạo
    const creatorPrefix = currentUser.salesPrefix || 'LD';
    let nextSeq = await this.leadRepo.reserveLeadSequenceBlock(creatorPrefix, validItems.length);
    const now = new Date().toISOString();

    const leadsToCreate: Lead[] = validItems.map((entry) => ({
      id: 'lead_' + crypto.randomUUID(),
      leadCustomId: `${creatorPrefix}-${nextSeq++}`,
      restaurantName: entry.dto.restaurantName,
      address: entry.dto.address || '',
      city: entry.dto.city || '',
      state: entry.dto.state,
      hotline: entry.dto.hotline,
      cleanPhone: entry.cleanPhone,
      ownerName: entry.dto.ownerName || '',
      ownerPhone: entry.dto.ownerPhone || '',
      cleanOwnerPhone: entry.cleanOwnerPhone,
      ownerEmail: entry.dto.ownerEmail || '',
      googleMapsUrl: entry.dto.googleMapsUrl || '',
      facebookUrl: entry.dto.facebookUrl || '',
      status: 'NEW',
      // Sales import -> tự gán cho chính Sales; Admin import -> mặc định Chưa phân công
      assignedTo: isAdmin ? '' : currentUser.id,
      assignedPrefix: isAdmin ? '' : creatorPrefix,
      assignedName: isAdmin ? 'Chưa phân công' : currentUser.fullName,
      latestNote: entry.dto.saleNote || '',
      callCount: 0,
      lastCallDate: null,
      nextCallDate: entry.dto.nextCallDate || null,
      dealValue: 0,
      aiEvaluation: entry.dto.aiEvaluation || '',
      createdAt: now,
      updatedAt: now,
      statusUpdatedAt: now,
    }));

    await this.leadRepo.createBatch(leadsToCreate);

    // Tạo bản ghi note ban đầu trong lead_notes cho các dòng Excel có cột ghi chú
    const initialNotes: LeadNote[] = leadsToCreate
      .filter((lead) => (lead.latestNote || '').trim() !== '')
      .map((lead) => ({
        id: 'note_' + crypto.randomUUID(),
        leadId: lead.id,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorPrefix: creatorPrefix,
        callResult: 'NOTE_ONLY',
        content: (lead.latestNote || '').trim(),
        nextCallDate: lead.nextCallDate || null,
        createdAt: now,
      }));

    if (initialNotes.length > 0) {
      await this.noteRepo.createBatch(initialNotes);
    }

    return {
      importedCount: leadsToCreate.length,
      skippedDuplicateCount,
      skippedInvalidCount,
      skippedDetails,
    };
  }

  /**
   * 3. LẤY DANH SÁCH LEADS (ÁP DỤNG RBAC BẢO MẬT PHÂN QUYỀN & CHIA SHEET)
   */
  async getLeads(
    query: GetLeadsQueryDto,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<{
    items: Lead[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sheetCounts: LeadSheetCounts;
  }> {
    // Nguyên tắc RBAC: Nếu là SALES -> bắt buộc chỉ lấy lead do mình phụ trách!
    const assignedToFilter = currentUser.role === 'SALES' ? currentUser.id : query.assignedTo;

    const { items, total, sheetCounts } = await this.leadRepo.findLeads({
      assignedTo: assignedToFilter,
      status: query.status,
      sheet: query.sheet,
      schedule: query.schedule,
      todayDate: query.todayDate,
      state: query.state,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items,
      total,
      page: query.page,
      pageSize: query.limit,
      totalPages,
      sheetCounts,
    };
  }

  /**
   * 4. LẤY CHI TIẾT LEAD THEO ID (KIỂM TRA QUYỀN SỞ HỮU)
   */
  async getLeadById(id: string, currentUser: NonNullable<AuthRequest['user']>): Promise<Lead> {
    const lead = await this.leadRepo.findById(id);
    if (!lead) {
      throw new Error('Không tìm thấy thông tin nhà hàng yêu cầu!');
    }

    // Kiểm tra quyền hạn xem chi tiết
    if (currentUser.role === 'SALES' && lead.assignedTo !== currentUser.id) {
      throw new Error('Bạn không có quyền xem thông tin nhà hàng của nhân viên khác!');
    }

    return lead;
  }

  /**
   * 5. CẬP NHẬT THÔNG TIN / TRẠNG THÁI LEAD
   * TÍCH HỢP ĐẦY ĐỦ 4 QUY TẮC RÀNG BUỘC NGHIỆP VỤ
   */
  async updateLead(
    id: string,
    dto: UpdateLeadRequestDto,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<Lead> {
    const lead = await this.getLeadById(id, currentUser);
    const updates: Partial<Lead> = { ...dto };
    const today = new Date().toISOString().slice(0, 10);

    // QUY TẮC BẢO VỆ: Chỉ cho phép xóa nextCallDate (set về null) khi chuyển sang WON hoặc LOST (hoặc lead đã ở WON/LOST)
    if (dto.nextCallDate === null && dto.status !== 'WON' && dto.status !== 'LOST' && lead.status !== 'WON' && lead.status !== 'LOST') {
      throw new Error('Chỉ được xóa Ngày hẹn gọi lại khi chốt hợp đồng (WON) hoặc ghi nhận thất bại (LOST)!');
    }

    // Nếu cập nhật ngày hẹn gọi lại mới -> Kiểm tra không được chọn ngày trong quá khứ
    if (dto.nextCallDate && dto.nextCallDate < today) {
      throw new Error(`Ngày hẹn gọi lại (${dto.nextCallDate}) không được nằm trong quá khứ!`);
    }

    // QUY TẮC 1: Đổi sang nhóm bám đuổi (CALLING, LOW/HIGH INTERESTED, HOT_LEAD)
    // -> Bắt buộc có nextCallDate >= Today
    if (dto.status && LEAD_SHEET_STATUSES.FOLLOW_UP.includes(dto.status)) {
      const activeNextCall = dto.nextCallDate !== undefined ? dto.nextCallDate : lead.nextCallDate;

      if (!activeNextCall || activeNextCall.trim() === '') {
        throw new Error(
          `Bắt buộc phải cập nhật Ngày hẹn gọi lại (Next Call Date) khi chuyển sang trạng thái "${dto.status}"!`
        );
      }

      if (activeNextCall < today) {
        throw new Error(`Ngày hẹn gọi lại (${activeNextCall}) không được nằm trong quá khứ!`);
      }
      updates.nextCallDate = activeNextCall;
    }

    // QUY TẮC 2: Đổi sang WON -> Bắt buộc có dealValue > 0 và clear nextCallDate
    if (dto.status === 'WON') {
      const finalDealValue = dto.dealValue !== undefined ? dto.dealValue : lead.dealValue;
      if (!finalDealValue || finalDealValue <= 0) {
        throw new Error('Vui lòng nhập Giá trị hợp đồng (dealValue > 0) khi chốt deal thành công (WON)!');
      }
      updates.dealValue = finalDealValue;
      updates.nextCallDate = null; // Clear ngày hẹn vì quy trình bám đuổi đã hoàn thành
    }

    // QUY TẮC 3: Đổi sang LOST -> Bắt buộc có lostReason và clear nextCallDate
    if (dto.status === 'LOST') {
      const finalLostReason = dto.lostReason || lead.lostReason;
      if (!finalLostReason || finalLostReason.trim() === '') {
        throw new Error('Vui lòng cung cấp Lý do mất deal (lostReason) để hệ thống ghi nhận thống kê!');
      }
      updates.lostReason = finalLostReason;
      updates.nextCallDate = null; // Clear ngày hẹn
    }

    // QUY TẮC 4: Nếu có đổi hotline -> Quét chống trùng chéo số mới
    if (dto.hotline && dto.hotline !== lead.hotline) {
      const newClean = this.extractCleanPhone(dto.hotline);
      const existing = await this.leadRepo.findByCleanPhoneOrOwnerPhone(newClean);
      if (existing && existing.id !== id) {
        throw new Error(`Số điện thoại mới ${dto.hotline} đã trùng với nhà hàng "${existing.restaurantName}"!`);
      }
      updates.cleanPhone = newClean;
    }

    // Nếu có đổi SĐT chủ quán -> Quét chống trùng chéo
    if (dto.ownerPhone && dto.ownerPhone !== lead.ownerPhone) {
      const newOwnerClean = this.extractCleanPhone(dto.ownerPhone);
      if (newOwnerClean.length >= 10) {
        const existing = await this.leadRepo.findByCleanPhoneOrOwnerPhone(newOwnerClean);
        if (existing && existing.id !== id) {
          throw new Error(`Số điện thoại chủ quán mới ${dto.ownerPhone} đã trùng với nhà hàng "${existing.restaurantName}"!`);
        }
        updates.cleanOwnerPhone = newOwnerClean;
      }
    }

    // Ghi nhận mốc thời gian chuyển status để xếp các lead mới chuyển lên đầu Sheet (Follow-Up / Closed)
    if (dto.status && dto.status !== lead.status) {
      updates.statusUpdatedAt = new Date().toISOString();
    }

    const updated = await this.leadRepo.update(id, updates);
    if (!updated) {
      throw new Error('Cập nhật thông tin nhà hàng thất bại!');
    }

    return updated;
  }

  /**
   * 6. XÓA LEAD (CHỈ ADMIN HOẶC CHỦ SỞ HỮU LEAD)
   */
  async deleteLead(id: string, currentUser: NonNullable<AuthRequest['user']>): Promise<boolean> {
    const lead = await this.getLeadById(id, currentUser);
    return await this.leadRepo.delete(lead.id);
  }

  /**
   * Helper nội bộ chuẩn hóa dữ liệu bàn giao / thu hồi lead (dùng chung cho assignLead & bulkAssignLeads)
   */
  private async resolveAssignmentUpdates(
    targetSalesId: string,
    currentUser: NonNullable<AuthRequest['user']>,
    forbiddenMessage: string
  ): Promise<Partial<Lead>> {
    if (currentUser.role !== 'ADMIN') {
      throw new Error(forbiddenMessage);
    }

    const now = new Date().toISOString();
    if (targetSalesId === 'UNASSIGNED') {
      return {
        assignedTo: '',
        assignedPrefix: '',
        assignedName: 'Chưa phân công',
        updatedAt: now,
      };
    }

    const targetUser = await this.userRepo.findById(targetSalesId);
    if (!targetUser || !targetUser.isActive) {
      throw new Error('Nhân viên Sales tiếp nhận không tồn tại hoặc tài khoản đang bị khóa!');
    }

    return {
      assignedTo: targetUser.id,
      assignedPrefix: targetUser.salesPrefix || 'SR',
      assignedName: targetUser.fullName,
      updatedAt: now,
    };
  }

  /**
   * 7. ADMIN BÀN GIAO 1 LEAD CHO SALES VIÊN HOẶC THU HỒI VỀ KHO CHUNG
   */
  async assignLead(
    leadId: string,
    targetSalesId: string,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<Lead> {
    const updates = await this.resolveAssignmentUpdates(
      targetSalesId,
      currentUser,
      'Chỉ Quản trị viên (Admin) mới có quyền phân bổ hoặc điều chuyển lead!'
    );

    const lead = await this.leadRepo.findById(leadId);
    if (!lead) {
      throw new Error('Không tìm thấy nhà hàng yêu cầu bàn giao!');
    }

    const updated = await this.leadRepo.update(leadId, updates);
    if (!updated) {
      throw new Error('Cập nhật phân bổ lead thất bại!');
    }

    return updated;
  }

  /**
   * 8. ADMIN BÀN GIAO HÀNG LOẠT (BULK ASSIGN) TRONG <100MS BẰNG BATCH WRITE
   */
  async bulkAssignLeads(
    leadIds: string[],
    targetSalesId: string,
    currentUser: NonNullable<AuthRequest['user']>
  ): Promise<{ updatedCount: number }> {
    const updates = await this.resolveAssignmentUpdates(
      targetSalesId,
      currentUser,
      'Chỉ Quản trị viên (Admin) mới có quyền phân bổ lead hàng loạt!'
    );

    const updatedCount = await this.leadRepo.bulkUpdate(leadIds, updates);
    return { updatedCount };
  }
}
