// src/API/Staff.js
import api from './axios';

const BASE_URL = '/Staff';

// Lấy tất cả nhân viên
export const getAllStaff = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all staff:', error);
        throw error;
    }
};

// Tạo tài khoản nhân viên mới
export const createStaffAccount = async (staffData) => {
    try {
        const response = await api.post(`${BASE_URL}/account`, staffData);
        return response.data;
    } catch (error) {
        console.error('Error creating staff account:', error);
        throw error;
    }
};

// Cập nhật thông tin (Admin) — không có staffId trong URL
export const updateStaffInfo = async (staffData) => {
    try {
        const response = await api.put(`${BASE_URL}/update/admin`, staffData);
        return response.data;
    } catch (error) {
        console.error('Error updating staff info:', error);
        throw error;
    }
};

// Cập nhật trạng thái
export const updateStaffStatus = async (staffId, status) => {
    try {
        const response = await api.patch(`${BASE_URL}/status`, { staffId, status });
        return response.data;
    } catch (error) {
        console.error('Error updating staff status:', error);
        throw error;
    }
};

// Xóa nhân viên
export const deleteStaff = async (staffId) => {
    try {
        const response = await api.delete(`${BASE_URL}`, { params: { staffId } });
        return response.data;
    } catch (error) {
        console.error('Error deleting staff:', error);
        throw error;
    }
};
