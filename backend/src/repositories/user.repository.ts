/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/repositories/user.repository.ts
 * VAI TRÒ: Repository Pattern - Tương tác độc quyền với collection 'users' Firestore
 * ==============================================================================
 */

import { db, isFirebaseInitialized } from '../config/firebase.config';
import { User } from '../models/user.model';

export class UserRepository {
  private collectionName = 'users';

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
   * Helper truy vấn 1 User theo field bất kỳ (tránh lặp boilerplate Firestore)
   */
  private async findOneByField(field: keyof User, value: string): Promise<User | null> {
    const snapshot = await this.getDb()
      .collection(this.collectionName)
      .where(field, '==', value)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as User;
  }

  /**
   * 1. Tìm User theo Email (chuẩn hóa chữ thường, chống trùng)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOneByField('email', email.toLowerCase().trim());
  }

  /**
   * 2. Tìm User theo Token Kích Hoạt (khi Sales click vào link từ email)
   */
  async findByActivationToken(token: string): Promise<User | null> {
    return this.findOneByField('activationToken', token);
  }

  /**
   * 2.1 Tìm User theo Hash của Token Đặt Lại Mật Khẩu
   */
  async findByResetPasswordTokenHash(tokenHash: string): Promise<User | null> {
    return this.findOneByField('resetPasswordTokenHash', tokenHash);
  }

  /**
   * 3. Tìm User theo Sales Prefix (đảm bảo mỗi bạn Sales có tiền tố duy nhất, tránh trùng mã Lead)
   */
  async findBySalesPrefix(prefix: string): Promise<User | null> {
    return this.findOneByField('salesPrefix', prefix.toUpperCase().trim());
  }

  /**
   * 4. Tìm User theo Username (đảm bảo không trùng tên đăng nhập khi kích hoạt)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.findOneByField('username', username.toLowerCase().trim());
  }

  /**
   * 5. Tìm User theo Document ID
   */
  async findById(id: string): Promise<User | null> {
    const doc = await this.getDb().collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as User;
  }

  /**
   * 6. Lưu mới hoặc Cập nhật User (sử dụng merge để không ghi đè mất trường khác)
   */
  async save(user: User): Promise<User> {
    await this.getDb().collection(this.collectionName).doc(user.id).set(user, { merge: true });
    return user;
  }

  /**
   * 7. Lấy danh sách toàn bộ nhân viên (Dành riêng cho màn hình Quản lý Sales của Admin)
   */
  async findAll(): Promise<User[]> {
    const snapshot = await this.getDb()
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as User);
  }

  /**
   * 8. Xóa User theo ID (dành cho Admin khi muốn thu hồi tài khoản)
   */
  async delete(id: string): Promise<void> {
    await this.getDb().collection(this.collectionName).doc(id).delete();
  }
}
