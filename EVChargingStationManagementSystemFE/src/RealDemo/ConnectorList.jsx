// src/components/RealDemo/ConnectorList.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Tag } from "antd";
import { useParams } from "react-router-dom";
import { getChargingPostId } from "../API/ChargingPost";

const ConnectorList = () => {
    const { postID } = useParams(); // lấy ID trụ sạc từ route
    const [connectors, setConnectors] = useState([]);
    const [postInfo, setPostInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConnectors = async () => {
            setLoading(true);
            try {
                const response = await getChargingPostId(postID);
                console.log("Chi tiết trụ sạc:", response);

                // API trả về object { data: { id, connectors: [...] } }
                const data = response?.data || {};
                setPostInfo(data);
                setConnectors(Array.isArray(data.connectors) ? data.connectors : []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách connector:", error);
                setConnectors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchConnectors();
    }, [postID]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Danh sách súng sạc của: {postInfo?.postName || "Trụ sạc"}</h2>

            {/* Thông tin tổng quan trụ sạc */}
            {postInfo && (
                <Card style={{ marginBottom: 20 }}>
                    <p><strong>Loại cổng:</strong> {postInfo.connectorType}</p>
                    <p><strong>Phương tiện hỗ trợ:</strong> {postInfo.vehicleTypeSupported}</p>
                    <p><strong>Công suất tối đa:</strong> {postInfo.maxPowerKw} kW</p>
                    <p><strong>Tổng số cổng:</strong> {postInfo.totalConnectors}</p>
                    <p><strong>Số cổng khả dụng:</strong> {postInfo.availableConnectors}</p>
                    <p><strong>Trạng thái trụ:</strong> <Tag color="blue">{postInfo.status}</Tag></p>
                </Card>
            )}

            {/* Danh sách súng sạc */}
            {connectors.length === 0 ? (
                <p>Chưa có súng sạc nào.</p>
            ) : (
                <Row gutter={[16, 16]}>
                    {connectors.map((connector) => (
                        <Col key={connector.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                title={connector.connectorName || "Súng không tên"}
                            >
                                {/* <p><strong>ID:</strong> {connector.id}</p> */}
                                <p><strong>Trạng thái:</strong>
                                    <Tag color={connector.status === "Available" ? "green" : "red"}>
                                        {connector.status}
                                    </Tag>
                                </p>
                                {/* <p><strong>Ngày tạo:</strong> {new Date(connector.createdAt).toLocaleString()}</p>
                                <p><strong>Cập nhật:</strong> {new Date(connector.updatedAt).toLocaleString()}</p> */}
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default ConnectorList;
