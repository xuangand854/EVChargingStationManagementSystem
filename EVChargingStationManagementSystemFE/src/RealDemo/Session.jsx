import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, message, Card, Space, Tag } from "antd";
import { StartSession, Stop } from "../API/ChargingSession";
import { PatchConnectorToggle } from "../API/Connector";
import { PostPayment } from "../API/Payment";
import { PlugZap, Power, StopCircle, Plug, CreditCard } from "lucide-react";

const Session = () => {
    const [sessionId, setSessionId] = useState(null);
    const [isPlugged, setIsPlugged] = useState(true); // trạng thái cắm lên trụ đang không cắm lên xe 
    const [isCharging, setIsCharging] = useState(false); // trạng thái đang sạc
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const { connectorID } = useParams();
    console.log("connectorId:", connectorID);
    console.log("sessionId:", sessionId);


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

            await Stop(sessionId, 12.4);
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
            setLoading(true);
            await PostPayment(sessionId);
            message.success("Thanh toán thành công!");
            setIsPaid(true);
        } catch (error) {
            message.error("Thanh toán thất bại!");
            console.error("Lỗi thanh toán:", error);
        } finally {
            setLoading(false);
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



    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 to-white">
            <Card
                title="🚗 Phiên Sạc Xe"
                className="w-full max-w-md rounded-2xl shadow-lg border border-pink-100"
            >
                <Space direction="vertical" className="w-full text-center">
                    <h3 className="text-gray-600 font-medium">
                        Connector ID: <Tag color="magenta">{connectorID}</Tag>
                    </h3>

                    <div className="flex flex-col gap-4 mt-4">
                        {/* Nút cắm sạc */}
                        <Button
                            type="primary"
                            onClick={handlePlugToCar}
                            disabled={!isPlugged || loading}
                            className="bg-pink-500 hover:bg-pink-600 border-none rounded-xl py-5 text-lg"
                            icon={<PlugZap size={20} />}
                        >
                            Cắm sạc vào xe
                        </Button>
                        {/* Rút sạc khỏi xe */}
                        <Button
                            onClick={handleUnplugFromCar}
                            disabled={isPlugged || isCharging || (!isPaid && sessionId)}
                            className="bg-gray-300 hover:bg-gray-400 border-none rounded-xl py-5 text-lg"
                            icon={<Plug size={20} />}
                        >
                            Rút sạc khỏi xe
                        </Button>



                        {/* Nút bắt đầu phiên sạc */}
                        <Button
                            type="default"
                            onClick={handleStartSession}
                            disabled={isPlugged || isCharging || loading}
                            className="rounded-xl py-5 text-lg"
                            icon={<Power size={20} />}
                        >
                            Bắt đầu phiên sạc
                        </Button>

                        {/* Nút dừng phiên sạc */}
                        <Button
                            danger
                            onClick={handleStopSession}
                            disabled={!isCharging || loading}
                            className="rounded-xl py-5 text-lg"
                            icon={<StopCircle size={20} />}
                        >
                            Dừng phiên sạc
                        </Button>

                        {/* Thanh toán */}
                        {isStopped && !isPaid && (
                            <Button
                                type="primary"
                                onClick={handlePayment}
                                disabled={isCharging || loading}
                                className="bg-green-500 hover:bg-green-600 border-none rounded-xl py-5 text-lg"
                                icon={<CreditCard size={20} />}
                            >
                                Thanh toán
                            </Button>
                        )}
                    </div>

                    <div className="mt-6">
                        {isCharging ? (
                            <Tag color="green">Đang sạc 🔋</Tag>
                        ) : !isPlugged ? (
                            <Tag color="blue">Đã cắm sạc nhưng chưa bắt đầu</Tag>
                        ) : (
                            <Tag color="default">Chưa cắm sạc</Tag>
                        )}
                    </div>

                    {sessionId && (
                        <div className="mt-4">
                            <p className="text-gray-600">
                                📘 <b>Session ID:</b> {sessionId}
                            </p>
                        </div>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default Session;