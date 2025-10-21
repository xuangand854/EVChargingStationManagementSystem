import api from './axios';

const BASE_URL = '/Staff';

// GET: Fetch staff information by ID
export const getStaffInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching staff info:', error);
        throw error;
    }
};

//GET: Fetch all staff members
export const getAllStaff = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all staff:', error);
        throw error;
    }
};

// PATCH: Update staff status
export const updateStaffStatus = async (staffId, status) => {
    try {
        const response = await api.patch(`${BASE_URL}/status`, { staffId, status });
        return response.data;
    } catch (error) {
        console.error('Error updating staff status:', error);
        throw error;
    }
};

// // PUT: Update staff information (admin)
// export const updateStaffInfo = async (staffData) => {
//     try {
//         const response = await api.put(`${BASE_URL}/update/admin`, staffData);
//         return response.data;
//     } catch (error) {
//         console.error('Error updating staff info:', error);
//         throw error;
//     }
// };


export const updateStaffInfo = async (staffData) => {
    try {
        const response = await api.put(`${BASE_URL}/update/self`, staffData);
        return response.data;
    } catch (error) {
        console.error('Error updating staff info:', error);
        throw error;
    }
};

// POST: Create a new staff account
export const createStaffAccount = async (staffData) => {
    try {
        const response = await api.post(`${BASE_URL}/account`, staffData);
        return response.data;
    } catch (error) {
        console.error('Error creating staff account:', error);
        throw error;
    }
};

// DELETE: Delete staff by ID
export const deleteStaff = async (staffId) => {
    try {
        const response = await api.delete(`${BASE_URL}`, { params: { staffId } });
        return response.data;
    } catch (error) {
        console.error('Error deleting staff:', error);
        throw error;
    }
};

