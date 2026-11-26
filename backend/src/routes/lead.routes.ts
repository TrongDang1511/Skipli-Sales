/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/routes/lead.routes.ts
 * PHÂN LOẠI: ROUTE (ĐỊNH TUYẾN API)
 * VAI TRÒ: Khai Báo Các Đường Dẫn API Cho Phân Hệ Lead, Bảo Vệ Bằng requireAuth
 * ==============================================================================
 */

import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const leadController = new LeadController();

// Toàn bộ các API Leads đều bắt buộc phải đăng nhập (yêu cầu Bearer Access Token)
router.use(requireAuth);

// 1. Tạo Lead mới
router.post('/', (req, res) => leadController.create(req, res));

// 2. Lấy danh sách Leads (hỗ trợ lọc, tìm kiếm, phân trang và bảo mật RBAC)
router.get('/', (req, res) => leadController.getLeads(req, res));

// 3. Kiểm tra trùng số điện thoại thời gian thực (<20ms)
router.post('/check-phone', (req, res) => leadController.checkPhone(req, res));

// 4. Lấy chi tiết Lead theo ID
router.get('/:id', (req, res) => leadController.getById(req, res));

// 5. Cập nhật thông tin hoặc trạng thái Lead
router.patch('/:id', (req, res) => leadController.update(req, res));

// 6. Xóa Lead
router.delete('/:id', (req, res) => leadController.delete(req, res));

// 7. Bàn giao 1 Lead lẻ cho Sales (Chỉ Admin)
router.patch('/:id/assign', (req, res) => leadController.assignLead(req, res));

// 8. Bàn giao hàng loạt nhiều Leads cùng lúc (Chỉ Admin)
router.post('/bulk-assign', (req, res) => leadController.bulkAssign(req, res));

// 9. Lấy lịch sử ghi chú cuộc gọi của Lead
router.get('/:id/notes', (req, res) => leadController.getNotes(req, res));

// 10. Thêm ghi chú cuộc gọi mới (tự động +1 callCount và cập nhật latestNote)
router.post('/:id/notes', (req, res) => leadController.addNote(req, res));

export default router;
