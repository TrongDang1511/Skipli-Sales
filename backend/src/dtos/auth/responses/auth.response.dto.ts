/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: backend/src/dtos/auth/responses/auth.response.dto.ts
 * PHÂN LOẠI: AUTH / RESPONSE
 * VAI TRÒ: DTO Đầu Ra Trả Về Sau Khi Đăng Nhập / Làm Mới / Kích Hoạt (Server -> Client)
 * GHI CHÚ BẢO MẬT: CHỈ chứa accessToken và user. TUYỆT ĐỐI KHÔNG chứa refreshToken!
 * ==============================================================================
 */

import { UserResponseDto } from '../../user/responses/user.response.dto';

export interface AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
