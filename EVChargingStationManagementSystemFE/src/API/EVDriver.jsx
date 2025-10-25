import api from "./axios";

const BASE_URL = "/EVDriver";

export const GetAllEVDrivver = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách EVDriver:', error);
        throw error;
    }
}

export const GetEVDriverId = async (driverId) => {
    try {
        const response = await api.get(`${BASE_URL}/${encodeURIComponent(driverId)}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy EVDriver ${driverId}:`, error);
        throw error;
    }
}

export const DeleteEVDriver = async (driverId) => {
    try {
        // driverId là path param: /api/EVDriver/{driverId}
        const response = await api.delete(`${BASE_URL}/${encodeURIComponent(driverId)}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xoá EVDriver ${driverId}:`, error);
        throw error;
    }
}

export const UpdateEVDriver = async (
    driverId,
    status
) => {
    try {
        const response = await api.patch(`${BASE_URL}/${driverId}/status`, { driverId, status });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật EVDriver ${driverId}:`, error);
        throw error;
    }
}

export const GetEVDriverProfile = async () => {
    try {
        const response = await api.get(`${BASE_URL}/profile`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin EVDriver:', error);
        throw error;
    }
}
