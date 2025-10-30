// src/components/RealDemo/StationList.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import stationAPI from "../API/Station";
// import LiquidGlass from 'liquid-glass-react'

const StationList = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStations = async () => {
            setLoading(true);
            try {
                const response = await stationAPI.getChargingStation();
                if (Array.isArray(response.data)) {
                    setStations(response.data);
                } else if (Array.isArray(response.data?.data)) {
                    setStations(response.data.data);
                } else {
                    console.error("Dữ liệu trả về không phải array:", response);
                    setStations([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách trạm:", error);
                setStations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Danh sách trạm sạc</h2>
            {stations.length === 0 ? (
                <p>Chưa có trạm sạc nào.</p>
            ) : (
                <Row gutter={[16, 16]}>
                    {stations.map((station) => {
                        const stationKey = station.id;
                        return (
                            <Col key={stationKey} xs={24} sm={12} md={8} lg={6}>
                                {/* <LiquidGlass
                                    displacementScale={64}
                                    blurAmount={0.1}
                                    saturation={130}
                                    aberrationIntensity={2}
                                    elasticity={0.35}
                                    cornerRadius={100}
                                    padding="8px 16px"> */}
                                <Card
                                    hoverable
                                    title={station.stationName || "Trạm không tên"}
                                    onClick={() =>
                                        navigate(`/station-list/${stationKey}/posts`)
                                    }
                                >
                                    <p><strong>Địa chỉ:</strong> {station.location || "Chưa có"}</p>
                                    <p><strong>Tỉnh/TP:</strong> {station.province || "Chưa có"}</p>
                                    <p><strong>Trạng thái:</strong> {station.status || "Chưa có"}</p>
                                </Card>
                                {/* </LiquidGlass> */}
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default StationList;
