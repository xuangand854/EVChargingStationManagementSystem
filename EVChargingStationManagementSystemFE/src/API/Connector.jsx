import api from "./axios";
import { getChargingPostId } from "./ChargingPost";
const BASE_URL = "/Connector";

export const GetConnector = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách connector:', error);
        throw error;
    }
}

export const PostConnector = async (
    connectorName,
    getChargingPostId) => {
    try {
        const response = await api.post(`${BASE_URL}`, {
            connectorName,
            getChargingPostId
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm mới connector:', error);
        throw error;
    }
}
