import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lấy ngày định dạng YYYY-MM-DD theo múi giờ địa phương (tránh lệch ngày do UTC)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Tính điểm độ mạnh mật khẩu (0..3) dùng chung cho Kích hoạt & Đặt lại mật khẩu
 */
export function getPasswordStrength(password: string, minLength = 8): 0 | 1 | 2 | 3 {
  let score = 0;
  if (password.length >= minLength) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}
