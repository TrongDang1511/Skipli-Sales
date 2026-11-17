import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkBackendHealth() {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Không thể kết nối đến Backend',
    };
  }
}
