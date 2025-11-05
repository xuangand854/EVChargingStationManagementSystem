import React, { useEffect, useState } from "react";
import {
    Button, Table, Modal, Input, Form, Tag,
    Space, message, Tooltip, Select
} from "antd";
import {
    EditOutlined, DeleteOutlined, PlusOutlined,
    SearchOutlined, UserOutlined, MailOutlined,
    PhoneOutlined, HomeOutlined, LockOutlined
} from "@ant-design/icons";
import {
    getAllStaff, createStaffAccount, updateStaffInfo,
    updateStaffStatus, deleteStaff
} from "../../../API/Staff";
import "./Staff.css";

const AdminStaff = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    /* ==================== FETCH ==================== */
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await getAllStaff();
            const list = Array.isArray(res.data) ? res.data : [];
            setStaffList(list);
            setFilteredStaff(list);
        } catch (err) {
            message.error(err.response?.data?.message || "Lỗi tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    /* ==================== SEARCH ==================== */
    useEffect(() => {
        const kw = searchText.trim().toLowerCase();
        const filtered = staffList.filter(s =>
            s.name?.toLowerCase().includes(kw) ||
            s.email?.toLowerCase().includes(kw) ||
            s.phoneNumber?.includes(searchText)
        );
        setFilteredStaff(filtered);
    }, [searchText, staffList]);

    /* ==================== SUBMIT ==================== */
    const handleSubmit = async (values) => {
        try {
            if (editingStaff) {
                // 🟢 Cập nhật nhân viên
                const payload = {
                    staffId: editingStaff.id, // id = profileId
                    name: values.name,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    address: values.address,
                    profilePictureUrl: values.profilePictureUrl || "",
                    workingLocation: values.workingLocation || "",
                };
                const res = await updateStaffInfo(payload);
                message.success(res.message || "Cập nhật nhân viên thành công");
            } else {
                // 🟢 Thêm mới nhân viên
                const payload = {
                    email: values.email,
                    password: values.password,
                    confirmPassword: values.confirmPassword,
                    name: values.name,
                    phoneNumber: values.phoneNumber,
                    address: values.address,
                    profilePictureUrl: values.profilePictureUrl || "",
                    workingLocation: values.workingLocation || "",
                };
                const res = await createStaffAccount(payload);
                message.success(res.message || "Tạo tài khoản nhân viên thành công");
            }
            closeModal();
            fetchStaff();
        } catch (err) {
            message.error(err.response?.data?.message || "Thao tác thất bại");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingStaff(null);
    };

    /* ==================== STATUS & DELETE ==================== */
    const handleChangeStatus = async (staffId, status) => {
        try {
            const res = await updateStaffStatus(staffId, status);
            message.success(res.message || "Cập nhật trạng thái thành công");
            fetchStaff();
        } catch (err) {
            message.error(err.response?.data?.message || "Cập nhật thất bại");
        }
    };

    const handleDelete = async (staffId) => {
        if (!window.confirm("Xóa nhân viên này?")) return;
        try {
            await deleteStaff(staffId);
            message.success("Xóa thành công");
            fetchStaff();
        } catch (err) {
            message.error(err.response?.data?.message || "Xóa thất bại");
        }
    };

    const handleEdit = (record) => {
        setEditingStaff(record);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            phoneNumber: record.phoneNumber,
            address: record.address,
            profilePictureUrl: record.profilePictureUrl,
            workingLocation: record.workingLocation,
        });
        setIsModalOpen(true);
    };

    /* ==================== UI HELPERS ==================== */
    const getStatusColor = (s) => {
        return s === "Active" ? "green"
            : s === "Inactive" ? "red"
                : "default";
    };

    const columns = [
        {
            title: "Thông tin",
            key: "info",
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-medium">ID: {r.id}</div>
                        <div className="font-medium">AccID: {r.accountId}</div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-gray-500">{r.email}</div>
                    </div>
                </div>
            ),
        },
        { title: "SĐT", dataIndex: "phoneNumber", render: t => t || "—" },
        { title: "Địa chỉ", dataIndex: "address", render: t => t || "—" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: s => (
                <Tag color={getStatusColor(s)}>
                    {s === "Active" ? "Hoạt động" : s === "Inactive" ? "Không hoạt động" : s}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: d => d ? new Date(d).toLocaleDateString("vi-VN") : "—",
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, r) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
                    </Tooltip>
                    <Tooltip title="Đổi trạng thái">
                        <Select
                            size="small"
                            value={r.status}
                            style={{ width: 110 }}
                            onChange={v => handleChangeStatus(r.id, v)} // 🟢 id = profileId
                            options={[
                                { value: "Active", label: "Hoạt động" },
                                { value: "Inactive", label: "Không hoạt động" },
                            ]}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(r.id)} // 🟢 id = profileId
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-staff">
            <div className="header">
                <h1>Quản lý nhân viên</h1>
                <p>Quản lý thông tin, trạng thái và tài khoản nhân viên</p>
            </div>

            <div className="actions-card">
                <div className="actions-container">
                    <Input
                        placeholder="Tìm tên, email, SĐT..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                        style={{ width: '60%' }}
                    />
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

            <div className="table-card">
                <Table
                    columns={columns}
                    dataSource={filteredStaff}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
                />
            </div>

            {/* Modal thêm/sửa */}
            <Modal
                title={editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email nhân viên" />
                    </Form.Item>

                    {!editingStaff && (
                        <>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                                hasFeedback
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={["password"]}
                                hasFeedback
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) return Promise.resolve();
                                            return Promise.reject(new Error("Mật khẩu không khớp!"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                        <Input prefix={<UserOutlined />} placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="VD: 0912345678" />
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ cư trú" />
                    </Form.Item>

                    <Form.Item name="profilePictureUrl" label="Ảnh đại diện (tuỳ chọn)">
                        <Input prefix={<UserOutlined />} placeholder="Nhập URL ảnh hoặc để trống" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block icon={<PlusOutlined />}>
                            {editingStaff ? "Lưu thay đổi" : "Tạo tài khoản nhân viên"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminStaff;
