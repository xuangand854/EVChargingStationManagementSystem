import { useState } from 'react';
// import jwtDecode from 'jwt-decode';
import api from './axios';
// import { roleSlugMap } from '../Utils/RoleSlugMap';

const BASE_URL = '/Auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`${BASE_URL}/login`, { email, password });
      const token = response.data;

      if (!token || typeof token !== 'string') {
        throw new Error('Đăng nhập thất bại: Token không hợp lệ');
      }

      const decoded = jwtDecode(token);
      const roleSlug = roleSlugMap[decoded.role] ?? 'unknown';

      // Lưu thông tin vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', decoded.nameid);
      localStorage.setItem('user_name', decoded.name);
      localStorage.setItem('email', decoded.email);
      localStorage.setItem('user_role', roleSlug);
      localStorage.setItem('user_role_raw', decoded.role);
      localStorage.setItem('user_avatar', decoded.avatar || '');

      return decoded;
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const register = async (email, password, name, phone) => { // đăng kí tài khoản
  try {
    const response = await api.post(
      `${BASE_URL}/register`,
      { email, password, name, phone }
    );
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}

export const confirmEmail = async (userId, code) => { // xác nhận email
  try {
    const response = await api.get(
      `/confirm-email`,
      { params: { userId, code } }
    );
    return response.data;
  } catch (error) {
    console.error('Error during email confirmation:', error);
    throw error;
  }
}

export const resendConfirmationEmail = async (email) => { // gửi lại email xác nhận
  try {
    const response = await api.post(
      `/resend-confirmation-email`,
      { email }
    );
    return response.data;

  } catch (error) {
    console.error('Error during resending confirmation email:', error);
    throw error;
  }
}

