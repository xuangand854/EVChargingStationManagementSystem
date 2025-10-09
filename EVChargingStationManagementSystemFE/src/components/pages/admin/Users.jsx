import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Select, Card, Tag, Space, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import axios from "axios";
import "./Users.css";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/users");
            const data = Array.isArray(res.data) ? res.data : [];
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Không thể tải danh sách người dùng");
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (Array.isArray(users)) {
            const filtered = users.filter(user =>
                user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.phone?.includes(searchText)
            );
            setFilteredUsers(filtered);
        }
    }, [searchText, users]);

    const handleSave = async (values) => {
        try {
            if (editingUser) {
                await axios.put(`/api/users/${editingUser.userID}`, values);
                message.success("Cập nhật người dùng thành công!");
            } else {
                await axios.post("/api/users", values);
                message.success("Thêm người dùng thành công!");
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            message.error("Có lỗi xảy ra khi lưu người dùng!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            message.success("Xóa người dùng thành công!");
            fetchUsers();
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa người dùng!");
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "Admin": return "red";
            case "Customer": return "blue";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "green";
            case "Banned": return "red";
            case "Pending": return "orange";
            default: return "default";
        }
    };

    const columns = [
        {
            title: "Thông tin",
            key: "info",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {record.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{record.fullName}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => phone || "—",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role === "Admin" ? "Quản trị viên" : "Khách hàng"}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status === "Active" ? "Hoạt động" :
                        status === "Banned" ? "Bị khóa" : "Chờ duyệt"}
                </Tag>
            ),
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
                                setEditingUser(record);
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
                                if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
                                    handleDelete(record.userID);
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-users">
            <div className="header">
                <h1>Quản Lý Người Dùng</h1>
                <p>Quản lý thông tin và quyền hạn của người dùng trong hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.length : 0}</div>
                    <div className="text-sm text-gray-600">Tổng người dùng</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {Array.isArray(users) ? users.filter(u => u.status === "Active").length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Đang hoạt động</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {Array.isArray(users) ? users.filter(u => u.status === "Banned").length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Bị khóa</div>
                </Card>
                <Card className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {Array.isArray(users) ? users.filter(u => u.role === "Admin").length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Quản trị viên</div>
                </Card>
            </div>

            {/* Actions */}
            <Card className="mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                        Thêm người dùng
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="userID"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                    }}
                />
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <UserOutlined className="text-blue-500" />
                        {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="phone">
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        label="Vai trò"
                        name="role"
                        rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            <Select.Option value="Admin">Nhân viên </Select.Option>
                            <Select.Option value="Customer">Khách hàng</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="Active">Hoạt động</Select.Option>
                            <Select.Option value="Banned">Bị khóa</Select.Option>
                            <Select.Option value="Pending">Chờ duyệt</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingUser ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUsers;
