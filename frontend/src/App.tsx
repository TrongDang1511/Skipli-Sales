import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { ActivateAccountPage } from './pages/ActivateAccountPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SalesWorkspacePage } from './pages/SalesWorkspacePage';
import { SalesLeadsPage } from './pages/SalesLeadsPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/guards/RouteGuards';
import { AdminLayout } from './components/layout/AdminLayout';
import { SalesLayout } from './components/layout/SalesLayout';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Tuyến Đường Công Khai: Chỉ xem khi CHƯA đăng nhập */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            {/* Tuyến Đường Kích Hoạt Tài Khoản: Dành cho Sales mới bấm từ link email Brevo */}
            <Route path="/activate" element={<ActivateAccountPage />} />

            {/* Tuyến Đường Quên & Đặt Lại Mật Khẩu */}
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPasswordPage />
                </PublicOnlyRoute>
              }
            />

            {/* Tuyến Đường Phân Hệ Quản Trị Viên (Admin) - Chia Route & Header Độc Lập */}
            <Route
              path="/"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              {/* Trang Dashboard Tổng Quan Doanh Số (Route /) */}
              <Route index element={<AdminDashboardPage />} />

              {/* Trang Quản Trị Nhân Viên Riêng Biệt (Route /users) */}
              <Route path="users" element={<UserManagementPage />} />

              {/* Trang Quản Trị & Phân Bổ Leads Toàn Hệ Thống (Route /leads) */}
              <Route path="leads" element={<AdminLeadsPage />} />
            </Route>

            {/* Tuyến Đường Bàn Làm Việc Sales: Phân Hệ Chuyên Viên Tiếp Cận & Chốt Deal */}
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <SalesLayout />
                </ProtectedRoute>
              }
            >
              {/* Trang Dashboard Tổng Quan Hiệu Suất Cá Nhân (Route /workspace) */}
              <Route index element={<SalesWorkspacePage />} />

              {/* Trang Quản Lý Leads Khách Hàng Tiềm Năng (Route /workspace/leads) */}
              <Route path="leads" element={<SalesLeadsPage />} />
            </Route>

            {/* Điều hướng mặc định nếu gõ sai đường dẫn */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
