import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { ActivateAccountPage } from './pages/ActivateAccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SalesWorkspacePage } from './pages/SalesWorkspacePage';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/guards/RouteGuards';
import { AdminLayout } from './components/layout/AdminLayout';

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
            </Route>

            {/* Tuyến Đường Bàn Làm Việc Sales: Dành cho nhân viên chốt deal */}
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <SalesWorkspacePage />
                </ProtectedRoute>
              }
            />

            {/* Điều hướng mặc định nếu gõ sai đường dẫn */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
