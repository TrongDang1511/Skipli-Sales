import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Lock,
  Unlock,
  Trash2,
  UserPlus,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authApi, UserProfile } from '../services/auth.api';
import { UserManagementModal } from '../components/user/UserManagementModal';

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Tải danh sách nhân viên THỰC TẾ từ Database Backend qua API
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await authApi.getAllUsers();
      if (res.data?.users) {
        setUsersList(res.data.users);
      }
    } catch (err: any) {
      console.error('Lỗi lấy danh sách nhân sự:', err);
      toast.error('Không thể tải danh sách nhân viên từ máy chủ.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Thao tác Bật/Tắt khóa tài khoản THẬT qua Backend API
  const handleToggleStatus = async (targetId: string, currentStatus: boolean, fullName: string) => {
    try {
      await authApi.toggleUserStatus(targetId);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, isActive: !currentStatus } : u))
      );
      toast.success(
        `Đã ${currentStatus ? 'tạm khóa' : 'mở khóa'} tài khoản ${fullName} thành công!`
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại!';
      toast.error(msg);
    }
  };

  // Thao tác Xóa tài khoản THẬT qua Backend API
  const handleDeleteUser = async (targetId: string, fullName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${fullName}" khỏi hệ thống?`)) {
      return;
    }

    try {
      await authApi.deleteUser(targetId);
      setUsersList((prev) => prev.filter((u) => u.id !== targetId));
      toast.success(`Đã xóa nhân viên ${fullName} thành công!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Xóa nhân viên thất bại!';
      toast.error(msg);
    }
  };

  // Lọc theo từ khóa tìm kiếm và trạng thái
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.salesPrefix.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ACTIVE') return matchesSearch && u.isActive;
    if (statusFilter === 'INACTIVE') return matchesSearch && !u.isActive;
    return matchesSearch;
  });

  return (
    <>
      {/* ======================================================================= */}
      {/* HEADER RIÊNG CỦA ROUTE QUẢN TRỊ NHÂN VIÊN                               */}
      {/* ======================================================================= */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Quản Trị Nhân Viên</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Trị Nhân Viên Sales
          </h1>
        </div>

        {/* Cụm Điều Khiển Bên Phải */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Bộ Lọc Ngày */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Th11 - 19 Th11, 2026</span>
          </div>

          {/* Nút Xuất Dữ Liệu */}
          <button
            type="button"
            onClick={() => toast.success('Đã tải xuống danh sách nhân viên định dạng Excel.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Xuất Dữ Liệu</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* Nút Làm Mới Dữ Liệu */}
          <button
            type="button"
            onClick={fetchUsers}
            title="Làm mới dữ liệu từ máy chủ"
            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Nút Thông Báo Bell */}
          <button
            type="button"
            onClick={() => toast.success('Hệ thống đang hoạt động ổn định. Không có cảnh báo nhân sự.')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {/* Avatar Mini Admin */}
          <div className="w-8 h-8 rounded-full bg-[#071E3D] text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs">
            {user?.salesPrefix || 'SH'}
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* NỘI DUNG CHÍNH: BẢNG CRUD NHÂN VIÊN FIRESTORE                           */}
      {/* ======================================================================= */}
      <main className="p-6 sm:p-8 space-y-5">
        {/* Thanh Lọc, Tìm Kiếm & Nút Thêm Nhân Viên DUY NHẤT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email hoặc tiền tố SH/TR..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-sky-100 text-sky-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'INACTIVE'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tạm khóa
              </button>
            </div>

            {/* Nút Thêm Nhân Viên Duy Nhất (Đã loại bỏ nút trùng lặp) */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm Nhân Viên</span>
            </button>
          </div>
        </div>

        {/* Bảng Danh Sách Nhân Viên CRUD Firestore */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Nhân Viên</th>
                  <th className="py-3.5 px-6">Vai Trò</th>
                  <th className="py-3.5 px-6">Mã Tiền Tố Prefix</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6">Ngày Tạo</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Đang tải danh sách nhân viên từ Firestore...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy nhân viên nào phù hợp với từ khóa "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cột Tên & Email */}
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border text-xs shadow-2xs shrink-0 ${
                            item.role === 'ADMIN'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-sky-50 border-sky-200 text-sky-700'
                          }`}
                        >
                          {item.salesPrefix}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{item.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{item.email}</div>
                        </div>
                      </td>

                      {/* Badge Vai trò (Role) */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                            item.role === 'ADMIN'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                              : 'bg-sky-50 text-sky-700 border-sky-200/80'
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>

                      {/* Mã tiền tố Prefix */}
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-lg font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                          {item.salesPrefix}
                        </span>
                      </td>

                      {/* Badge Trạng thái */}
                      <td className="py-3.5 px-6">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang Hoạt Động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Tạm Khóa
                          </span>
                        )}
                      </td>

                      {/* Cột Ngày Tạo */}
                      <td className="py-3.5 px-6 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Thao tác (Khóa / Mở khóa & Xóa) */}
                      <td className="py-3.5 px-6 text-right space-x-1.5">
                        {item.role !== 'ADMIN' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(item.id, item.isActive, item.fullName)
                              }
                              title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.isActive
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {item.isActive ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item.id, item.fullName)}
                              title="Xóa nhân viên"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Quản Trị / Thêm Nhân Viên Mới */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={(newUser) => {
          setUsersList((prev) => [newUser, ...prev]);
          setIsModalOpen(false);
          toast.success(`Đã thêm thành công nhân viên ${newUser.fullName}!`);
        }}
      />
    </>
  );
};

export default UserManagementPage;
