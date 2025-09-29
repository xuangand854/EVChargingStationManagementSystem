import { useState } from 'react';
// import jwtDecode from 'jwt-decode';
import api from './axios';
// import { roleSlugMap } from '../Utils/RoleSlugMap';

const BASE_URL = '/Auth';
//lay value goi api theo key 



export const getAuthStatus = () => {
  const token = localStorage.getItem('token');

  // Debug: Log token để kiểm tra
  console.log('Token từ localStorage:', token);

  if (token) {
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

    // Debug: Log toàn bộ response để xem cấu trúc
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Type of response.data:', typeof response.data);

    const token = response.data;

    // Kiểm tra nếu token là object, lấy trường token
    let actualToken;
    if (typeof token === 'object' && token !== null) {
      // Thử các trường có thể chứa token
      actualToken = token.token || token.accessToken || token.access_token || token.jwt;
      console.log('Token từ object:', actualToken);
    } else if (typeof token === 'string') {
      actualToken = token;
    } else {
      throw new Error('Token không hợp lệ: không phải string hoặc object');
    }

    if (!actualToken) {
      throw new Error('Không tìm thấy token trong response');
    }

    // Decode token để lấy thông tin user
    const decoded = jwtDecode(actualToken);

    // Lưu token và thông tin user vào localStorage
    localStorage.setItem("token", actualToken);
    localStorage.setItem("user_id", decoded.nameid || decoded.userId || decoded.sub || "");
    localStorage.setItem("user_name", decoded.name || "");
    localStorage.setItem("email", decoded.email || "");
    localStorage.setItem("user_role", decoded.role || "customer");
    localStorage.setItem("user_role_raw", decoded.role || "customer");
    localStorage.setItem("user_avatar", decoded.avatar || "");

    // Log để debug
    console.log('Token đã lưu:', actualToken);
    console.log('User info đã lưu:', {
      userId: decoded.nameid || decoded.userId || decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    });

    return {
      token: actualToken,
      user: {
        userId: decoded.nameid || decoded.userId || decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar
      }
    };

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


