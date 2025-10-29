// src/components/RealDemo/ChargingPostList.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import stationAPI from "../API/Station";

const ChargingPostList = () => {
    const { stationID } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stationName, setStationName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await stationAPI.getChargingStationId(stationID);
                console.log("Chi tiết trạm:", response);
                setStationName(response.stationName || "Trạm không tên");

                // Lấy trụ sạc từ response.chargingPosts
                const postArray = Array.isArray(response.chargingPosts) ? response.chargingPosts : [];
                setPosts(postArray);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách trụ sạc:", error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [stationID]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Danh sách trụ sạc của: {stationName}</h2>
            {posts.length === 0 ? (
                <p>Chưa có trụ sạc nào.</p>
            ) : (
                <Row gutter={[16, 16]}>
                    {posts.map((post) => (
                        <Col key={post.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                title={post.postName || "Trụ không tên"}
                                onClick={() =>
                                    navigate(`/station/${stationID}/post/${post.id}/guns`)
                                }
                            >
                                <p><strong>Trạng thái:</strong> {post.status || "Chưa có"}</p>
                                <p><strong>Loại cổng:</strong> {post.connectorType || "Chưa có"}</p>
                                <p><strong>Hỗ trợ:</strong> {post.vehicleTypeSupported || "Chưa có"}</p>
                                <p><strong>Công suất tối đa:</strong> {post.maxPowerKw || "Chưa có"} kW</p>
                                <p><strong>Số cổng:</strong> {post.totalConnectors || "Chưa có"}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default ChargingPostList;
