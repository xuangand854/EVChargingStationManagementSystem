import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Card, Space, Tag, Progress, Statistic, Row, Col, Divider } from "antd";
import { StartSession, Stop } from "../API/ChargingSession";
import { PatchConnectorToggle } from "../API/Connector";
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
    Gauge
} from "lucide-react";

const Session = () => {
    const [sessionId, setSessionId] = useState(null);
    const [isPlugged, setIsPlugged] = useState(true);
    const [isCharging, setIsCharging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [chargingData, setChargingData] = useState({
        batteryLevel: 20,
        energyDelivered: 0,
        chargingPower: 0,
        estimatedTime: 0,
        cost: 0,
        startTime: null
    });
    const [timer, setTimer] = useState(0);
    const { connectorID } = useParams();
    const navigate = useNavigate();


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

    // Timer cho phiên sạc
    useEffect(() => {
        let interval;
        if (isCharging) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
                // Mô phỏng dữ liệu sạc thực tế
                setChargingData(prev => ({
                    ...prev,
                    batteryLevel: Math.min(100, prev.batteryLevel + 0.1),
                    energyDelivered: prev.energyDelivered + 0.05,
                    chargingPower: 22 + Math.random() * 3, // 22-25 kW
                    cost: prev.cost + 0.02,
                    estimatedTime: Math.max(0, prev.estimatedTime - 1)
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCharging]);

    // useEffect(() => {
    //     const fetchSession = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await StartSession();
    //             if (Array.isArray(response.data)) {
    //                 setSessionData(response.data);
    //             } else if (Array.isArray(response.data?.data)) {
    //                 setSessionData(response.data.data);
    //             } else {
    //                 console.error("Dữ liệu trả về không phải array:", response);
    //                 setSessionData([]);
    //             }
    //             console.log("response.data: ", response.data.id)
    //         } catch (error) {
    //             console.error("Lỗi khi lấy thông tin session:", error);
    //             setSessionData([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSession();
    // }, []);

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
    //             80, // batteryCapacityKWh
    //             20, // initialBatteryLevelPercent
    //             100, // expectedEnergiesKWh
    //             connectorID
    //         );
    //         console.log(" data trả về khi bắt đầu phiên sạc:", response);
    //         if (response?.data?.data?.id) {
    //             const newSessionId = response.data.data.id;
    //             setSessionId(newSessionId);
    //             console.log("✅ Session ID:", newSessionId);
    //         } else {
    //             console.warn("⚠️ Không tìm thấy sessionId trong response:", response);
    //         }


    const handleStartSession = async () => {
        try {
            setLoading(true);
            const response = await StartSession(
                80,  // batteryCapacityKWh
                20,  // initialBatteryLevelPercent
                100, // expectedEnergiesKWh
                connectorID
            );

            console.log("📦 Dữ liệu trả về khi bắt đầu phiên sạc:", response);

            const id = response?.data?.id || response?.id;
            if (id) {
                setSessionId(id);
                console.log("Session ID:", id);
            } else {
                console.warn("Không tìm thấy sessionId trong response:", response);
            }

            setIsCharging(true);
            setTimer(0);
            setChargingData(prev => ({
                ...prev,
                startTime: new Date(),
                estimatedTime: 3600, // 1 giờ ước tính
                chargingPower: 50
            }));
            message.success("Phiên sạc đã bắt đầu!");
        } catch (error) {
            console.error("Lỗi khi bắt đầu phiên sạc:", error.response?.data || error);
            message.error("Không thể bắt đầu phiên sạc!");
        } finally {
            setLoading(false);
        }
    };

    //     setIsCharging(true);
    //     message.success("⚡ Phiên sạc đã bắt đầu!");
    // } catch (error) {
    //     console.error("❌ Lỗi khi bắt đầu phiên sạc:", error.response?.data || error);
    //     message.error("Không thể bắt đầu phiên sạc!");
    // } finally {
    //     setLoading(false);
    // }
    //     };

    // const handleStopSession = async () => {
    //     try {
    //         await Stop(sessionData.id, 12.4);
    //         // await PatchConnectorToggle(true, connectorID);
    //         setIsCharging(false);
    //         // setIsPlugged(true);
    //         message.success("🛑 Phiên sạc đã dừng!");
    //     } catch (error) {
    //         console.error("❌ Lỗi khi dừng phiên sạc:", error);
    //         message.error("Lỗi khi dừng phiên sạc!");
    //     }
    // };
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

    // // Thanh toán thành công → cho phép rút sạc
    // const handlePaymentSuccess = async () => {
    //     try {
    //         console.log("💳 Thanh toán thành công. Đang toggle connector TRUE (rút khỏi xe, cắm lại trụ):", connectorID);
    //         await PatchConnectorToggle(true, connectorID);
    //         setIsPlugged(true);
    //         setIsPaid(true);
    //         message.success("💳 Thanh toán thành công! Bạn có thể rút sạc khỏi xe.");
    //     } catch (error) {
    //         console.error("❌ Lỗi khi thanh toán:", error);
    //         message.error("Không thể hoàn tất thanh toán!");
    //     }
    // };

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
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Chi phí"
                                        value={chargingData.cost}
                                        precision={2}
                                        suffix="VNĐ"
                                        prefix={<DollarSign className="text-green-500" size={16} />}
                                    />
                                </Col>
                            </Row>

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
                                    disabled={isPlugged || isCharging || loading}
                                    className="w-full h-12 text-lg font-medium"
                                    icon={<Power size={20} />}
                                    style={{ backgroundColor: '#52c41a' }}
                                >
                                    Bắt đầu sạc
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