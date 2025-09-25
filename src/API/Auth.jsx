import { useState } from 'react';
import jwtDecode from 'jwt-decode';
import api from './axios';
import { roleSlugMap } from '../Utils/RoleSlugMap';


/**
 * Gửi yêu cầu đăng nhập đến API backend.
 * @param {Object} credentials - Thông tin đăng nhập gồm email, password, twoFactorCode, và twoFactorRecoveryCode.
 * @param {boolean} useCookies - Sử dụng cookie trong phiên đăng nhập.
 * @param {boolean} useSessionCookies - Sử dụng cookie phiên.
 * @returns {Promise} - Kết quả trả về từ API.
 */
export async function login(email: string, password: string): Promise<DecodedToken> {
  const response = await api.post("/Auth/login", { email, password });

  const token = response.data;

  if (!token || typeof token !== "string") {
    throw new Error("Đăng nhập thất bại: Token không hợp lệ");
  }

  const decoded: DecodedToken = jwtDecode(token);
  const roleSlug = roleSlugMap[decoded.role] ?? "unknown";

  localStorage.setItem("token", token);
  localStorage.setItem("user_id", decoded.nameid);
  localStorage.setItem("user_name", decoded.name);
  localStorage.setItem("email", decoded.email);
  localStorage.setItem("user_role", roleSlug);
  localStorage.setItem("user_role_raw", decoded.role);
  localStorage.setItem("user_avatar", decoded.avatar || "");

  return decoded;
}

export const register = async (email, password, name, phone) => { // đăng kí tài khoản
  try {
    const response = await axios.post(
      `${BASE_URL}/Auth/register`,
      { email, password, name, phone },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}

export const confirmEmail = async (userId, code) => { // xác nhận email
  try {
    const response = await axios.get(
      `${BASE_URL}/confirm-email`,
      { userId, code },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error during email confirmation:', error);
    throw error;
  }
}

export const resendConfirmationEmail = async (email) => { // gửi lại email xác nhận
  try {
    const response = await axios.post(
      `${BASE_URL}/resend-confirmation-email`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
    
  } catch (error) {
    console.error('Error during resending confirmation email:', error);
    throw error;
  }
}

