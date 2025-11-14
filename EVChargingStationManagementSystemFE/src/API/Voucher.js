import api from "./axios";

const BASE_URL = "/Voucher";

export const GetVoucher = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách voucher:', error);
        throw error;
    }
}

export const PostVoucher = async (data) => {
    try {
        const response = await api.post(`${BASE_URL}`, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm mới voucher:', error);
        throw error;
    }
}

export const UpdateVoucher = async (voucherId, payload) => {
    try {
        const response = await api.put(`${BASE_URL}/${voucherId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật voucher ${voucherId}:`, error);
        throw error;
    }
}

export const DeleteVoucher = async (voucherId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${voucherId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa voucher ${voucherId}:`, error);
        throw error;
    }
}

export const RedeemVoucher = async (voucherId) => {
    try {
        const response = await api.post(`${BASE_URL}/redeem/${voucherId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi đổi voucher ${voucherId}:`, error);
        throw error;
    }
}

