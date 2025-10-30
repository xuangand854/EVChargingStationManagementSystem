import api from "./axios";
const BASE_URL = "/ChargingSession";

export const GetChargingSessions = async () => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiên sạc:', error);
        throw error;
    }
}

export const GetSessionId = async (Id) => {
    try {
        const response = await api.get(`${BASE_URL}/${Id}`, { Id });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy phiên sạc theo Id:', error);
        throw error;
    }
}

export const StartSession = async (
    // bookingId,
    batteryCapacityKWh,
    initialBatteryLevelPercent,
    expectedEnergiesKWh,
    // phone,
    connectorId,
    // vehicleModelId
) => {
    try {
        const response = await api.post(`${BASE_URL}/Start`, {
            // bookingId,
            batteryCapacityKWh,
            initialBatteryLevelPercent,
            expectedEnergiesKWh,
            // phone,
            connectorId,
            // vehicleModelId
        });
        return response.data;
    } catch (error) {
        console.error('Đã có lỗi xảy ra khi cắm sạc', error);
        throw error;
    }
}

// export const Stop = async (sessionId, energyDeliveredKWh) => {
//     try {
//         const response = await api.patch(`${BASE_URL}/Stop`, {
//             sessionId,
//             energyDeliveredKWh
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Đã có lỗi khi dừng phiên sạc: ', error);
//         throw error;
//     }
// }
export const Stop = async (sessionId, energyDeliveredKWh) => {
    try {
        const response = await api.patch(
            `${BASE_URL}/Stop?sessionId=${sessionId}`, // 👈 đưa sessionId lên query
            { energyDeliveredKWh } // 👈 body chỉ còn field này
        );
        return response.data;
    } catch (error) {
        console.error('Đã có lỗi khi dừng phiên sạc: ', error);
        throw error;
    }
};
