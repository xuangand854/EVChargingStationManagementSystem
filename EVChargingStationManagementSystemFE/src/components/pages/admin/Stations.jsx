import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Select, Card, Tag, Space, message, Tooltip, Progress } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import axios from "axios";
import "./Stations.css";

const AdminStations = () => {
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const fetchStations = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/stations");
            const data = Array.isArray(res.data) ? res.data : [];
            setStations(data);
            setFilteredStations(data);
        } catch (error) {
            console.error("Error fetching stations:", error);
            message.error("Không thể tải danh sách trạm sạc");
            setStations([]);
            setFilteredStations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (Array.isArray(stations)) {
            const filtered = stations.filter(station =>
                station.stationName?.toLowerCase().includes(searchText.toLowerCase()) ||
                station.address?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredStations(filtered);
        }
    }, [searchText, stations]);

    const handleSave = async (values) => {
        try {
            if (editingStation) {
                await axios.put(`/api/stations/${editingStation.stationID}`, values);
                message.success("Cập nhật trạm sạc thành công!");
            } else {
                await axios.post("/api/stations", values);
                message.success("Thêm trạm sạc thành công!");
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingStation(null);
            fetchStations();
        } catch (error) {
            message.error("Có lỗi xảy ra khi lưu trạm sạc!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/stations/${id}`);
            message.success("Xóa trạm sạc thành công!");
            fetchStations();
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa trạm sạc!");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "green";
            case "Inactive": return "red";
            case "Maintenance": return "orange";
            default: return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "Active": return "Hoạt động";
            case "Inactive": return "Tạm dừng";
            case "Maintenance": return "Bảo trì";
            default: return status;
        }
    };

    const columns = [
        {
            title: "Thông tin trạm",
            key: "info",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                        <ThunderboltOutlined />
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{record.stationName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <EnvironmentOutlined size={12} />
                            {record.address}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Cổng sạc",
            key: "chargers",
            render: (_, record) => (
                <div>
                    <div className="text-sm font-medium">
                        {record.activeChargers || 0}/{record.totalChargers || 0} đang hoạt động
                    </div>
                    <Progress
                        percent={record.totalChargers > 0 ? Math.round(((record.activeChargers || 0) / record.totalChargers) * 100) : 0}
                        size="small"
                        strokeColor="#52c41a"
                    />
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: "Giá điện",
            dataIndex: "pricePerKwh",
            key: "pricePerKwh",
            render: (price) => price ? `${price.toLocaleString()} VNĐ/kWh` : "—",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "—",
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingStation(record);
                                setIsModalOpen(true);
                                form.setFieldsValue(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa trạm sạc này?")) {
                                    handleDelete(record.stationID);
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-stations">
            <div className="header">
                <h1>Quản Lý Trạm Sạc</h1>
                <p>Quản lý thông tin và trạng thái các trạm sạc xe điện</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Array.isArray(stations) ? stations.length : 0}</div>
                    <div className="text-sm text-gray-600">Tổng trạm sạc</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {Array.isArray(stations) ? stations.filter(s => s.status === "Active").length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Đang hoạt động</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {Array.isArray(stations) ? stations.filter(s => s.status === "Maintenance").length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Bảo trì</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {Array.isArray(stations) ? stations.reduce((sum, s) => sum + (s.totalChargers || 0), 0) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng cổng sạc</div>
                </Card>
            </div>

            {/* Actions */}
            <Card className="mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Tìm kiếm theo tên trạm, địa chỉ..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        Thêm trạm sạc
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    dataSource={filteredStations}
                    columns={columns}
                    rowKey="stationID"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} trạm sạc`,
                    }}
                />
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ThunderboltOutlined className="text-green-500" />
                        {editingStation ? "Chỉnh sửa trạm sạc" : "Thêm trạm sạc mới"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingStation(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        label="Tên trạm sạc"
                        name="stationName"
                        rules={[{ required: true, message: "Vui lòng nhập tên trạm sạc!" }]}
                    >
                        <Input placeholder="Nhập tên trạm sạc" />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập địa chỉ chi tiết" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Tổng số cổng"
                            name="totalChargers"
                            rules={[{ required: true, message: "Vui lòng nhập số cổng!" }]}
                        >
                            <Input type="number" placeholder="Số cổng" />
                        </Form.Item>

                        <Form.Item
                            label="Cổng đang hoạt động"
                            name="activeChargers"
                        >
                            <Input type="number" placeholder="Cổng hoạt động" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Giá điện (VNĐ/kWh)"
                        name="pricePerKwh"
                    >
                        <Input type="number" placeholder="Giá điện" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="Active">Hoạt động</Select.Option>
                            <Select.Option value="Inactive">Tạm dừng</Select.Option>
                            <Select.Option value="Maintenance">Bảo trì</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingStation ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminStations;
