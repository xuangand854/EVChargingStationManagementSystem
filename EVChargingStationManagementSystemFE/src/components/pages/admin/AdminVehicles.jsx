import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Select, Space, message, Tooltip, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
    GetVehicleModel,
    GetVehicleModelById,
    DeleteVehicleModel,
    PostVehicleModel,
    UpdateVehicleModel,
    VehicleStatus
} from "../../../API/VehicleModel";
import "./AdminVehicles.css";

const AdminVehicles = () => {
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await GetVehicleModel();
            const data = Array.isArray(res) ? res : (res?.data ?? res?.data?.data ?? []);
            // Lấy thêm status của từng xe
            const modelsWithStatus = await Promise.all(
                data.map(async (m) => {
                    try {
                        const statusRes = await VehicleStatus(m.vehicleModelId ?? m.id);
                        return { ...m, status: statusRes?.status ?? 2 }; // mặc định Inactive
                    } catch {
                        return { ...m, status: 2 };
                    }
                })
            );
            setModels(modelsWithStatus);
            setFilteredModels(modelsWithStatus);
        } catch (error) {
            console.error("Error fetching vehicle models:", error);
            message.error("Không thể tải danh sách mẫu xe");
            setModels([]);
            setFilteredModels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        if (Array.isArray(models)) {
            const filtered = models.filter((m) =>
                (m.modelName ?? "").toString().toLowerCase().includes(searchText.toLowerCase()) ||
                (m.modelYear ?? "").toString().includes(searchText)
            );
            setFilteredModels(filtered);
        }
    }, [searchText, models]);

    const handleSave = async (values) => {
        try {
            if (editingModel) {
                // Lấy ID từ record hiện tại
                const id = editingModel.id;
                
                // Gọi API để lấy thông tin xe trước khi update
                const vehicle = await GetVehicleModelById(id);

                if (!vehicle) {
                    message.error("Không tìm thấy xe để cập nhật!");
                    return;
                }

                // Chuyển đổi vehicleType từ string sang number
                const vehicleTypeValue = values.vehicleType === "Car" ? 1 : values.vehicleType === "Bike" ? 0 : Number(values.vehicleType);
                
                // Chuyển đổi status từ string sang number
                const statusValue = values.status === "Active" ? 1 : values.status === "Inactive" ? 2 : values.status === "Discontinued" ? 3 : Number(values.status);

                await UpdateVehicleModel(id, {
                    modelName: values.modelName,
                    modelYear: Number(values.modelYear),
                    vehicleType: vehicleTypeValue,
                    batteryCapacityKWh: Number(values.batteryCapacityKWh),
                    recommendedChargingPowerKW: Number(values.recommendedChargingPowerKW),
                    imageUrl: values.imageUrl ?? null,
                    status: statusValue
                });
                message.success("Cập nhật mẫu xe thành công!");
            } else {
                // Chuyển đổi vehicleType cho tạo mới
                const vehicleTypeValue = values.vehicleType === "Car" ? 1 : values.vehicleType === "Bike" ? 0 : Number(values.vehicleType);
                const statusValue = values.status === "Active" ? 1 : values.status === "Inactive" ? 2 : values.status === "Discontinued" ? 3 : 2;

                await PostVehicleModel(
                    values.modelName,
                    Number(values.modelYear),
                    vehicleTypeValue,
                    Number(values.batteryCapacityKWh),
                    Number(values.recommendedChargingPowerKW),
                    values.imageUrl ?? null,
                    statusValue
                );
                message.success("Thêm mẫu xe thành công!");
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingModel(null);
            fetchModels();
        } catch (error) {
            console.error("Lỗi khi lưu mẫu xe:", error);
            message.error("Có lỗi xảy ra khi lưu mẫu xe!");
        }
    };

    const handleDelete = async (id) => {
        try {
            // Gọi API để lấy thông tin xe trước khi xóa
            const vehicle = await GetVehicleModelById(id);

            if (!vehicle) {
                message.error("Không tìm thấy xe để xóa!");
                return;
            }

            await DeleteVehicleModel(id);
            message.success("Xóa mẫu xe thành công!");
            fetchModels();
        } catch (error) {
            console.error("Lỗi khi xóa mẫu xe:", error);
            message.error("Có lỗi xảy ra khi xóa mẫu xe!");
        }
    };

    const getStatusLabel = (status) => {
        // Xử lý cả string và number
        if (typeof status === 'string') {
            return status;
        }
        switch (Number(status)) {
            case 1: return "Active";
            case 2: return "Inactive";
            case 3: return "Discontinued";
            default: return "Unknown";
        }
    };

    const getStatusColor = (status) => {
        // Xử lý cả string và number
        if (typeof status === 'string') {
            switch (status) {
                case "Active": return "green";
                case "Inactive": return "volcano";
                case "Discontinued": return "gray";
                default: return "geekblue";
            }
        }
        switch (Number(status)) {
            case 1: return "green";
            case 2: return "volcano";
            case 3: return "gray";
            default: return "geekblue";
        }
    };

    const columns = [
        { title: "Tên mẫu", dataIndex: "modelName", key: "modelName" },
        { title: "Năm", dataIndex: "modelYear", key: "modelYear" },
        {
            title: "Loại xe",
            dataIndex: "vehicleType",
            key: "vehicleType",
            render: (t) => {
                if (typeof t === 'string') {
                    return t === "Car" ? "Xe ô tô" : t === "Bike" ? "Xe máy" : t;
                }
                return t === 0 ? "Xe máy" : t === 1 ? "Xe ô tô" : "Không xác định";
            }
        },
        {
            title: "Dung lượng pin (kWh)",
            dataIndex: "batteryCapacityKWh",
            key: "batteryCapacityKWh",
            render: (c) => (c ? `${c} kWh` : "—")
        },
        {
            title: "Công suất sạc (kW)",
            dataIndex: "recommendedChargingPowerKW",
            key: "recommendedChargingPowerKW",
            render: (p) => (p ? `${p} kW` : "—")
        },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
        },
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (u) =>
                u ? (
                    <img
                        src={u}
                        alt="model"
                        style={{
                            width: 80,
                            height: 48,
                            objectFit: "cover",
                            borderRadius: 6
                        }}
                    />
                ) : (
                    "—"
                )
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => {
                const id = record.vehicleModelId ?? record.id;
                return (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingModel(record);
                                    setIsModalOpen(true);
                                    form.setFieldsValue({
                                        modelName: record.modelName,
                                        modelYear: record.modelYear,
                                        vehicleType: record.vehicleType,
                                        batteryCapacityKWh: record.batteryCapacityKWh,
                                        recommendedChargingPowerKW: record.recommendedChargingPowerKW,
                                        imageUrl: record.imageUrl,
                                        status: record.status
                                    });
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    if (window.confirm("Bạn có chắc chắn muốn xóa mẫu xe này?")) {
                                        handleDelete(id);
                                    }
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        }
    ];

    return (
        <div className="admin-vehicles">
            <div className="header">
                <h1>Quản Lý Mẫu Xe</h1>
                <p>Thêm, sửa, xóa và xem tình trạng các mẫu xe điện.</p>
            </div>

            <div className="actions-card">
                <div className="actions-container">
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc năm..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsModalOpen(true);
                            setEditingModel(null);
                            form.resetFields();
                            form.setFieldsValue({ status: "Inactive" }); // mặc định Inactive
                        }}
                    >
                        Thêm mẫu
                    </Button>
                </div>
            </div>

            <Table
                dataSource={filteredModels}
                columns={columns}
                rowKey={(r) => r.vehicleModelId ?? r.id}
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 16 }}
            />

            <Modal
                title={editingModel ? "Chỉnh sửa mẫu xe" : "Thêm mẫu xe"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingModel(null);
                }}
                footer={null}
                width={620}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="modelName" label="Tên mẫu" rules={[{ required: true, message: "Nhập tên mẫu!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="modelYear" label="Năm sản xuất" rules={[{ required: true, message: "Nhập năm!" }]}>
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="vehicleType" label="Loại xe" rules={[{ required: true, message: "Chọn loại xe!" }]}>
                        <Select>
                            <Select.Option value="Bike">Xe máy</Select.Option>
                            <Select.Option value="Car">Xe ô tô</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="batteryCapacityKWh" label="Dung lượng pin (kWh)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="recommendedChargingPowerKW" label="Công suất sạc khuyến nghị (kW)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="status" label="Tình trạng xe" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Active">Active</Select.Option>
                            <Select.Option value="Inactive">Inactive</Select.Option>
                            <Select.Option value="Discontinued">Discontinued</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="imageUrl" label="Hình ảnh (URL)">
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <div style={{ textAlign: "right" }}>
                        <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingModel ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminVehicles;
