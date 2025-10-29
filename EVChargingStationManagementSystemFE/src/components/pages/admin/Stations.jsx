import React, { useEffect, useState } from "react";
import {
    Table,
    Modal,
    Form,
    Input,
    Button,
    Space,
    message,
    Card,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
    getChargingStation,
    addChargingStation,
    deleteChargingStation,
} from "../../../API/Station";

const AdminStation = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 📦 Load danh sách trạm
    const fetchStations = async () => {
        setLoading(true);
        try {
            const response = await getChargingStation();
            setStations(response.data || response);
        } catch (error) {
            console.error("Error loading stations:", error);
            message.error("Không thể tải danh sách trạm sạc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    // ➕ Mở modal thêm mới
    const openAddModal = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    // 🟢 Thêm trạm mới
    const handleAddStation = async () => {
        try {
            const values = await form.validateFields();
            await addChargingStation(
                values.stationName,
                values.location,
                values.province,
                values.latitude,
                values.longitude
            );
            message.success("Thêm trạm mới thành công!");
            setIsModalOpen(false);
            form.resetFields();
            fetchStations();
        } catch (error) {
            console.error("Error adding station:", error);
            message.error("Có lỗi xảy ra khi thêm trạm!");
        }
    };

    // 🔴 Xóa trạm
    const handleDelete = async (stationId) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc muốn xóa trạm này không?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: async () => {
                try {
                    await deleteChargingStation(stationId);
                    message.success("Xóa trạm thành công!");
                    fetchStations();
                } catch (error) {
                    console.error("Error deleting station:", error);
                    message.error("Không thể xóa trạm!");
                }
            },
        });
    };

    const handleViewDetail = (stationId) => {
        console.log("Station ID:", stationId); // kiểm tra log
        navigate(`/admin/station/${stationId}`); // 🔹 dùng đúng route bạn đã khai báo
    };


    const columns = [
        {
            title: "Tên trạm",
            dataIndex: "stationName",
            key: "stationName",
        },
        {
            title: "Vị trí",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "Tỉnh/Thành phố",
            dataIndex: "province",
            key: "province",
        },
        {
            title: "Vĩ độ",
            dataIndex: "latitude",
            key: "latitude",
        },
        {
            title: "Kinh độ",
            dataIndex: "longitude",
            key: "longitude",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết & chỉnh sửa">
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleViewDetail(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDelete(record.stationId)}
                        />
                    </Tooltip>
                </Space>
            ),
        },

    ];

    return (
        <Card
            title="Quản lý trạm sạc"
            extra={
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchStations}
                        loading={loading}
                    >
                        Tải lại
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                    >
                        Thêm trạm mới
                    </Button>
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={stations}
                rowKey="stationId"
                loading={loading}
                pagination={{ pageSize: 6 }}
            />

            {/* Modal thêm trạm */}
            <Modal
                title="Thêm trạm mới"
                open={isModalOpen}
                onOk={handleAddStation}
                onCancel={() => setIsModalOpen(false)}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Tên trạm"
                        name="stationName"
                        rules={[{ required: true, message: "Nhập tên trạm!" }]}
                    >
                        <Input placeholder="Nhập tên trạm" />
                    </Form.Item>

                    <Form.Item
                        label="Vị trí"
                        name="location"
                        rules={[{ required: true, message: "Nhập vị trí!" }]}
                    >
                        <Input placeholder="VD: Hải Châu, Đà Nẵng" />
                    </Form.Item>

                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="province"
                        rules={[{ required: true, message: "Nhập tỉnh/thành phố!" }]}
                    >
                        <Input placeholder="VD: Đà Nẵng" />
                    </Form.Item>

                    <Form.Item
                        label="Vĩ độ"
                        name="latitude"
                        rules={[{ required: true, message: "Nhập vĩ độ!" }]}
                    >
                        <Input type="number" placeholder="VD: 16.0471" />
                    </Form.Item>

                    <Form.Item
                        label="Kinh độ"
                        name="longitude"
                        rules={[{ required: true, message: "Nhập kinh độ!" }]}
                    >
                        <Input type="number" placeholder="VD: 108.2068" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AdminStation;
