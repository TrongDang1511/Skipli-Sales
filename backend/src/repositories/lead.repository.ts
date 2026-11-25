/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/repositories/lead.repository.ts
 * PHÂN LOẠI: REPOSITORY (TẦNG LƯU TRỮ DỮ LIỆU)
 * VAI TRÒ: Tương Tác Google Cloud Firestore Collection "leads" & Atomic Counter
 * ==============================================================================
 */

import * as admin from 'firebase-admin';
import { db, isFirebaseInitialized } from '../config/firebase.config';
import { Lead, LeadStatus } from '../models/lead.model';
import { LeadSheetKey, LeadScheduleFilter, LEAD_SHEET_STATUSES } from '../dtos';

export type LeadSheetCounts = Record<LeadSheetKey, number>;

// Helper nội bộ kiểm tra điều kiện Lịch gọi tiếp theo
function matchesScheduleFilter(
  nextCallDate: string | null | undefined,
  schedule: LeadScheduleFilter,
  today: string
): boolean {
  const datePart = nextCallDate ? nextCallDate.slice(0, 10) : '';
  switch (schedule) {
    case 'TODAY':
      return datePart === today;
    case 'OVERDUE':
      return Boolean(datePart) && datePart < today;
    case 'UPCOMING':
      return Boolean(datePart) && datePart > today;
    case 'UNSCHEDULED':
      return !datePart;
  }
}

export class LeadRepository {
  private collectionName = 'leads';
  private counterCollectionName = 'system_counters';

  /**
   * Kiểm tra và lấy instance của Firestore Database
   */
  private getDb() {
    if (!isFirebaseInitialized || !db) {
      throw new Error('Database Firestore chưa được khởi tạo! Vui lòng kiểm tra serviceAccountKey.json');
    }
    return db;
  }

  /**
   * 1. TÌM KIẾM TRÙNG CHÉO SỐ ĐIỆN THOẠI (<20MS)
   * Quét trên cả 2 Single-Field Index: cleanPhone (Hotline quán) và cleanOwnerPhone (SĐT chủ quán)
   */
  async findByCleanPhoneOrOwnerPhone(cleanPhone: string): Promise<Lead | null> {
    const leadsRef = this.getDb().collection(this.collectionName);

    // Bước 1: Quét trên trường cleanPhone (Hotline chính của quán)
    const hotlineSnap = await leadsRef.where('cleanPhone', '==', cleanPhone).limit(1).get();
    if (!hotlineSnap.empty) {
      return hotlineSnap.docs[0].data() as Lead;
    }

    // Bước 2: Quét trên trường cleanOwnerPhone (SĐT di động của chủ quán)
    const ownerSnap = await leadsRef.where('cleanOwnerPhone', '==', cleanPhone).limit(1).get();
    if (!ownerSnap.empty) {
      return ownerSnap.docs[0].data() as Lead;
    }

    return null;
  }

  /**
   * 2. SINH SỐ THỨ TỰ NGUYÊN TỬ CHO TIỀN TỐ CỦA SALES (ATOMIC TRANSACTION)
   * Sử dụng runTransaction cấp Database Lock để đảm bảo mã TR-1001, TR-1002 tăng tuần tự
   * không bao giờ bị nhảy cóc hoặc trùng lặp dưới mọi tải concurrency
   */
  async getNextLeadSequence(prefix: string): Promise<number> {
    const counterRef = this.getDb()
      .collection(this.counterCollectionName)
      .doc(`leads_${prefix.toUpperCase()}`);

    return await this.getDb().runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      let nextSeq = 1001; // Khởi đầu từ 1001 cho chuyên nghiệp

      if (doc.exists) {
        const currentSeq = doc.data()?.currentSequence || 1000;
        nextSeq = currentSeq + 1;
      }

      transaction.set(
        counterRef,
        { currentSequence: nextSeq, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return nextSeq;
    });
  }

  /**
   * 3. LƯU MỚI LEAD VÀO FIRESTORE
   */
  async create(lead: Lead): Promise<Lead> {
    await this.getDb().collection(this.collectionName).doc(lead.id).set(lead);
    return lead;
  }

  /**
   * 4. TÌM LEAD THEO ID
   */
  async findById(id: string): Promise<Lead | null> {
    const doc = await this.getDb().collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Lead;
  }

