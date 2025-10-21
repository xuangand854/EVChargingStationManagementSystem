import api from "./axios";

const BASE_URL = "/SystemConfiguration";

export const GetList = async () => {
    try {
        const response = await api.get(`${BASE_URL}/GetList`);
        console.log('Danh sách SystemConfiguration:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error GetList SystemConfiguration:', error);
        throw error;
    }
}

// Update một cấu hình theo id
export const Update = async (id, payload) => {
    try {
        const response = await api.put(`${BASE_URL}/Update/${id}`, payload);
        console.log(`SystemConfiguration ${id} updated:`, response.data);
        return response.data;
    } catch (error) {
        console.error('Error Update SystemConfiguration:', error);
        throw error;
    }
}

