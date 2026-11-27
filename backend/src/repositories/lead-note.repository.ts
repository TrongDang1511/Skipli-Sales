/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/repositories/lead-note.repository.ts
 * PHÂN LOẠI: REPOSITORY (COLLECTION: lead_notes)
 * VAI TRÒ: Đọc & Ghi Lịch Sử Ghi Chú Cuộc Gọi Trên Firestore
 * ==============================================================================
 */

import { db, isFirebaseInitialized } from '../config/firebase.config';
import { LeadNote } from '../models/lead-note.model';

export class LeadNoteRepository {
  private collectionName = 'lead_notes';

  private getDb() {
    if (!isFirebaseInitialized || !db) {
      throw new Error('Database Firestore chưa được khởi tạo!');
    }
    return db;
  }

  /**
   * 1. LẤY TOÀN BỘ TIMELINE GHI CHÚ CỦA 1 LEAD (SẮP XẾP CŨ -> MỚI KIỂU CHAT)
   */
  async findByLeadId(leadId: string): Promise<LeadNote[]> {
    const snapshot = await this.getDb()
      .collection(this.collectionName)
      .where('leadId', '==', leadId)
      .get();

    const notes = snapshot.docs.map((doc) => doc.data() as LeadNote);
    // Sắp xếp tăng dần theo thời gian trong bộ nhớ để tránh phải tạo Composite Index trên Firestore
    notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return notes;
  }

  /**
   * 1.1 LẤY TOÀN BỘ LỊCH SỬ CUỘC GỌI (PHỤC VỤ THỐNG KÊ DASHBOARD ADMIN)
   */
  async findAll(): Promise<LeadNote[]> {
    const snapshot = await this.getDb().collection(this.collectionName).get();
    return snapshot.docs.map((doc) => doc.data() as LeadNote);
  }

  /**
   * 2. LƯU GHI CHÚ MỚI VÀO FIRESTORE
   */
  async create(note: LeadNote): Promise<LeadNote> {
    await this.getDb().collection(this.collectionName).doc(note.id).set(note);
    return note;
  }

  /**
   * 3. LƯU HÀNG LOẠT GHI CHÚ BAN ĐẦU KHI IMPORT EXCEL (400 DOCS/CHUNK)
   */
  async createBatch(notes: LeadNote[]): Promise<void> {
    if (notes.length === 0) return;
    const dbInstance = this.getDb();
    const notesRef = dbInstance.collection(this.collectionName);

    for (let i = 0; i < notes.length; i += 400) {
      const chunk = notes.slice(i, i + 400);
      const batch = dbInstance.batch();
      chunk.forEach((note) => {
        batch.set(notesRef.doc(note.id), note);
      });
      await batch.commit();
    }
  }
}
