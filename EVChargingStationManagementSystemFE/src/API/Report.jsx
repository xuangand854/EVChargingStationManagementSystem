import React from 'react'
import api from './axios' 

const BASE_URL = "/Report";


export const getReport = async ()=> {
    try {
        const response = await api.get(`${BASE_URL}`);
        console.log('Lấy Danh Sách Thành Công',response);
        return response;
    } catch (error) {
        console.log('Lỗi lấy danh sách',error);
        throw error
    }
}
export const addReport = async (
    title,
    reportType,
    severity,
    description,
    stationId,
    postId
) => {
    try {
        const response = await api.post(`${BASE_URL}`,{
            title,
            reportType,
            severity,
            description,
            stationId,
            postId 
        });
        console.log('Thêm Thành Công Report',response.data);
        return response.data;
    } catch (error) {
        console.log('Lỗi thêm report',error);
        throw error;
    }
}
export const addReportByEVDriver = async(
    title,
    reportType,
    severity,
    description

) =>{
    try {
        const response = await api.post(`${BASE_URL}/evdriver/report`,{
            title,
            reportType,
            severity,
            description
        })
        console.log("ReportByUserSucces",response)
        return response.data
    } catch (error) {
        console.error("ErrorSendReport",error)
        throw error
    }
}



export default {
    addReport,
    getReport,
    addReportByEVDriver
}