  /**
   * 5. TRUY VẤN DANH SÁCH LEADS CÓ LỌC, TÌM KIẾM, CHIA SHEET VÀ PHÂN TRANG
   */
  async findLeads(options: {
    assignedTo?: string;
    status?: LeadStatus;
    sheet?: LeadSheetKey;
    schedule?: LeadScheduleFilter;
    todayDate?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Lead[]; total: number; sheetCounts: LeadSheetCounts }> {
    const {
      assignedTo,
      status,
      sheet,
      schedule,
      todayDate,
      state,
      search,
      page = 1,
      limit = 25,
    } = options;

    let query: admin.firestore.Query = this.getDb().collection(this.collectionName);

    // Lọc theo người phụ trách (RBAC: Sales chỉ lấy lead của mình - Single-Field Index chuẩn)
    // Nếu Admin lọc 'UNASSIGNED' thì bỏ qua filter Firestore để lọc in-memory các lead trống
    if (assignedTo && assignedTo !== 'UNASSIGNED') {
      query = query.where('assignedTo', '==', assignedTo);
    }

    // LẤY DỮ LIỆU TỪ FIRESTORE (Chỉ dùng Single-Field Index để loại bỏ 100% lỗi FAILED_PRECONDITION đòi Composite Index)
    const snapshot = await query.get();
    let allLeads = snapshot.docs.map((doc) => doc.data() as Lead);

    // Lọc theo quán chưa phân công (nếu Admin chọn xem quán chưa gán người phụ trách)
    if (assignedTo === 'UNASSIGNED') {
      allLeads = allLeads.filter(
        (l) => !l.assignedTo || l.assignedTo.trim() === '' || l.assignedTo === 'UNASSIGNED'
      );
    }

    // Lọc theo bang trong bộ nhớ
    if (state) {
      allLeads = allLeads.filter((l) => l.state?.toUpperCase() === state.toUpperCase());
    }

    // Tìm kiếm trong bộ nhớ (hỗ trợ tìm theo tên quán, hotline, tên chủ quán hoặc mã lead)
    if (search && search.trim() !== '') {
      const keyword = search.toLowerCase().trim();
      allLeads = allLeads.filter(
        (l) =>
          l.restaurantName.toLowerCase().includes(keyword) ||
          l.cleanPhone.includes(keyword) ||
          (l.ownerName && l.ownerName.toLowerCase().includes(keyword)) ||
          l.leadCustomId.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo Lịch gọi tiếp theo trong bộ nhớ
    if (schedule) {
      const today = todayDate || new Date().toISOString().slice(0, 10);
      allLeads = allLeads.filter((l) => matchesScheduleFilter(l.nextCallDate, schedule, today));
    }

    // Đếm số lượng cho cả 3 Sheet TRƯỚC khi cắt theo sheet đang chọn
    const sheetCounts: LeadSheetCounts = { NEW: 0, FOLLOW_UP: 0, CLOSED: 0 };
    for (const lead of allLeads) {
      if (LEAD_SHEET_STATUSES.NEW.includes(lead.status)) sheetCounts.NEW += 1;
      else if (LEAD_SHEET_STATUSES.FOLLOW_UP.includes(lead.status)) sheetCounts.FOLLOW_UP += 1;
      else if (LEAD_SHEET_STATUSES.CLOSED.includes(lead.status)) sheetCounts.CLOSED += 1;
    }

    // Lọc theo Sheet (hoặc status đơn lẻ cho Admin)
    if (sheet) {
      const allowedStatuses = LEAD_SHEET_STATUSES[sheet];
      allLeads = allLeads.filter((l) => allowedStatuses.includes(l.status));
    } else if (status) {
      allLeads = allLeads.filter((l) => l.status === status);
    }

    // Sắp xếp thứ tự trong bộ nhớ Node.js (<1ms):
    // - Sheet Follow-Up / Closed: ưu tiên lead vừa chuyển status gần nhất lên đầu
    // - Sheet New / Mặc định: ưu tiên lead mới tạo lên đầu
    const getSortTime = (lead: Lead): number => {
      const timestamp =
        sheet === 'FOLLOW_UP' || sheet === 'CLOSED'
          ? lead.statusUpdatedAt || lead.updatedAt || lead.createdAt
          : lead.createdAt;
      return new Date(timestamp).getTime();
    };
    allLeads.sort((a, b) => getSortTime(b) - getSortTime(a));

    const total = allLeads.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = allLeads.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      sheetCounts,
    };
  }

  /**
   * 6. CẬP NHẬT THÔNG TIN LEAD (MERGE CÓ CHỌN LỌC)
   */
  async update(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const docRef = this.getDb().collection(this.collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;

    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(updatedData, { merge: true });
    return { ...(existing.data() as Lead), ...updatedData };
  }

  /**
   * 7. XÓA LEAD
   */
  async delete(id: string): Promise<boolean> {
    const docRef = this.getDb().collection(this.collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;

    await docRef.delete();
    return true;
  }

  /**
   * 8. CẬP NHẬT ĐỒNG LOẠT NHIỀU LEADS DÙNG FIRESTORE BATCH WRITE (<100MS)
   * Giúp Admin bàn giao 10-50 quán cùng một lúc trong 1 Network Round-trip duy nhất
   */
  async bulkUpdate(leadIds: string[], updates: Partial<Lead>): Promise<number> {
    const dbInstance = this.getDb();
    const batch = dbInstance.batch();
    const now = new Date().toISOString();

    leadIds.forEach((id) => {
      const docRef = dbInstance.collection(this.collectionName).doc(id);
      batch.set(docRef, { ...updates, updatedAt: now }, { merge: true });
    });

    await batch.commit();
    return leadIds.length;
  }
}
