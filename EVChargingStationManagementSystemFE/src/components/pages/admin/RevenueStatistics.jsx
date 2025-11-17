import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Spin, Empty, Input } from "antd";
import {
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    ArrowUp,
    ArrowDown,
    Search
} from "lucide-react";
import { toast } from "react-toastify";
import { GetTransaction } from "../../../API/Transaction";
import dayjs from "dayjs";
import "./RevenueStatistics.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueStatistics = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [filterPeriod, setFilterPeriod] = useState('30days');
    const [searchText, setSearchText] = useState('');
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalEnergy: 0,
        totalSessions: 0,
        averageRevenue: 0,
        growthRate: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            calculateStatistics();
        }
    }, [transactions, dateRange]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await GetTransaction();
            const data = Array.isArray(response.data) ? response.data :
                Array.isArray(response) ? response : [];

            setTransactions(data);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            toast.error(`Lỗi khi lấy giao dịch: ${errorMsg}`);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = () => {
        // Parse ngày từ referenceCode (format: ONL-YYYYMMDD-XXXXXX)
        const filtered = transactions.filter(t => {
            if (!t.referenceCode) return true; // Nếu không có referenceCode thì vẫn hiển thị
            try {
                const dateStr = t.referenceCode.split('-')[1]; // Lấy phần YYYYMMDD
                const transDate = dayjs(dateStr, 'YYYYMMDD');
                return transDate.isAfter(dateRange[0]) && transDate.isBefore(dateRange[1]);
            } catch {
                return true; // Nếu parse lỗi thì vẫn hiển thị
            }
        });

        const totalRevenue = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalSessions = filtered.length;
        const averageRevenue = totalSessions > 0 ? totalRevenue / totalSessions : 0;

        // Tính tăng trưởng so với kỳ trước
        const periodDays = dateRange[1].diff(dateRange[0], 'days');
        const previousStart = dateRange[0].subtract(periodDays, 'days');
        const previousEnd = dateRange[0];

        const previousTransactions = transactions.filter(t => {
            if (!t.referenceCode) return false;
            try {
                const dateStr = t.referenceCode.split('-')[1];
                const transDate = dayjs(dateStr, 'YYYYMMDD');
                return transDate.isAfter(previousStart) && transDate.isBefore(previousEnd);
            } catch {
                return false;
            }
        });

        const previousRevenue = previousTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const growthRate = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        setStatistics({
            totalRevenue,
            totalEnergy: 0, // Backend không trả về energyDelivered
            totalSessions,
            averageRevenue,
            growthRate
        });
    };

    const handlePeriodChange = (value) => {
        setFilterPeriod(value);
        const now = dayjs();
        let start;

        switch (value) {
            case 'today':
                start = now.startOf('day');
                break;
            case '7days':
                start = now.subtract(7, 'days');
                break;
            case '30days':
                start = now.subtract(30, 'days');
                break;
            case '90days':
                start = now.subtract(90, 'days');
                break;
            case 'year':
                start = now.subtract(1, 'year');
                break;
            default:
                start = now.subtract(30, 'days');
        }

        setDateRange([start, now]);
    };

    const columns = [
        {
            title: 'Mã tham chiếu',
            dataIndex: 'referenceCode',
            key: 'referenceCode',
            width: 180,
            render: (code) => <span className="font-mono text-xs">{code}</span>
        },
        {
            title: 'Thời gian',
            dataIndex: 'referenceCode',
            key: 'date',
            render: (code) => {
                if (!code) return '-';
                try {
                    const dateStr = code.split('-')[1]; // Lấy YYYYMMDD
                    return dayjs(dateStr, 'YYYYMMDD').format('DD/MM/YYYY');
                } catch {
                    return '-';
                }
            },
            width: 120,
        },
        {
            title: 'Loại giao dịch',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => (
                <span className="text-xs">
                    {type === 'OnlinePayment' ? 'Thanh toán online' : type}
                </span>
            ),
            width: 150,
        },
        {
            title: 'Số tiền (VNĐ)',
            dataIndex: 'amount',
            key: 'amount',
            render: (value) => (
                <span className="font-semibold text-green-600">
                    {value ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '0'}
                </span>
            ),
            width: 130,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded text-xs ${status === 'Completed' ? 'bg-green-100 text-green-700' :
                    status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {status === 'Completed' ? 'Hoàn thành' :
                        status === 'Pending' ? 'Đang xử lý' : status}
                </span>
            ),
            width: 120,
        },
    ];

    const filteredTransactions = transactions.filter(t => {
        // Filter by date range
        let matchDate = true;
        if (t.referenceCode) {
            try {
                const dateStr = t.referenceCode.split('-')[1];
                const transDate = dayjs(dateStr, 'YYYYMMDD');
                matchDate = transDate.isAfter(dateRange[0]) && transDate.isBefore(dateRange[1]);
            } catch {
                matchDate = true;
            }
        }

        // Filter by search text
        let matchSearch = true;
        if (searchText) {
            const search = searchText.toLowerCase();
            matchSearch = (
                t.referenceCode?.toLowerCase().includes(search) ||
                t.id?.toLowerCase().includes(search) ||
                t.transactionType?.toLowerCase().includes(search)
            );
        }

        return matchDate && matchSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="admin-revenue-statistics">
            {/* Header */}
            <div className="header">
                <h1>Thống Kê Doanh Thu</h1>
                <p>Tổng quan về doanh thu và hoạt động sạc xe</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-container">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={8}>
                        <Card className="h-full">
                            <Statistic
                                title="Tổng doanh thu"
                                value={statistics.totalRevenue}
                                precision={2}
                                suffix="VNĐ"
                                prefix={<DollarSign className="text-green-500" size={20} />}
                                formatter={(value) => `${Number(value).toLocaleString('vi-VN')}`}
                            />
                            {statistics.growthRate !== 0 && (
                                <div className={`flex items-center gap-1 mt-2 text-sm ${statistics.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {statistics.growthRate > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    <span>{Math.abs(statistics.growthRate).toFixed(1)}% so với kỳ trước</span>
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card className="h-full">
                            <Statistic
                                title="Số giao dịch"
                                value={statistics.totalSessions}
                                prefix={<Calendar className="text-blue-500" size={20} />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card className="h-full">
                            <Statistic
                                title="Doanh thu TB/giao dịch"
                                value={statistics.averageRevenue}
                                precision={2}
                                suffix="VNĐ"
                                prefix={<TrendingUp className="text-purple-500" size={20} />}
                                formatter={(value) => `${Number(value).toLocaleString('vi-VN')}`}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Filters */}
            <div className="actions-card">
                <Row gutter={16} align="middle">
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo mã giao dịch..."
                            prefix={<Search size={16} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            value={filterPeriod}
                            onChange={handlePeriodChange}
                            className="w-full"
                            placeholder="Khoảng thời gian"
                        >
                            <Option value="today">Hôm nay</Option>
                            <Option value="7days">7 ngày qua</Option>
                            <Option value="30days">30 ngày qua</Option>
                            <Option value="90days">90 ngày qua</Option>
                            <Option value="year">1 năm qua</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={10}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                if (dates) {
                                    setDateRange(dates);
                                    setFilterPeriod('custom');
                                }
                            }}
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </Col>
                </Row>
            </div>

            {/* Transactions Table */}
            <div className="table-card">
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <Users size={20} />
                            <span>Chi tiết giao dịch ({filteredTransactions.length})</span>
                        </div>
                    }
                >
                    {filteredTransactions.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredTransactions}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 800, y: 400 }}
                            sticky
                        />
                    ) : (
                        <Empty description="Không có giao dịch nào trong khoảng thời gian này" />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default RevenueStatistics;
