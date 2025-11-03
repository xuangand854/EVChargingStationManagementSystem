// src/pages/Admin/Station/AdminStationDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getChargingStationId,
    updateChargingStationStatus,
    updateChargingStation,
} from "../../../API/Station";
import {
    getAllChargingPost,
    deleteChargingPost,
    addChargingPost,
    updateChargingPost,
    updateChargingPostStatus,
} from "../../../API/ChargingPost";
import {
    Card,
    Table,
    Button,
    Space,
    message,
    Select,
    Modal,
    Input,
    Form,
} from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AdminStationDetail = () => {
    const { stationId } = useParams();
    const navigate = useNavigate();

    const [station, setStation] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [staffModalVisible, setStaffModalVisible] = useState(false);
    const [selectedOperatorId, setSelectedOperatorId] = useState("");

    // 🔹 Load trạm & trụ
    const fetchStationAndPosts = async () => {
        setLoading(true);
        try {
            const stationRes = await getChargingStationId(stationId);
            // API này trả về có thể có dạng { data: {...} }
            const stationData = stationRes?.data || stationRes;
            setStation(stationData);

            const postRes = await getAllChargingPost(stationId);
            setPosts(Array.isArray(postRes) ? postRes : postRes?.data || []);
        } catch (error) {
            console.error("fetchStationAndPosts error:", error);
            message.error("Không thể tải dữ liệu trạm sạc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (stationId) fetchStationAndPosts();
    }, [stationId]);

    // 🔹 Cập nhật trạng thái trạm (không ảnh hưởng trụ)
    const handleChangeStationStatus = async (status) => {
        try {
            await updateChargingStationStatus(stationId, status);
            message.success("✅ Cập nhật trạng thái trạm thành công!");
            fetchStationAndPosts();
        } catch (error) {
            console.error("updateStationStatus error:", error);
            message.error("Không thể cập nhật trạng thái trạm!");
        }
    };

    // 🔹 Cập nhật nhân viên phụ trách
    const handleUpdateStaff = async () => {
        if (!selectedOperatorId) {
            message.warning("Vui lòng nhập mã nhân viên!");
            return;
        }
        try {
            await updateChargingStation(stationId, { operatorId: selectedOperatorId });
            message.success("✅ Cập nhật nhân viên phụ trách thành công!");
            setStaffModalVisible(false);
            fetchStationAndPosts();
        } catch (error) {
            console.error("updateStaff error:", error);
            message.error("Không thể cập nhật nhân viên!");
        }
    };

    // 🔹 Xóa trụ sạc
    const handleDeletePost = async (postId) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc muốn xóa trụ sạc này?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteChargingPost(postId);
                    message.success("🗑️ Xóa trụ sạc thành công!");
                    fetchStationAndPosts();
                } catch (error) {
                    console.error("deletePost error:", error);
                    message.error("Không thể xóa trụ sạc!");
                }
            },
        });
    };

    // 🔹 Sửa trụ sạc
    const handleEditPost = (post) => {
        setEditingPost(post);
        setModalVisible(true);
    };

    // 🔹 Thêm trụ sạc
    const handleAddPost = () => {
        setEditingPost(null);
        setModalVisible(true);
    };

    // 🔹 Lưu trụ sạc (add / update)
    const handleSavePost = async (values) => {
        try {
            const payload = {
                postName: values.postName,
                connectorType: values.connectorType,
                maxPowerKw: values.maxPowerKW,
                vehicleTypeSupported: values.vehicleTypeSupported,
                totalConnectors: values.totalConnectors,
                status: values.status || "Active",
                stationId: stationId,
            };

            if (editingPost) {
                await updateChargingPost(editingPost.id, payload);
                message.success("✅ Cập nhật trụ sạc thành công!");
            } else {
                await addChargingPost(payload);
                message.success("✅ Thêm trụ sạc thành công!");
            }

            setModalVisible(false);
            fetchStationAndPosts();
        } catch (error) {
            console.error("handleSavePost error:", error);
            message.error("Không thể lưu trụ sạc!");
        }
    };

    // 🔹 Cập nhật trạng thái trụ sạc
    const handleChangePostStatus = async (postId, newStatus) => {
        try {
            await updateChargingPostStatus(postId, newStatus);
            message.success("⚙️ Cập nhật trạng thái trụ sạc thành công!");
            fetchStationAndPosts();
        } catch (error) {
            console.error("updateChargingPostStatus error:", error);
            message.error("Không thể cập nhật trạng thái trụ!");
        }
    };

    const columns = [
        { title: "Tên trụ sạc", dataIndex: "postName", key: "postName" },
        { title: "Kiểu kết nối", dataIndex: "connectorType", key: "connectorType" },
        { title: "Loại xe hỗ trợ", dataIndex: "vehicleTypeSupported", key: "vehicleTypeSupported" },
        { title: "Số cổng", dataIndex: "totalConnectors", key: "totalConnectors" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(value) => handleChangePostStatus(record.id, value)}
                    style={{ width: 150 }}
                >
                    <Option value="Available">Available</Option>
                    <Option value="Busy">Busy</Option>
                    <Option value="Maintained">Maintained</Option>
                    <Option value="Faulty">Faulty</Option>
                </Select>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditPost(record)}>
                        Sửa
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeletePost(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/station")}
            >
                Quay lại danh sách trạm
            </Button>

            {station ? (
                <>
                    <Card
                        title={`Thông tin trạm: ${station.stationName}`}
                        className="mt-3"
                        extra={
                            <Space>
                                <Select
                                    value={station.status}
                                    onChange={handleChangeStationStatus}
                                    style={{ width: 150 }}
                                >
                                    <Option value="Active">Active</Option>
                                    <Option value="Inactive">Inactive</Option>
                                    <Option value="Discontinued">Discontinued</Option>
                                </Select>
                                <Button
                                    icon={<UserSwitchOutlined />}
                                    onClick={() => setStaffModalVisible(true)}
                                >
                                    Cập nhật nhân viên
                                </Button>
                            </Space>
                        }
                    >
                        <p><strong>Địa chỉ:</strong> {station.location}</p>
                        <p><strong>Tỉnh/Thành phố:</strong> {station.province}</p>
                        <p><strong>Nhân viên:</strong> {station.operatorName || "Chưa có"}</p>
                        <p><strong>Mã nhân viên:</strong> {station.operatorId || "Chưa có"}</p>
                    </Card>

                    <Card
                        title="Danh sách trụ sạc"
                        className="mt-4"
                        extra={<Button icon={<PlusOutlined />} onClick={handleAddPost}>Thêm trụ</Button>}
                    >
                        <Table
                            rowKey="id"
                            loading={loading}
                            dataSource={posts}
                            columns={columns}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>

                    {/* Modal thêm/sửa trụ */}
                    <Modal
                        title={editingPost ? "Cập nhật trụ sạc" : "Thêm trụ sạc"}
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        footer={null}
                    >
                        <Form
                            layout="vertical"
                            initialValues={
                                editingPost || {
                                    postName: "",
                                    connectorType: "css2",
                                    maxPowerKW: 50,
                                    vehicleTypeSupported: "Bike",
                                    totalConnectors: 1,
                                    status: "Available",
                                }
                            }
                            onFinish={handleSavePost}
                        >
                            <Form.Item
                                name="postName"
                                label="Tên trụ sạc"
                                rules={[{ required: true, message: "Vui lòng nhập tên trụ sạc" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item name="connectorType" label="Loại cổng sạc">
                                <Select>
                                    <Option value="css2">CSS2</Option>
                                    <Option value="ccs1">CCS1</Option>
                                    <Option value="type2">Type2</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="maxPowerKW"
                                label="Công suất tối đa (KW)"
                                rules={[{ required: true, message: "Vui lòng nhập công suất" }]}
                            >
                                <Input type="number" min={1} />
                            </Form.Item>

                            <Form.Item name="vehicleTypeSupported" label="Loại xe hỗ trợ">
                                <Select>
                                    <Option value="Bike">Xe máy</Option>
                                    <Option value="Car">Ô tô</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="totalConnectors"
                                label="Tổng số cổng"
                                rules={[{ required: true, message: "Vui lòng nhập số cổng" }]}
                            >
                                <Input type="number" min={1} />
                            </Form.Item>

                            <Form.Item name="status" label="Trạng thái trụ">
                                <Select>
                                    <Option value="Available">Available</Option>
                                    <Option value="Busy">Busy</Option>
                                    <Option value="Maintained">Maintained</Option>
                                    <Option value="Faulty">Faulty</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    {editingPost ? "Cập nhật" : "Thêm"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* Modal cập nhật nhân viên */}
                    <Modal
                        title="Cập nhật nhân viên phụ trách"
                        open={staffModalVisible}
                        onCancel={() => setStaffModalVisible(false)}
                        onOk={handleUpdateStaff}
                        okText="Lưu"
                        cancelText="Hủy"
                    >
                        <Form layout="vertical">
                            <Form.Item label="Mã nhân viên mới">
                                <Input
                                    placeholder="Nhập mã nhân viên (operatorId)"
                                    value={selectedOperatorId}
                                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
            ) : (
                <p>Đang tải dữ liệu...</p>
            )}
        </div>
    );
};

export default AdminStationDetail;
