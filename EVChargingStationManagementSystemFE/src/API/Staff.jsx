// import { useState } from 'react';
import api from './axios';


const BASE_URL = '/Staff';
export const getStaffInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data; // trả về thông tin nhân viên
    }catch (error) {
        console.error('Error fetching staff info:', error);
        throw error;
    }
}