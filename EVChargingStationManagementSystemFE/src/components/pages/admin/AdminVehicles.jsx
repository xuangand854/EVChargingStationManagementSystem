import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Input, Form, Select, Space, message, Tooltip, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
    GetVehicleModel,
    GetVehicleModelById,
    DeleteVehicleModel,
    PostVehicleModel,
    UpdateVehicleModel,
    VehicleStatus,
    UpdateVehicleModelStatus
} from "../../../API/VehicleModel";
import "./AdminVehicles.css";

const AdminVehicles = () => {
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [form] = Form.useForm();

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await GetVehicleModel();
            console.log("Vehicle models response:", res);
            
            const data = Array.isArray(res) ? res : (res?.data ?? res?.data?.data ?? []);
            console.log("Processed data:", data);
            
            // Kiểm tra xem data có chứa status không, nếu không thì lấy từ API riêng
            const modelsWithStatus = await Promise.all(
                data.map(async (m) => {
                    try {
                        // Nếu đã có status trong data thì dùng luôn
                        if (m.status !== undefined && m.status !== null) {
                            return { ...m, status: m.status };
                        }
                        
                        // Nếu chưa có status thì gọi API để lấy
                        const statusRes = await VehicleStatus(m.vehicleModelId ?? m.id);
                        console.log(`Status for ${m.vehicleModelId ?? m.id}:`, statusRes);
                        return { 
                            ...m, 
                            status: statusRes?.status ?? statusRes?.data?.status ?? 2 // mặc định Inactive
                        };
                    } catch (statusError) {
                        console.warn(`Could not fetch status for ${m.vehicleModelId ?? m.id}:`, statusError);
                        return { ...m, status: 2 }; // mặc định Inactive
                    }
                })
            );
            
            console.log("Models with status:", modelsWithStatus);
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
                const statusValue = values.status === "Active" ? 1 : values.status === "Discontinued" ? 2 : values.status === "Unknown" ? 3 : Number(values.status);

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
                const statusValue = values.status === "Active" ? 1 : values.status === "Discontinued" ? 2 : values.status === "Unknown" ? 3 : 2;

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
        setDeletingId(id);
        try {
            console.log(`Attempting to delete vehicle with ID: ${id}`);
            const response = await DeleteVehicleModel(id);
            console.log("Delete response:", response);
            
            // Kiểm tra response để xác nhận xóa thành công
            // API trả về 200 OK khi xóa thành công
            message.success("Xóa mẫu xe thành công!");
            fetchModels();
        } catch (error) {
            console.error("Lỗi khi xóa mẫu xe:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Xử lý các loại lỗi khác nhau
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.message || error.response.data?.error || "Lỗi không xác định";
                
                switch (status) {
                    case 404:
                        message.error("Không tìm thấy mẫu xe để xóa!");
                        break;
                    case 400:
                        message.error("Dữ liệu không hợp lệ!");
                        break;
                    case 500:
                        message.error("Lỗi máy chủ! Vui lòng thử lại sau.");
                        break;
                    default:
                        message.error(`Lỗi ${status}: ${errorMessage}`);
                }
            } else if (error.request) {
                message.error("Không thể kết nối đến máy chủ!");
            } else {
                message.error("Có lỗi xảy ra khi xóa mẫu xe!");
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingStatusId(id);
        try {
            const response = await UpdateVehicleModelStatus(id, newStatus);
            console.log("Update status response:", response);
            
            message.success("Cập nhật trạng thái thành công!");
            fetchModels();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            
            // Xử lý các loại lỗi khác nhau
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.message || error.response.data?.error || "Lỗi không xác định";
                
                switch (status) {
                    case 404:
                        message.error("Không tìm thấy mẫu xe để cập nhật!");
                        break;
                    case 400:
                        message.error("Dữ liệu không hợp lệ!");
                        break;
                    case 500:
                        message.error("Lỗi máy chủ! Vui lòng thử lại sau.");
                        break;
                    default:
                        message.error(`Lỗi ${status}: ${errorMessage}`);
                }
            } else if (error.request) {
                message.error("Không thể kết nối đến máy chủ!");
            } else {
                message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
            }
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const getStatusLabel = (status) => {
        // Xử lý null/undefined
        if (status === null || status === undefined) {
            return "Unknown";
        }
        
        // Xử lý string
        if (typeof status === 'string') {
            const lowerStatus = status.toLowerCase();
            switch (lowerStatus) {
                case "active":
                case "1":
                    return "Active";
                case "discontinued":
                case "2":
                    return "discontinued";
                case "unknown":
                case "3":
                    return "unknown";
                default:
                    return status; // Trả về nguyên gốc nếu không match
            }
        }
        
        // Xử lý number
        const numStatus = Number(status);
        switch (numStatus) {
            case 1: return "Active";
            case 2: return "Discontinued";
            case 3: return "Unknown";
            default: return `Status ${numStatus}`;
        }
    };

    const getStatusColor = (status) => {
        // Xử lý null/undefined
        if (status === null || status === undefined) {
            return "geekblue";
        }
        
        // Xử lý string
        if (typeof status === 'string') {
            const lowerStatus = status.toLowerCase();
            switch (lowerStatus) {
                case "active":
                case "1":
                    return "green";
                case "inactive":
                case "2":
                    return "volcano";
                case "discontinued":
                case "3":
                    return "gray";
                default:
                    return "geekblue";
            }
        }
        
        // Xử lý number
        const numStatus = Number(status);
        switch (numStatus) {
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
            render: (status, record) => {
                const id = record.vehicleModelId ?? record.id;
                const isUpdating = updatingStatusId === id;
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag color={getStatusColor(status)} style={{ margin: 0 }}>
                            {getStatusLabel(status)}
                        </Tag>
                        <Select
                            value={status}
                            onChange={(newStatus) => handleUpdateStatus(id, newStatus)}
                            loading={isUpdating}
                            disabled={isUpdating}
                            style={{ minWidth: 100 }}
                            size="small"
                            placeholder="Thay đổi"
                        >
                            <Select.Option value={1}>Active</Select.Option>
                            <Select.Option value={2}>Discontinued</Select.Option>
                            <Select.Option value={3}>Unknown</Select.Option>
                        </Select>
                    </div>
                );
            }
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
                                loading={deletingId === id}
                                disabled={deletingId === id}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Xác nhận xóa mẫu xe',
                                        content: `Bạn có chắc chắn muốn xóa mẫu xe "${record.modelName}"? Hành động này không thể hoàn tác.`,
                                        okText: 'Xóa',
                                        okType: 'danger',
                                        cancelText: 'Hủy',
                                        onOk: () => handleDelete(id),
                                    });
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
                            <Select.Option value="Discontinued">Discontinued</Select.Option>
                            <Select.Option value="Unknown">Unknown</Select.Option>
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
