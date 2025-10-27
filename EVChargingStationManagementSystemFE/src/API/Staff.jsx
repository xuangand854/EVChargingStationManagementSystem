// src/API/Staff.js
import api from './axios';

const BASE_URL = '/staff'; // ← chữ thường

export const getAllStaff = async () => {
    const { data } = await api.get(BASE_URL);
    return data; // { data: [...], message: "..." }
};

export const createStaffAccount = async (staffData) => {
    const { data } = await api.post(`${BASE_URL}/account`, staffData);
    return data;
};

export const updateStaffInfo = async (staffData) => {
    const { data } = await api.put(`${BASE_URL}/update/admin`, staffData);
    return data;
};

export const updateStaffStatus = async (staffId, status) => {
    const { data } = await api.patch(`${BASE_URL}/status`, { staffId, status });
    return data;
};

export const deleteStaff = async (staffId) => {
    const { data } = await api.delete(BASE_URL, { params: { staffId } });
    return data;
};