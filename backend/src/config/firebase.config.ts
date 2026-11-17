import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { env } from './env.config';

let db: admin.firestore.Firestore | null = null;
let isFirebaseInitialized = false;

try {
  let serviceAccount: admin.ServiceAccount | null = null;

  // Đường dẫn tới serviceAccountKey.json
  const keyPath = path.resolve(__dirname, '../../', env.firebaseServiceAccountPath);

  if (fs.existsSync(keyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    console.log(`[Firebase] Tìm thấy file chứng thực tại: ${keyPath}`);
  } else {
    console.warn(`[Firebase Warning] Không tìm thấy file serviceAccountKey.json tại ${keyPath}`);
  }

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    isFirebaseInitialized = true;
    console.log('[Firebase] Đã kết nối Google Cloud Firestore thành công!');
  } else {
    console.error('[Firebase Fatal] Không có thông tin chứng thực hợp lệ.');
  }
} catch (error) {
  console.error('[Firebase Error] Lỗi khởi tạo Firebase Admin SDK:', error);
}

export { db, isFirebaseInitialized };
