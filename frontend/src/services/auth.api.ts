import { api, setAccessToken } from './api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  role: 'ADMIN' | 'SALES';
  salesPrefix: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const authApi = {
  // 1. Đăng nhập hệ thống (POST /api/auth/login)
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.data.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    return res.data;
  },

  // 2. Làm mới phiên đăng nhập (POST /api/auth/refresh)
  refresh: async () => {
    const res = await api.post('/auth/refresh');
    const token = res.data.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    return res.data;
  },

  // 3. Lấy thông tin user hiện tại (GET /api/auth/me)
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // 4. Kích hoạt tài khoản từ email (POST /api/auth/activate)
  activate: async (data: { token: string; username: string; password: string }) => {
    const res = await api.post('/auth/activate', data);
    const token = res.data.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    return res.data;
  },

  // 5. Đăng xuất an toàn (POST /api/auth/logout)
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  // 6. Lấy danh sách toàn bộ nhân viên (GET /api/users)
  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  // 7. Mời hoặc tạo nhân viên mới (POST /api/users/invite)
  inviteUser: async (data: {
    email: string;
    fullName: string;
    salesPrefix: string;
    mode: 'invite' | 'direct';
    directPassword?: string;
  }) => {
    const res = await api.post('/users/invite', data);
    return res.data;
  },

  // 8. Bật/tắt khóa tài khoản nhân viên (PATCH /api/users/:id/toggle-status)
  toggleUserStatus: async (userId: string) => {
    const res = await api.patch(`/users/${userId}/toggle-status`);
    return res.data;
  },

  // 9. Xóa tài khoản nhân viên (DELETE /api/users/:id)
  deleteUser: async (userId: string) => {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
  },
};
