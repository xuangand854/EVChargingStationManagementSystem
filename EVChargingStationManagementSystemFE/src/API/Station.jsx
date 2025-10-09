import api from "./axios";

const BASE_URL = "/ChargingStation";

export const getChargingStation = async () => {
  try {
    const response = await api.get(`${BASE_URL}`);
    console.log('Danh sách ChargingStation:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getChargingStation:', error);
    throw error;
  }
};

export const addChargingStation = async (
  stationName,
  location,
  province,
  latitude,
  longitude,
  operatorId
) => {
  try {
    const response = await api.post(`${BASE_URL}`, {
      stationName,
      location,
      province,
      latitude,
      longitude,
      operatorId,
    });
    console.log('addStation - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error addChargingStation:', error);
    throw error;
  }
};

export const updateChargingStation = async (id, stationData) => {
  try {
    const response = await api.put(`${BASE_URL}`, stationData, {
      params: { stationId: id } // query param
    });
    console.log('updateStation - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updateChargingStation:', error);
    throw error;
  }
};


export const deleteChargingStation = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}`, {
      params: { stationId: id } // đúng query param của BE
    });
    console.log('deleteStation - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleteChargingStation:', error);
    throw error;
  }
};



export const getChargingStationId = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    console.log('Chi tiết station:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getChargingStationId:', error);
    throw error;
  }
};

export const updateChargingStationStatus = async (id, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/status`, { id, status });
    console.log('updateStatus - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updateChargingStationStatus:', error);
    throw error;
  }
};

export default {
  getChargingStation,
  addChargingStation,
  deleteChargingStation,
  updateChargingStation,
  getChargingStationId,
  updateChargingStationStatus,
};
