import { useEffect, useState } from "react";
import {
    Card,
    Table,
    Input,
    Select,
    DatePicker,
    Button,
    Tag,
    Space,
    Row,
    Col,
    Statistic,
    Modal,
    Empty
} from "antd";
import {
    Search,
    Download,
    Eye,
    DollarSign,
    TrendingUp,
    Calendar
} from "lucide-react";
import { GetTransaction } from "../../../API/Transaction";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "./TransactionHistory.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noData, setNoData] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [dateRange, setDateRange] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statistics, setStatistics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        totalAmount: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, searchText, statusFilter, typeFilter, dateRange]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await GetTransaction();
            const data = Array.isArray(response.data) ? response.data :
                Array.isArray(response) ? response : [];

            setTransactions(data);
            calculateStatistics(data);
            setNoData(false);
            setHasError(false);
        } catch (error) {
            console.log('Full error:', error);

            const status = error?.response?.status;
            const message =
                error?.customMessage ||
                error?.response?.data?.message ||
                error?.message ||
                'Đã xảy ra lỗi';

            // Chỉ không bắn toast nếu là lỗi 404 VÀ thông điệp đúng
            const isNoDataError = status === 404 && message.includes('Không tìm thấy lịch sử giao dịch');

            if (isNoDataError) {
                console.log('Không có giao dịch nào');
                setNoData(true);
                setHasError(false);
            } else {
                toast.error(message); // ✅ Bắn toast cho tất cả lỗi khác
                setHasError(true);
                setNoData(false);
            }

            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        const completed = data.filter(t => t.status === 'Completed').length;
        const pending = data.filter(t => t.status === 'Pending').length;
        const totalAmount = data
            .filter(t => t.status === 'Completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        setStatistics({
            total: data.length,
            completed,
            pending,
            totalAmount
        });
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(t =>
                t.referenceCode?.toLowerCase().includes(searchText.toLowerCase()) ||
                t.id?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        // Filter by type
        if (typeFilter !== "all") {
            filtered = filtered.filter(t => t.transactionType === typeFilter);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            filtered = filtered.filter(t => {
                if (!t.referenceCode) return false;
                try {
                    const dateStr = t.referenceCode.split('-')[1];
                    const transDate = dayjs(dateStr, 'YYYYMMDD');
                    return transDate.isAfter(dateRange[0]) && transDate.isBefore(dateRange[1]);
                } catch {
                    return false;
                }
            });
        }

        setFilteredTransactions(filtered);
    };

    const handleViewDetail = (record) => {
        setSelectedTransaction(record);
        setDetailModalVisible(true);
    };

    const handleExport = () => {
        // Export to CSV
        const headers = ['Mã tham chiếu', 'Ngày', 'Loại', 'Số tiền', 'Trạng thái'];
        const csvData = filteredTransactions.map(t => {
            const dateStr = t.referenceCode?.split('-')[1] || '';
            const date = dateStr ? dayjs(dateStr, 'YYYYMMDD').format('DD/MM/YYYY') : '';
            return [
                t.referenceCode || '',
                date,
                t.transactionType || '',
                t.amount || 0,
                t.status || ''
            ];
        });

        const csv = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transactions_${dayjs().format('YYYYMMDD')}.csv`;
        link.click();
    };

    const columns = [
        {
            title: 'Mã tham chiếu',
            dataIndex: 'referenceCode',
            key: 'referenceCode',
            width: 180,
            render: (code) => <span className="font-mono text-xs">{code}</span>,
            fixed: 'left'
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'referenceCode',
            key: 'date',
            width: 120,
            render: (code) => {
                if (!code) return '-';
                try {
                    const dateStr = code.split('-')[1];
                    return dayjs(dateStr, 'YYYYMMDD').format('DD/MM/YYYY');
                } catch {
                    return '-';
                }
            }
        },
        {
            title: 'Loại giao dịch',
            dataIndex: 'transactionType',
            key: 'transactionType',
            width: 150,
            render: (type) => {
                const typeMap = {
                    'OnlinePayment': { text: 'Thanh toán online', color: 'blue' },
                    'OfflinePayment': { text: 'Thanh toán offline', color: 'orange' },
                    'Refund': { text: 'Hoàn tiền', color: 'purple' }
                };
                const config = typeMap[type] || { text: type, color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Số tiền (VNĐ)',
            dataIndex: 'amount',
            key: 'amount',
            width: 130,
            align: 'right',
            render: (value) => (
                <span className="font-semibold text-green-600">
                    {value ? value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : '0'}
                </span>
            ),
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusMap = {
                    'Completed': { text: 'Hoàn thành', color: 'success' },
                    'Pending': { text: 'Đang xử lý', color: 'processing' },
                    'Failed': { text: 'Thất bại', color: 'error' },
                    'Cancelled': { text: 'Đã hủy', color: 'default' }
                };
                const config = statusMap[status] || { text: status, color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<Eye size={16} />}
                    onClick={() => handleViewDetail(record)}
                >
                    Chi tiết
                </Button>
            )
        }
    ];

    return (
        <div className="admin-transaction-history">
            {/* Header */}
            <div className="header">
                <h1>Lịch Sử Giao Dịch</h1>
                <p>Quản lý và theo dõi tất cả giao dịch trong hệ thống</p>
            </div>

            {/* Statistics */}
            <div className="stats-container">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng giao dịch"
                                value={statistics.total}
                                prefix={<Calendar className="text-blue-500" size={20} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Hoàn thành"
                                value={statistics.completed}
                                prefix={<TrendingUp className="text-green-500" size={20} />}
                                valueStyle={{ color: '#10b981' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Đang xử lý"
                                value={statistics.pending}
                                valueStyle={{ color: '#f59e0b' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng tiền"
                                value={statistics.totalAmount}
                                prefix={<DollarSign className="text-green-600" size={20} />}
                                suffix="VNĐ"
                                valueStyle={{ color: '#059669' }}
                                formatter={(value) => `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Filters */}
            <div className="actions-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo mã giao dịch..."
                            prefix={<Search size={16} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full"
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="Completed">Hoàn thành</Option>
                            <Option value="Pending">Đang xử lý</Option>
                            <Option value="Failed">Thất bại</Option>
                            <Option value="Cancelled">Đã hủy</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Select
                            value={typeFilter}
                            onChange={setTypeFilter}
                            className="w-full"
                        >
                            <Option value="all">Tất cả loại</Option>
                            <Option value="OnlinePayment">Thanh toán trực tuyến</Option>
                            <Option value="OfflinePayment">Thanh toán trực tiếp</Option>
                            <Option value="Refund">Hoàn tiền</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                            />
                            <Button
                                type="primary"
                                icon={<Download size={16} />}
                                onClick={handleExport}
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Table */}
            <div className="table-card">
                {hasError ? (
                    <Empty description="Đã xảy ra lỗi khi tải dữ liệu" />
                ) : noData || filteredTransactions.length === 0 ? (
                    <Empty description="Không có giao dịch nào" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredTransactions}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        scroll={{ x: 1000, y: 500 }}
                        sticky
                    />
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết giao dịch"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedTransaction && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 text-sm">Mã giao dịch</p>
                                <p className="font-semibold">{selectedTransaction.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Mã tham chiếu</p>
                                <p className="font-mono text-sm">{selectedTransaction.referenceCode}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Loại giao dịch</p>
                                <p className="font-semibold">
                                    {selectedTransaction.transactionType === 'OnlinePayment' ? 'Thanh toán trực tuyến' :
                                        selectedTransaction.transactionType === 'OfflinePayment' ? 'Thanh toán trực tiếp' :
                                            selectedTransaction.transactionType === 'Refund' ? 'Hoàn tiền' :
                                                selectedTransaction.transactionType}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Trạng thái</p>
                                <Tag color={selectedTransaction.status === 'Completed' ? 'success' :
                                    selectedTransaction.status === 'Pending' ? 'processing' :
                                        selectedTransaction.status === 'Failed' ? 'error' : 'default'}>
                                    {selectedTransaction.status === 'Completed' ? 'Hoàn thành' :
                                        selectedTransaction.status === 'Pending' ? 'Đang xử lý' :
                                            selectedTransaction.status === 'Failed' ? 'Thất bại' :
                                                selectedTransaction.status === 'Cancelled' ? 'Đã hủy' :
                                                    selectedTransaction.status}
                                </Tag>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600 text-sm">Số tiền</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {selectedTransaction.amount?.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TransactionHistory;
