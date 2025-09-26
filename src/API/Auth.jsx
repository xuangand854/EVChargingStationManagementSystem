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

      // Chỉ lưu token, không decode tại đây
      localStorage.setItem('token', token);

      return token;
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

export const login = async (email, password) => { // đăng nhập
  try {
    const response = await api.post(
      `${BASE_URL}/login`,
      { email, password }
    );
    return response.data; // trả về token
  } catch (error) {
    console.error('Error during login:', error);
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

