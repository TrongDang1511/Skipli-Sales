# Skipli Sales Internal (CRM Bán Hàng Nội Bộ)

Hệ thống quản lý khách hàng và bàn làm việc bán hàng nội bộ của Skipli, thay thế 100% Google Sheets.

## Cấu trúc dự án
- `backend/`: Node.js 22 + Express + TypeScript + Firebase Admin Firestore (Port 5000)
- `frontend/`: React 18 + Vite 6 + Tailwind CSS + Lucide Icons (Port 5173)
- `serviceAccountKey.json`: Khóa chứng thực Google Cloud Firebase Admin

## Hướng dẫn chạy thử ở Local

### 1. Khởi động Backend:
```bash
cd backend
npm run dev
# Server lắng nghe tại: http://localhost:5000
```

### 2. Khởi động Frontend:
```bash
cd frontend
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```
