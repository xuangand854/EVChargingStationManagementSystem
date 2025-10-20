import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Select, Card, Tag, Space, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, CarOutlined, UserOutlined, ThunderboltOutlined } from "@ant-design/icons";
import axios from "axios";
import "./AdminVehicles.css";

const AdminVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/vehicles");
            const data = Array.isArray(res.data) ? res.data : [];
            setVehicles(data);
            setFilteredVehicles(data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            message.error("Không thể tải danh sách xe điện");
            setVehicles([]);
            setFilteredVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/users");
            const data = Array.isArray(res.data) ? res.data : [];
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Không thể tải danh sách người dùng");
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchVehicles();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (Array.isArray(vehicles)) {
            const filtered = vehicles.filter(vehicle =>
                vehicle.vehicleName?.toLowerCase().includes(searchText.toLowerCase()) ||
                vehicle.plateNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
                vehicle.connectorType?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredVehicles(filtered);
        }
    }, [searchText, vehicles]);

    const handleSave = async (values) => {
        try {
            if (editingVehicle) {
                await axios.put(`/api/vehicles/${editingVehicle.vehicleID}`, values);
                message.success("Cập nhật xe điện thành công!");
            } else {
                await axios.post("/api/vehicles", values);
                message.success("Thêm xe điện thành công!");
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingVehicle(null);
            fetchVehicles();
        } catch (error) {
            message.error("Có lỗi xảy ra khi lưu xe điện!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/vehicles/${id}`);
            message.success("Xóa xe điện thành công!");
            fetchVehicles();
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa xe điện!");
        }
    };

    const getConnectorColor = (type) => {
        switch (type) {
            case "Type2": return "blue";
            case "CCS2": return "green";
            case "CHAdeMO": return "orange";
            default: return "default";
        }
    };

    const getConnectorText = (type) => {
        switch (type) {
            case "Type2": return "Type 2";
            case "CCS2": return "CCS2";
            case "CHAdeMO": return "CHAdeMO";
            default: return type;
        }
    };

    const columns = [
        {
            title: "Thông tin xe",
            key: "info",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                        <CarOutlined />
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{record.vehicleName}</div>
                        <div className="text-sm text-gray-500">Biển số: {record.plateNumber || "—"}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Dung lượng pin",
            dataIndex: "batteryCapacity",
            key: "batteryCapacity",
            render: (capacity) => (
                <div className="flex items-center gap-2">
                    <ThunderboltOutlined className="text-green-500" />
                    <span>{capacity ? `${capacity} kWh` : "—"}</span>
                </div>
            ),
        },
        {
            title: "Loại đầu sạc",
            dataIndex: "connectorType",
            key: "connectorType",
            render: (type) => (
                <Tag color={getConnectorColor(type)}>
                    {getConnectorText(type)}
                </Tag>
            ),
        },
        {
            title: "Chủ xe",
            dataIndex: "userID",
            key: "userID",
            render: (id) => {
                const user = users.find((u) => u.userID === id);
                return user ? (
                    <div className="flex items-center gap-2">
                        <UserOutlined className="text-blue-500" />
                        <span>{user.fullName}</span>
                    </div>
                ) : "—";
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "Active" ? "green" : "red"}>
                    {status === "Active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Ngày đăng ký",
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
                                setEditingVehicle(record);
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
                                if (window.confirm("Bạn có chắc chắn muốn xóa xe điện này?")) {
                                    handleDelete(record.vehicleID);
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-vehicles">
            <div className="header">
                <h1>Quản Lý Xe Điện</h1>
                <p>Quản lý thông tin và trạng thái các xe điện trong hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{Array.isArray(vehicles) ? vehicles.length : 0}</div>
                    <div className="stat-label">Tổng xe điện</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Array.isArray(vehicles) ? vehicles.filter(v => v.status === "Active").length : 0}
                    </div>
                    <div className="stat-label">Đang hoạt động</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Array.isArray(vehicles) ? vehicles.filter(v => v.connectorType === "Type2").length : 0}
                    </div>
                    <div className="stat-label">Type 2</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + (v.batteryCapacity || 0), 0) : 0} kWh
                    </div>
                    <div className="stat-label">Tổng dung lượng</div>
                </div>
            </div>

            {/* Actions */}
            <div className="actions-card">
                <div className="actions-container">
                    <div className="search-container">
                        <Input
                            placeholder="Tìm kiếm theo tên xe, biển số, loại đầu sạc..."
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
                        className="add-btn"
                    >
                        Thêm xe điện
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <Table
                    dataSource={filteredVehicles}
                    columns={columns}
                    rowKey="vehicleID"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} xe điện`,
                    }}
                />
            </div>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <CarOutlined className="text-purple-500" />
                        {editingVehicle ? "Chỉnh sửa xe điện" : "Thêm xe điện mới"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingVehicle(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        label="Tên xe"
                        name="vehicleName"
                        rules={[{ required: true, message: "Vui lòng nhập tên xe!" }]}
                    >
                        <Input placeholder="Nhập tên xe điện" />
                    </Form.Item>

                    <Form.Item label="Biển số xe" name="plateNumber">
                        <Input placeholder="Nhập biển số xe" />
                    </Form.Item>

                    <Form.Item
                        label="Dung lượng pin (kWh)"
                        name="batteryCapacity"
                        rules={[{ required: true, message: "Vui lòng nhập dung lượng pin!" }]}
                    >
                        <Input type="number" placeholder="Nhập dung lượng pin" />
                    </Form.Item>

                    <Form.Item
                        label="Loại đầu sạc"
                        name="connectorType"
                        rules={[{ required: true, message: "Vui lòng chọn loại đầu sạc!" }]}
                    >
                        <Select placeholder="Chọn loại đầu sạc">
                            <Select.Option value="Type2">Type 2</Select.Option>
                            <Select.Option value="CCS2">CCS2</Select.Option>
                            <Select.Option value="CHAdeMO">CHAdeMO</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Chủ xe"
                        name="userID"
                        rules={[{ required: true, message: "Vui lòng chọn chủ xe!" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn chủ xe"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {users.map((user) => (
                                <Select.Option key={user.userID} value={user.userID}>
                                    {user.fullName} ({user.email})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="Active">Hoạt động</Select.Option>
                            <Select.Option value="Inactive">Không hoạt động</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingVehicle ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminVehicles;
