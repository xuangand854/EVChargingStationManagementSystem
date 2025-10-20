import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Card, Tag, Space, message, Tooltip, Select } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LinkOutlined } from "@ant-design/icons";
import { getAllStaff, createStaffAccount, updateStaffStatus, deleteStaff } from "../../../API/Staff";
import "./Staff.css";

const AdminStaff = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await getAllStaff();
            const list = Array.isArray(response) ? response : response?.data || [];
            setStaffList(list);
            setFilteredStaff(list);
        } catch (error) {
            message.error("Có lỗi xảy ra khi tải danh sách nhân viên!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (Array.isArray(staffList)) {
            const keyword = searchText.trim().toLowerCase();
            const filtered = staffList.filter(item =>
                item.name?.toLowerCase().includes(keyword) ||
                item.email?.toLowerCase().includes(keyword) ||
                item.phoneNumber?.includes(searchText)
            );
            setFilteredStaff(filtered);
        }
    }, [searchText, staffList]);

    const handleCreate = async (values) => {
        try {
            await createStaffAccount(values);
            message.success("Thêm nhân viên thành công!");
            setIsModalOpen(false);
            form.resetFields();
            setEditingStaff(null);
            fetchStaff();
        } catch (error) {
            message.error("Có lỗi xảy ra khi tạo nhân viên!");
        }
    };

    const handleChangeStatus = async (staffId, status) => {
        try {
            await updateStaffStatus(staffId, status);
            message.success("Cập nhật trạng thái thành công!");
            fetchStaff();
        } catch (error) {
            message.error("Cập nhật trạng thái thất bại!");
        }
    };

    const handleDelete = async (staffId) => {
        try {
            await deleteStaff(staffId);
            message.success("Xóa nhân viên thành công!");
            fetchStaff();
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa nhân viên!");
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
                        {record.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (phone) => phone || "—",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            render: (address) => address || "—",
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
                    <Tooltip title="Đổi trạng thái">
                        <Select
                            size="small"
                            value={record.status}
                            style={{ width: 120 }}
                            onChange={(value) => handleChangeStatus(record.staffId, value)}
                            options={[
                                { value: "Active", label: "Hoạt động" },
                                { value: "Banned", label: "Bị khóa" },
                                { value: "Pending", label: "Chờ duyệt" },
                            ]}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
                                    handleDelete(record.staffId);
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-staff">
            <div className="header">
                <h1>Quản Lý Nhân viên</h1>
                <p>Quản lý thông tin và quyền hạn của nhân viên trong hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{Array.isArray(staffList) ? staffList.length : 0}</div>
                    <div className="stat-label">Tổng nhân viên</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Array.isArray(staffList) ? staffList.filter(u => u.status === "Active").length : 0}
                    </div>
                    <div className="stat-label">Đang hoạt động</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Array.isArray(staffList) ? staffList.filter(u => u.status === "Banned").length : 0}
                    </div>
                    <div className="stat-label">Bị khóa</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{Array.isArray(staffList) ? staffList.filter(u => u.status === "Pending").length : 0}</div>
                    <div className="stat-label">Chờ duyệt</div>
                </div>
            </div>

            {/* Actions */}
            <div className="actions-card">
                <div className="actions-container">
                    <div className="search-container">
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
                        onClick={() => {
                            setEditingStaff(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                        className="add-btn"
                    >
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <Table
                    dataSource={filteredStaff}
                    columns={columns}
                    rowKey="staffId"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} nhân viên`,
                    }}
                />
            </div>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <UserOutlined className="text-blue-500" />
                        {editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingStaff(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="Họ và tên"
                        name="name"
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

                    <Form.Item label="Số điện thoại" name="phoneNumber">
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item label="Địa chỉ" name="address">
                        <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    {!editingStaff && (
                        <>
                            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                            <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" dependencies={["password"]} rules={[{ required: true, message: "Nhập lại mật khẩu!" }]}>
                                <Input.Password placeholder="Nhập lại mật khẩu" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item label="Ảnh đại diện (URL)" name="profilePictureUrl">
                        <Input prefix={<LinkOutlined />} placeholder="https://..." />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingStaff ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminStaff;
