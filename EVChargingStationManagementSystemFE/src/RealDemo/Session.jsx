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
    const [connectorStatus, setConnectorStatus] = useState("Available"); // Available, InUse, Charging, Faulted
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

                // Bước 1: Lấy thông tin connector để có chargingPostId và status
                const connectorResponse = await GetConnectorId(connectorID);
                console.log("🔌 Thông tin connector:", connectorResponse);

                const chargingPostId = connectorResponse?.data?.chargingPostId || connectorResponse?.chargingPostId;
                const status = connectorResponse?.data?.status || connectorResponse?.status || "Available";

                // Cập nhật trạng thái connector
                setConnectorStatus(status);
                console.log("📊 Trạng thái connector:", status);

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
        // Kiểm tra status trước khi cắm
        if (connectorStatus !== "Available") {
            message.warning("⚠️ Connector không ở trạng thái Available!");
            return;
        }

        setLoading(true);
        try {
            console.log("🔄 Cắm sạc vào xe - Toggle false (đang sử dụng):", connectorID);
            // toggle = false nghĩa là đang sử dụng (cắm vào xe)
            await PatchConnectorToggle(false, connectorID);
            setConnectorStatus("InUse");
            message.success("🔌 Đã cắm sạc vào xe!");
        } catch (error) {
            console.error("❌ Lỗi khi cắm sạc:", error);
            message.error("Không thể cắm sạc!");
        } finally {
            setLoading(false);
        }
    };

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

            // Cập nhật status sang Charging
            setConnectorStatus("Charging");

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

            // Cập nhật status sang Charging (chỉ local state vì API không hỗ trợ)
            setConnectorStatus("Charging");

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



    // Dừng phiên sạc
    const handleStopSession = async () => {
        setLoading(true);
        try {
            if (!sessionId) {
                message.warning("⚠️ Chưa có session để dừng!");
                return;
            }

            await Stop(sessionId, chargingData.energyDelivered);

            // Chuyển status về InUse (đã cắm nhưng không sạc) - chỉ local state
            setConnectorStatus("InUse");

            setIsCharging(false);
            message.success("🛑 Phiên sạc đã dừng! Vui lòng thanh toán trước khi rút sạc khỏi xe.");
        } catch (error) {
            console.error("❌ Lỗi khi dừng phiên sạc:", error);
            message.error("Lỗi khi dừng phiên sạc!");
        } finally {
            setLoading(false);
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
        // Kiểm tra status trước khi rút - chỉ cho phép rút khi InUse
        if (connectorStatus !== "InUse") {
            message.warning("⚠️ Connector không ở trạng thái InUse!");
            return;
        }

        setLoading(true);
        try {
            console.log("🔄 Rút sạc khỏi xe - Toggle true (có sẵn):", connectorID);
            // toggle = true nghĩa là có sẵn (rút khỏi xe, cắm lại trụ)
            await PatchConnectorToggle(true, connectorID);
            setConnectorStatus("Available");
            setIsPaid(false);
            setSessionId(null);
            message.success("🔋 Đã rút sạc khỏi xe!");
        } catch (error) {
            console.error("❌ Lỗi khi rút sạc:", error);
            message.error("Không thể rút sạc!");
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                        style={{ backgroundColor: '#e6f7f5' }}
                    >
                        <Zap style={{ color: '#00b09b' }} size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Trạm Sạc Xe Điện
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <span>Connector</span>
                        <span
                            className="px-3 py-1 rounded-full font-semibold"
                            style={{
                                background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                                color: 'white'
                            }}
                        >
                            #{connectorID}
                        </span>
                    </div>
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

                {/* Trạng thái hiện tại - Nổi bật */}
                <div className="mb-6">
                    <Card className="shadow-lg" style={{ borderWidth: '2px', borderColor: '#00b09b' }}>
                        <div className="flex items-center justify-center gap-3 py-2">
                            {connectorStatus === "Charging" ? (
                                <>
                                    <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: '#00b09b' }}></div>
                                    <span className="text-2xl font-bold" style={{ color: '#00b09b' }}>⚡ Đang sạc</span>
                                    <div className="ml-4 px-4 py-1 rounded-full" style={{ backgroundColor: '#e6f7f5' }}>
                                        <span className="font-semibold" style={{ color: '#00b09b' }}>{formatTime(timer)}</span>
                                    </div>
                                </>
                            ) : connectorStatus === "InUse" ? (
                                <>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00b09b' }}></div>
                                    <span className="text-2xl font-bold" style={{ color: '#00b09b' }}>🔌 Đã cắm - Sẵn sàng sạc</span>
                                </>
                            ) : connectorStatus === "Available" ? (
                                <>
                                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                    <span className="text-2xl font-bold text-gray-600">⏸️ Chưa kết nối</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                    <span className="text-2xl font-bold text-red-600">⚠️ {connectorStatus}</span>
                                </>
                            )}
                        </div>
                    </Card>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Cột trái - Thông tin sạc */}
                    <Col xs={24} lg={16}>
                        {/* Mức pin - Card lớn */}
                        <Card className="mb-6 shadow-lg border border-gray-200">
                            <div className="text-center mb-4">
                                <Battery
                                    className="mx-auto mb-2"
                                    size={40}
                                    style={{ color: '#00b09b' }}
                                />
                                <h3 className="text-lg font-semibold text-gray-700">Mức Pin</h3>
                            </div>
                            <div className="text-center mb-4">
                                <span
                                    className="text-6xl font-bold"
                                    style={{
                                        background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {chargingData.batteryLevel.toFixed(1)}
                                </span>
                                <span className="text-3xl text-gray-500">%</span>
                            </div>
                            <Progress
                                percent={chargingData.batteryLevel}
                                strokeColor={{
                                    '0%': '#ef4444',
                                    '30%': '#f59e0b',
                                    '50%': '#00b09b',
                                    '100%': '#96c93d'
                                }}
                                strokeWidth={12}
                                status={isCharging ? 'active' : 'normal'}
                            />
                        </Card>

                        {/* Thống kê - Grid 2x2 */}
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={12}>
                                <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="text-center">
                                        <Zap className="text-yellow-500 mx-auto mb-2" size={28} />
                                        <div className="text-2xl font-bold text-gray-800">
                                            {chargingData.energyDelivered.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500">kWh đã sạc</div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12}>
                                <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="text-center">
                                        <Gauge className="text-blue-500 mx-auto mb-2" size={28} />
                                        <div className="text-2xl font-bold text-gray-800">
                                            {isCharging ? chargingData.chargingPower.toFixed(1) : '0.0'}
                                        </div>
                                        <div className="text-sm text-gray-500">kW công suất</div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12}>
                                <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="text-center">
                                        <Clock className="text-purple-500 mx-auto mb-2" size={28} />
                                        <div className="text-2xl font-bold text-gray-800">
                                            {formatTime(timer)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {isCharging && chargingData.estimatedTime > 0
                                                ? `Còn ${formatTime(Math.floor(chargingData.estimatedTime))}`
                                                : 'Thời gian sạc'}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12}>
                                <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="text-center">
                                        <Banknote style={{ color: '#00b09b' }} className="mx-auto mb-2" size={28} />
                                        <div className="text-2xl font-bold text-gray-800">
                                            {chargingData.cost.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-sm text-gray-500">VNĐ</div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Bảng giá */}
                        <Card className="shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <span>📋</span> Thông tin chi tiết
                            </h3>

                            {!pricingData.loading ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Giá điện</span>
                                        <span className="font-semibold text-gray-800">
                                            {pricingData.pricePerKWh.toLocaleString()} VNĐ/kWh
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Thuế VAT</span>
                                        <span className="font-semibold text-gray-800">{pricingData.vatRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-gray-700 font-medium">Công suất tối đa</span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {pricingData.maxPowerKw} kW
                                        </span>
                                    </div>
                                    {chargingData.energyDelivered > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Tiền điện</span>
                                            <span className="font-semibold text-gray-800">
                                                {(chargingData.energyDelivered * pricingData.pricePerKWh).toLocaleString()} VNĐ
                                            </span>
                                        </div>
                                    )}
                                    {sessionId && (
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200 mt-4">
                                            <span className="text-gray-700 font-medium">Mã phiên</span>
                                            <span className="font-mono text-green-700 font-semibold">{sessionId}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">Đang tải thông tin...</div>
                            )}
                        </Card>
                    </Col>

                    {/* Cột phải - Điều khiển */}
                    <Col xs={24} lg={8}>
                        <Card className="shadow-lg border border-gray-200 sticky top-4">
                            <div className="text-center mb-6">
                                <Power
                                    className="mx-auto mb-2"
                                    size={32}
                                    style={{ color: '#00b09b' }}
                                />
                                <h3 className="text-xl font-bold text-gray-800">Điều Khiển</h3>
                            </div>
                            <Space direction="vertical" className="w-full" size="middle">
                                {/* Nút cắm sạc */}
                                <Button
                                    type="primary"
                                    onClick={handlePlugToCar}
                                    disabled={connectorStatus !== "Available" || loading}
                                    className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                    icon={<PlugZap size={22} />}
                                    style={{
                                        background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                                        border: 'none'
                                    }}
                                >
                                    🔌 Cắm sạc vào xe
                                </Button>

                                {/* Nút bắt đầu phiên sạc */}
                                <Button
                                    type="primary"
                                    onClick={handleStartSession}
                                    disabled={connectorStatus !== "InUse" || isCharging || loading || pricingData.loading}
                                    className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                    icon={<Power size={22} />}
                                    style={{
                                        background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                                        border: 'none'
                                    }}
                                >
                                    {pricingData.loading ? '⏳ Đang tải...' : '⚡ Bắt đầu sạc'}
                                </Button>

                                {/* Nút dừng phiên sạc */}
                                <Button
                                    danger
                                    onClick={handleStopSession}
                                    disabled={connectorStatus !== "Charging" || loading}
                                    className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                    icon={<StopCircle size={22} />}
                                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    🛑 Dừng sạc
                                </Button>

                                <Divider className="my-2" />

                                {/* Nút thanh toán */}
                                <Button
                                    type="primary"
                                    onClick={handlePayment}
                                    disabled={connectorStatus === "Charging" || loading || !sessionId}
                                    className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                    icon={<CreditCard size={22} />}
                                    style={{
                                        background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                                        border: 'none'
                                    }}
                                >
                                    💳 Thanh toán
                                </Button>

                                {/* Nút rút sạc - chỉ cho phép khi InUse và đã thanh toán */}
                                <Button
                                    onClick={handleUnplugFromCar}
                                    disabled={connectorStatus !== "InUse" || (!isPaid && sessionId)}
                                    className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                    icon={<Plug size={22} />}
                                    style={{
                                        borderColor: '#00b09b',
                                        color: (connectorStatus !== "InUse" || (!isPaid && sessionId)) ? undefined : '#00b09b'
                                    }}
                                >
                                    🔋 Rút sạc khỏi xe
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Session;