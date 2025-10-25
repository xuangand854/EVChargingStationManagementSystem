import api from "./axios";

const BASE_URL = "/Booking";

export const addBooking = async (
    stationId,
    vehicleId,
    startTime,
    currentBattery,
    targetBattery
) => {
    try {
        const response = await api.post(`${BASE_URL}`, {
            stationId,
            vehicleId,
            startTime,
            currentBattery,
            targetBattery
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm mới booking:', error);
        throw error;
    }
}