// import React from 'react';
import api from "./axios";



const BASE_URL = "/VehicleModel";




export const getVehicleModels = async () => {
  try {
    const response = await api.get(`${BASE_URL}`);
    console.log('Danh Sách VehicleModel:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vehicleModel:', error);
    throw error;
  }
};

export const addVehicalModel = async (
  modelname,
  modelYear,
  vehicleType,
  batteryCapacityKWh,
  recommendedChargingPowerKW,
  imageUrl
) => {
  try {
    const response = await api.post(`${BASE_URL}`, {
      modelname,
      modelYear,
      vehicleType,
      batteryCapacityKWh,
      recommendedChargingPowerKW,
      imageUrl,
    });

    //debug
    console.log('thêm VehicalModel - Response:', response);
    console.log('Responese data:', response.data);

    return response.data;
  } catch (error) {
    console.error('lỗi khi thêm VehicleModel:', error);
    throw error;
  }
};


//updateVehicle 

export const updateVehicle = async (modelData) => {
  try {
    const response = await api.put(`${BASE_URL}`, modelData); {
      console.log('cập nhật VehicalModel - Responese', response);
      return response.data;
    }
  } catch (error) {
    console.error('lỗi khi cập nhật VehicleModel:', error);
    throw error;
  }
};

//delete
export const deleteVehicle = async (id) => {
  try {
    const response = await api.delete(`/VehicleModel`, {
      params: { vehicleModelId: id } // gửi id dưới dạng query param
    });
    console.log('xóa VehicleModel - Response', response);
    return response.data;
  } catch (error) {
    console.error('lỗi khi xóa VehicleModel', error);
    throw error;
  }
};


//lấy 1 xe theo ID
export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    console.log('chi tiết VehicleModel:', response.data);
    return response.data;
  } catch (error) {
    console.error('lỗi khi lấy chi tiết VehicleModel:', error);
    throw error;
  }
};

// cập nhật dựa vào trạng thái 
export const updateVehicleStatus = async (id, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/status`, {
      id,
      status,
    });
    console.log('cập nhật status VehicleModel - Responese', response.data);
    return response.data;
  } catch (error) {
    console.error('lỗi khi cập nhật status VehicleModel:', error);
    throw error;
  }
}


export default {
  getVehicleModels,
  addVehicalModel,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  updateVehicleStatus,
};


