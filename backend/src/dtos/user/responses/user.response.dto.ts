/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/user/responses/user.response.dto.ts
 * PHÂN LOẠI: USER / RESPONSE
 * VAI TRÒ: DTO Đầu Ra Dữ Liệu Người Dùng Trả Về Cho Client (Server -> Client)
 * ==============================================================================
 */

import { UserRole } from '../../../models/user.model';

export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  role: UserRole;
  salesPrefix: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UserListResponseDto {
  users: UserResponseDto[];
}
