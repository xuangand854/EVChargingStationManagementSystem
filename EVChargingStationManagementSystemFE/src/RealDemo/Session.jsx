import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Card, Space, Tag, Progress, Statistic, Row, Col, Divider, Modal, Input } from "antd";
import { StartSession, Stop } from "../API/ChargingSession";
import { getChargingPostId } from "../API/ChargingPost";
import { PatchConnectorToggle, GetConnectorId } from "../API/Connector";
import { GetVAT, GetByConfigName, GetPrice } from "../API/SystemConfiguration";

import {
    PlugZap,
    Power,
    StopCircle,
    Plug,
    CreditCard,
    Battery,
    Clock,
    Zap,
    DollarSign,
    Gauge,
    Banknote
} from "lucide-react";

const Session = () => {
    const [sessionId, setSessionId] = useState(null);
    const [isPlugged, setIsPlugged] = useState(true);
    const [isCharging, setIsCharging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [chargingData, setChargingData] = useState({
        batteryLevel: 20,
        energyDelivered: 0,
        chargingPower: 0,
        estimatedTime: 0,
        cost: 0,
        startTime: null
    });
    const [pricingData, setPricingData] = useState({
        pricePerKWh: 0,
        vatRate: 0,
        maxPowerKw: 0,
        loading: true
    });
    const [timer, setTimer] = useState(0);
    const { connectorID } = useParams();
    const navigate = useNavigate();

    // Hàm tính toán thời gian sạc còn lại
    const calculateEstimatedTime = (currentBatteryLevel, maxPower) => {
        const batteryCapacityKWh = 80; // Pin xe 80kWh
        const currentBatteryKWh = (currentBatteryLevel / 100) * batteryCapacityKWh;
        const remainingCapacity = batteryCapacityKWh - currentBatteryKWh;
        return (remainingCapacity / maxPower) * 3600; // giây
    };


    useEffect(() => {
        // Nếu vừa thanh toán xong, bật quyền rút sạc rồi dọn state lưu tạm
        try {
            const paid = sessionStorage.getItem('payment.paid') === 'true';
            if (paid) {
                setIsPaid(true);
                message.success('Thanh toán thành công! Bạn có thể rút sạc.');
            }
        } catch { }
        return () => { };
    }, []);

    // Lấy giá điện và thuế VAT khi component mount
    useEffect(() => {
        const fetchPricingData = async () => {
            try {
                setPricingData(prev => ({ ...prev, loading: true }));

                // Bước 1: Lấy thông tin connector để có chargingPostId
                const connectorResponse = await GetConnectorId(connectorID);
                console.log("🔌 Thông tin connector:", connectorResponse);

                const chargingPostId = connectorResponse?.data?.chargingPostId || connectorResponse?.chargingPostId;

                // Bước 2: Lấy giá điện, VAT và thông tin trạm sạc song song
                const [priceResponse, vatResponse, chargingPostResponse] = await Promise.all([
                    GetPrice(),
                    GetVAT(),
                    chargingPostId ? getChargingPostId(chargingPostId) : Promise.resolve(null)
                ]);

                console.log("💰 Giá điện:", priceResponse);
                console.log("📊 VAT:", vatResponse);
                console.log("⚡ Thông tin trạm sạc:", chargingPostResponse);

                // Sửa lại cách parse dữ liệu dựa trên cấu trúc thực tế
                const pricePerKWh = parseFloat(priceResponse?.data?.minValue || priceResponse?.minValue || 0);
                const vatRate = parseFloat(vatResponse?.data?.minValue || vatResponse?.minValue || 0);
                const maxPowerKw = parseFloat(chargingPostResponse?.data?.maxPowerKw || chargingPostResponse?.maxPowerKw || 22);

                setPricingData({
                    pricePerKWh,
                    vatRate,
                    maxPowerKw,
                    loading: false
                });

                message.success(`Đã tải thông tin: Giá ${pricePerKWh.toLocaleString()} VNĐ/kWh, VAT ${vatRate}%, Công suất tối đa ${maxPowerKw}kW`);
            } catch (error) {
                console.error("❌ Lỗi khi lấy thông tin:", error);
                message.error("Không thể lấy thông tin hệ thống!");
                setPricingData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchPricingData();
    }, [connectorID]);

    // Timer cho phiên sạc với tính toán chi phí thực tế
    useEffect(() => {
        let interval;
        if (isCharging && !pricingData.loading) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
                // Mô phỏng dữ liệu sạc thực tế
                setChargingData(prev => {
                    // Sử dụng công suất tối đa thực tế từ API
                    const maxPower = pricingData.maxPowerKw || 22;
                    const powerVariation = maxPower * 0.1; // Dao động 10%
                    const newChargingPower = maxPower - powerVariation + Math.random() * (powerVariation * 2);
                    const newEnergyDelivered = prev.energyDelivered + (newChargingPower / 3600); // kWh/second

                    // Tính toán % pin thực tế dựa trên dung lượng pin
                    const batteryCapacityKWh = 80; // Pin xe 80kWh
                    const currentBatteryKWh = (prev.batteryLevel / 100) * batteryCapacityKWh; // kWh hiện tại
                    const newBatteryKWh = currentBatteryKWh + (newChargingPower / 3600); // Thêm năng lượng sạc được
                    const newBatteryPercent = Math.min(100, (newBatteryKWh / batteryCapacityKWh) * 100);

                    // Tính chi phí thực tế dựa trên API
                    const baseCost = newEnergyDelivered * pricingData.pricePerKWh;
                    const vatAmount = baseCost * (pricingData.vatRate / 100);
                    const totalCost = baseCost + vatAmount;

                    // Tính thời gian còn lại thực tế
                    const remainingCapacity = batteryCapacityKWh - newBatteryKWh; // kWh còn lại cần sạc
                    const estimatedTimeSeconds = (remainingCapacity / newChargingPower) * 3600; // giây

                    return {
                        ...prev,
                        batteryLevel: newBatteryPercent,
                        energyDelivered: newEnergyDelivered,
                        chargingPower: newChargingPower,
                        cost: totalCost,
                        estimatedTime: Math.max(0, estimatedTimeSeconds)
                    };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCharging, pricingData]);

    const handlePlugToCar = async () => {
        try {
            console.log("🔄 Đang gửi toggle connector sang false (rút khỏi trụ, cắm vào xe):", connectorID);
            await PatchConnectorToggle(false, connectorID); // false = đang sử dụng
            setIsPlugged(false);
            message.success("🔌 Đã cắm sạc vào xe!");
        } catch (error) {
            console.error("❌ Lỗi khi cắm sạc:", error);
            message.error("Không thể cắm sạc!");
        }
    };

    // const handleStartSession = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await StartSession(
    //             80,  // batteryCapacityKWh
    //             20,  // initialBatteryLevelPercent
    //             100, // expectedEnergiesKWh
    //             connectorID
    //         );

    //         console.log("📦 Dữ liệu trả về khi bắt đầu phiên sạc:", response);

    //         const id = response?.data?.id || response?.id;
    //         if (id) {
    //             setSessionId(id);
    //             console.log("Session ID:", id);
    //         } else {
    //             console.warn("Không tìm thấy sessionId trong response:", response);
    //         }

    //         setIsCharging(true);
    //         setTimer(0);
    //         setChargingData(prev => ({
    //             ...prev,
    //             startTime: new Date(),
    //             estimatedTime: 3600, // 1 giờ ước tính
    //             chargingPower: pricingData.maxPowerKw || 22,
    //             energyDelivered: 0, // Reset năng lượng
    //             cost: 0 // Reset chi phí
    //         }));
    //         message.success("Phiên sạc đã bắt đầu!");
    //     } catch (error) {
    //         console.error("Lỗi khi bắt đầu phiên sạc:", error.response?.data || error);
    //         message.error("Không thể bắt đầu phiên sạc!");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleStartSession = async () => {

        setIsPhoneModalVisible(true);
    };

    const handleConfirmPhone = async () => {
        setLoading(true);
        try {
            const response = await StartSession(
                80,  // batteryCapacityKWh
                20,  // initialBatteryLevelPercent
                100, // expectedEnergiesKWh
                connectorID,
                phoneNumber // Gửi số điện thoại kèm theo
            );

            const id = response?.data?.id || response?.id;
            if (id) setSessionId(id);

            setIsCharging(true);
            setTimer(0);
            setChargingData(prev => ({
                ...prev,
                startTime: new Date(),
                estimatedTime: calculateEstimatedTime(prev.batteryLevel, pricingData.maxPowerKw || 22),
                chargingPower: pricingData.maxPowerKw || 22,
                energyDelivered: 0,
                cost: 0
            }));

            message.success("Phiên sạc đã bắt đầu!");
        } catch (error) {
            console.error("Lỗi khi bắt đầu phiên sạc:", error);
            message.error("Không thể bắt đầu phiên sạc!");
        } finally {
            setLoading(false);
            setIsPhoneModalVisible(false);
            setPhoneNumber("");
        }
    };

    // Xử lý khi người dùng nhấn "Không" trong modal
    const handleCancelPhone = async () => {
        setIsPhoneModalVisible(false);
        setPhoneNumber("");
        // Bắt đầu sạc bình thường
        setLoading(true);
        try {
            const response = await StartSession(
                80,
                20,
                100,
                connectorID
            );

            const id = response?.data?.id || response?.id;
            if (id) setSessionId(id);

            setIsCharging(true);
            setTimer(0);
            setChargingData(prev => ({
                ...prev,
                startTime: new Date(),
                estimatedTime: calculateEstimatedTime(prev.batteryLevel, pricingData.maxPowerKw || 22),
                chargingPower: pricingData.maxPowerKw || 22,
                energyDelivered: 0,
                cost: 0
            }));

            message.success("Phiên sạc đã bắt đầu!");
        } catch (error) {
            console.error("Lỗi khi bắt đầu phiên sạc:", error);
            message.error("Không thể bắt đầu phiên sạc!");
        } finally {
            setLoading(false);
        }
    };



    // Dừng phiên sạc (không toggle connector)
    const handleStopSession = async () => {
        try {
            if (!sessionId) {
                message.warning("⚠️ Chưa có session để dừng!");
                return;
            }

            await Stop(sessionId, chargingData.energyDelivered);
            setIsCharging(false);
            message.success("🛑 Phiên sạc đã dừng! Vui lòng thanh toán trước khi rút sạc khỏi xe.");
        } catch (error) {
            console.error("❌ Lỗi khi dừng phiên sạc:", error);
            message.error("Lỗi khi dừng phiên sạc!");
        }
    };

    const handlePayment = async () => {
        if (!sessionId) {
            message.error("Không tìm thấy mã phiên sạc!");
            return;
        }
        try {
            message.info("Đang chuyển đến trang thanh toán...");
            try {
                sessionStorage.setItem('payment.sessionId', String(sessionId));
                sessionStorage.setItem('payment.connectorId', String(connectorID));
                sessionStorage.setItem('payment.returnPath', window.location.pathname);
            } catch { }
            navigate(`/payment-method/${sessionId}`); // ✅ chuyển hướng đến trang chọn phương thức thanh toán
        } catch (error) {
            console.error("Lỗi khi điều hướng:", error);
        }
    };


    // Rút sạc khỏi xe (sau khi thanh toán hoặc chưa sạc)
    const handleUnplugFromCar = async () => {
        try {
            console.log("🔄 Toggle connector sang TRUE (rút khỏi xe, cắm lại trụ):", connectorID);
            await PatchConnectorToggle(true, connectorID);
            setIsPlugged(true);
            setIsPaid(false);
            message.success("🔋 Đã rút sạc khỏi xe và cắm lại trụ!");
        } catch (error) {
            console.error("❌ Lỗi khi rút sạc:", error);
            message.error("Không thể rút sạc!");
        }
    };



    // Hàm format thời gian
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">⚡ Trạm Sạc Xe Điện</h1>
                    <p className="text-gray-600">Connector ID: <Tag color="blue">{connectorID}</Tag></p>
                </div>

                <Modal
                    title="Nhập số điện thoại để tích điểm"
                    open={isPhoneModalVisible}
                    onOk={handleConfirmPhone}
                    onCancel={handleCancelPhone}
                    okText="Xác nhận"
                    cancelText="Không"
                >
                    <p>Bạn có muốn nhập số điện thoại để tích điểm không?</p>
                    <Input
                        placeholder="Nhập số điện thoại"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={10}
                    />
                </Modal>

                <Row gutter={[16, 16]}>
                    {/* Cột trái - Thông tin sạc */}
                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <Battery className="text-green-600" size={20} />
                                    <span>Thông Tin Sạc</span>
                                </div>
                            }
                            className="h-full"
                        >
                            {/* Trạng thái pin */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Mức pin</span>
                                    <span className="font-semibold text-lg">{chargingData.batteryLevel.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    percent={chargingData.batteryLevel}
                                    strokeColor={{
                                        '0%': '#ff4d4f',
                                        '30%': '#faad14',
                                        '70%': '#52c41a',
                                        '100%': '#1890ff'
                                    }}
                                    size="large"
                                />
                            </div>

                            {/* Thống kê sạc */}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Năng lượng đã sạc"
                                        value={chargingData.energyDelivered}
                                        precision={2}
                                        suffix="kWh"
                                        prefix={<Zap className="text-yellow-500" size={16} />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Công suất sạc"
                                        value={isCharging ? chargingData.chargingPower : 0}
                                        precision={1}
                                        suffix="kW"
                                        prefix={<Gauge className="text-blue-500" size={16} />}
                                    />
                                </Col>
                            </Row>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Thời gian sạc"
                                        value={formatTime(timer)}
                                        prefix={<Clock className="text-purple-500" size={16} />}
                                    />
                                    {isCharging && chargingData.estimatedTime > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Còn lại: {formatTime(Math.floor(chargingData.estimatedTime))}
                                        </div>
                                    )}
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Chi phí"
                                        value={chargingData.cost}
                                        precision={0}
                                        suffix="VNĐ"
                                        prefix={<Banknote className="text-green-500" size={16} />}
                                        formatter={(value) => `${Number(value).toLocaleString()}`}
                                    />
                                </Col>
                            </Row>

                            {/* Thông tin giá cả chi tiết */}
                            {!pricingData.loading && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Bảng giá</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-600">Giá điện:</span>
                                            <span className="font-medium ml-1">
                                                {pricingData.pricePerKWh.toLocaleString()} VNĐ/kWh
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">VAT:</span>
                                            <span className="font-medium ml-1">{pricingData.vatRate}%</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Công suất tối đa:</span>
                                            <span className="font-medium ml-1 text-blue-600">
                                                {pricingData.maxPowerKw} kW
                                            </span>
                                        </div>
                                        {chargingData.energyDelivered > 0 && (
                                            <>
                                                <div>
                                                    <span className="text-gray-600">Tiền điện:</span>
                                                    <span className="font-medium ml-1">
                                                        {(chargingData.energyDelivered * pricingData.pricePerKWh).toLocaleString()} VNĐ
                                                    </span>
                                                </div>
                                                {/* <div>
                                                    <span className="text-gray-600">Thuế VAT:</span>
                                                    <span className="font-medium ml-1">
                                                        {((chargingData.energyDelivered * pricingData.pricePerKWh) * (pricingData.vatRate / 100)).toLocaleString()} VNĐ
                                                    </span>
                                                </div> */}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Trạng thái hiện tại */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center gap-2">
                                    {isCharging ? (
                                        <>
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <Tag color="green" className="text-lg px-4 py-1">Đang sạc</Tag>
                                        </>
                                    ) : !isPlugged ? (
                                        <>
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <Tag color="blue" className="text-lg px-4 py-1">Đã cắm sạc - Sẵn sàng</Tag>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                            <Tag color="default" className="text-lg px-4 py-1">Chưa kết nối</Tag>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Cột phải - Điều khiển */}
                    <Col xs={24} lg={10}>
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <Power className="text-blue-600" size={20} />
                                    <span>Điều Khiển</span>
                                </div>
                            }
                            className="h-full"
                        >
                            <Space direction="vertical" className="w-full" size="large">
                                {/* Nút cắm sạc */}
                                <Button
                                    type="primary"
                                    onClick={handlePlugToCar}
                                    disabled={!isPlugged || loading}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<PlugZap size={20} />}
                                    style={{ backgroundColor: '#1890ff' }}
                                >
                                    Cắm sạc vào xe
                                </Button>

                                {/* Nút bắt đầu phiên sạc */}
                                <Button
                                    type="primary"
                                    onClick={handleStartSession}
                                    disabled={isPlugged || isCharging || loading || pricingData.loading}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<Power size={20} />}
                                    style={{ backgroundColor: '#52c41a' }}
                                >
                                    {pricingData.loading ? 'Đang tải giá...' : 'Bắt đầu sạc'}
                                </Button>

                                {/* Nút dừng phiên sạc */}
                                <Button
                                    danger
                                    onClick={handleStopSession}
                                    disabled={!isCharging || loading}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<StopCircle size={20} />}
                                >
                                    Dừng sạc
                                </Button>

                                {/* Nút thanh toán */}
                                <Button
                                    type="primary"
                                    onClick={handlePayment}
                                    disabled={isCharging || loading || !sessionId}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<CreditCard size={20} />}
                                    style={{ backgroundColor: '#faad14' }}
                                >
                                    Thanh toán
                                </Button>

                                {/* Nút rút sạc */}
                                <Button
                                    onClick={handleUnplugFromCar}
                                    disabled={isPlugged || isCharging || (!isPaid && sessionId)}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<Plug size={20} />}
                                >
                                    Rút sạc khỏi xe
                                </Button>

                                {sessionId && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600 text-center">
                                            <strong>Mã phiên:</strong> {sessionId}
                                        </p>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Session;