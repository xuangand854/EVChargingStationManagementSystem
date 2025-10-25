import api from "./axios";

const BASE_URL = "/Transaction";

export const GetTransaction = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách transaction:', error);
        throw error;
    }
}

export const GetEVDriverTransaction = async () => {
    try {
        const response = await api.get(`${BASE_URL}/evdriver`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách transaction của EV Driver:', error);
        throw error;
    }
}

export const GetTransactionId = async (transactionId) => {
    try {
        const response = await api.get(`${BASE_URL}/${transactionId}`, { transactionId });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy transaction với id ${transactionId}:`, error);
        throw error;
    }
}