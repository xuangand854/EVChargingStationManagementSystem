import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import  { roleSlugMap } from '../Utils/RoleSlugMap';

const BASE_URL = 'https://localhost:7252/api'; // Thay thế bằng URL của backend

/**
 * Gửi yêu cầu đăng nhập đến API backend.
 * @param {Object} credentials - Thông tin đăng nhập gồm email, password, twoFactorCode, và twoFactorRecoveryCode.
 * @param {boolean} useCookies - Sử dụng cookie trong phiên đăng nhập.
 * @param {boolean} useSessionCookies - Sử dụng cookie phiên.
 * @returns {Promise} - Kết quả trả về từ API.
 */
export const login = async (credentials, useCookies = false, useSessionCookies = false) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/login?useCookies=${useCookies}&useSessionCookies=${useSessionCookies}`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const register = async (email, password) => { // đăng kí tài khoản
  try {
    const response = await axios.post(
      `${BASE_URL}/register`,
      { email, password },
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
