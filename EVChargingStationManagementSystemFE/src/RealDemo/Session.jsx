import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Card, Space, Progress, Row, Col, Divider, Modal, Input } from "antd";
import { toast } from "react-toastify";
import { StartSession, Stop } from "../API/ChargingSession";
import { getChargingPostId } from "../API/ChargingPost";
import { PatchConnectorToggle, GetConnectorId } from "../API/Connector";
import { GetVAT, GetPrice } from "../API/SystemConfiguration";
import { BookCheckin } from "../API/Booking";

import {
    PlugZap,
    Power,
    StopCircle,
    Plug,
    CreditCard,
    Battery,
    Clock,
    Zap,
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
    const [bookingId, setBookingId] = useState(null);
    const [vehicleModelId, setVehicleModelId] = useState(null);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [otpValues, setOtpValues] = useState(["", "", "", ""]);
    const [otpError, setOtpError] = useState(false);
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

    // Kiểm tra connector status khi component mount
    useEffect(() => {
        const checkConnectorStatus = async () => {
            try {
                const connectorResponse = await GetConnectorId(connectorID);
                const status = connectorResponse?.data?.status || connectorResponse?.status;

                if (status === "Reserved") {
                    setShowCheckinModal(true);
                }
            } catch (error) {
                toast.error("Không thể kiểm tra trạng thái connector");
            }
        };

        if (connectorID) {
            checkConnectorStatus();
        }
    }, [connectorID]);

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
                console.error(" Lỗi khi lấy thông tin:", error);
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

    const handleCheckin = async () => {
        const checkinCode = otpValues.join("");

        if (checkinCode.length !== 4) {
            setOtpError(true);
            toast.error("Vui lòng nhập đủ 4 số!");
            setTimeout(() => setOtpError(false), 1000);
            return;
        }

        setOtpError(false);
        setLoading(true);

        try {
            const response = await BookCheckin(checkinCode);

            // Debug: Log toàn bộ response để xem cấu trúc
            console.log("🔍 Full BookCheckin response:", response);
            console.log("🔍 response.data:", response?.data);

            // Tự động import bookingId và phone từ response
            const checkinData = response?.data || response;
            console.log("🔍 checkinData:", checkinData);
            console.log("🔍 checkinData.bookingId:", checkinData?.bookingId);
            // console.log("🔍 checkinData.phone:", checkinData?.phone);
            // console.log("🔍 checkinData.phoneNumber:", checkinData?.phoneNumber);

            // Lấy thông tin từ response theo Swagger:
            // - id → bookingId
            // - phone → driverPhone
            // - vehicleModelId → vehicleModelId
            const bookingIdValue = checkinData?.id || checkinData?.bookingId;
            const driverPhone = checkinData?.phone || checkinData?.driverPhone;
            const vehicleModelIdValue = checkinData?.vehicleModelId;

            console.log("🔍 bookingIdValue (id):", bookingIdValue);
            console.log("🔍 phoneValue (phone):", driverPhone);
            console.log("🔍 vehicleModelIdValue:", vehicleModelIdValue);

            if (bookingIdValue) {
                setBookingId(bookingIdValue);
                toast.success(`✅ Check-in thành công! Booking ID: ${bookingIdValue}`);
            } else {
                toast.success("✅ Check-in thành công! Bạn có thể bắt đầu sạc.");
            }

            if (driverPhone) {
                setPhoneNumber(driverPhone);
                toast.info(`📱 Số điện thoại: ${driverPhone}`);
            }

            if (vehicleModelIdValue) {
                setVehicleModelId(vehicleModelIdValue);
                toast.info(`🚗 Thông tin xe đã được tự động điền`);
            }

            setShowCheckinModal(false);
            setOtpValues(["", "", "", ""]);

            const connectorResponse = await GetConnectorId(connectorID);
            const newStatus = connectorResponse?.data?.status || connectorResponse?.status;
            setConnectorStatus(newStatus);

        } catch (error) {
            setOtpError(true);
            const errorMsg = error.response?.data?.message || error.response?.data?.title || "Mã check-in không đúng!";
            toast.error(errorMsg);
            setTimeout(() => setOtpError(false), 1000);
        } finally {
            setLoading(false);
        }
    };

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
            message.success(" Đã cắm sạc vào xe!");
        } catch (error) {
            console.error(" Lỗi khi cắm sạc:", error);
            message.error("Không thể cắm sạc!");
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = async () => {
        // Nếu đã có số điện thoại từ check-in, bỏ qua modal và bắt đầu luôn
        if (phoneNumber) {
            await handleConfirmPhone();
        } else {
            setIsPhoneModalVisible(true);
        }
    };

    const handleConfirmPhone = async () => {
        setLoading(true);
        try {
            const params = {
                connectorId: connectorID,
                batteryCapacityKWh: 80,
                initialBatteryLevelPercent: 20,
                expectedEnergiesKWh: 100
            };

            if (phoneNumber?.trim()) {
                params.phone = phoneNumber.trim();
                if (bookingId) params.bookingId = bookingId;
            }

            if (vehicleModelId) {
                params.vehicleModelId = vehicleModelId;
            }

            // Gọi API
            const response = await StartSession(
                params.bookingId || null,
                params.batteryCapacityKWh,
                params.initialBatteryLevelPercent,
                params.expectedEnergiesKWh,
                params.phone || null,
                params.connectorId,
                params.vehicleModelId || null
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

            if (bookingId) {
                toast.success(`✅ Phiên sạc đã bắt đầu! Booking ID: ${bookingId}`);
            } else {
                toast.success("✅ Phiên sạc đã bắt đầu!");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            toast.error(`Không thể bắt đầu phiên sạc: ${errorMsg}`);
        } finally {
            setLoading(false);
            setIsPhoneModalVisible(false);
            // Không reset phoneNumber để giữ lại cho lần sau
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
                null,
                80,
                20,
                100,
                null,
                connectorID,
                null
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
                //
                sessionStorage.setItem('payment.amount', String(chargingData.cost));

            } catch { }
            navigate(`/payment-method/${sessionId}`); //  chuyển hướng đến trang chọn phương thức thanh toán
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
                    {phoneNumber ? (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#e6f7f5',
                                borderRadius: '8px',
                                border: '1px solid #00b09b',
                                marginBottom: '12px'
                            }}>
                                <p style={{ margin: 0, color: '#00b09b', fontWeight: '600' }}>
                                    ✅ Số điện thoại đã được tự động điền từ booking
                                </p>
                            </div>
                            <p style={{ marginBottom: '8px' }}>Số điện thoại của bạn:</p>
                        </div>
                    ) : (
                        <p style={{ marginBottom: '8px' }}>Bạn có muốn nhập số điện thoại để tích điểm không?</p>
                    )}
                    <Input
                        placeholder="Nhập số điện thoại"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={10}
                        style={{
                            borderColor: phoneNumber ? '#00b09b' : undefined,
                            borderWidth: phoneNumber ? '2px' : '1px'
                        }}
                    />
                    {bookingId && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            📋 Booking ID: <strong>{bookingId}</strong>
                        </div>
                    )}
                </Modal>

                {/* Modal Check-in */}
                <Modal
                    title={<div style={{ textAlign: 'center', fontSize: '20px' }}>🎫 Nhập mã Check-in</div>}
                    open={showCheckinModal}
                    onOk={handleCheckin}
                    onCancel={() => {
                        // Nếu connector vẫn Reserved, đưa user về trang trước (danh sách connector)
                        if (connectorStatus === "Reserved") {
                            message.info("Quay về danh sách connector");
                            navigate(-1);
                        } else {
                            // Nếu không còn Reserved, chỉ đóng modal
                            setShowCheckinModal(false);
                            setOtpValues(["", "", "", ""]);
                        }
                    }}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    okButtonProps={{ loading: loading }}
                    closable={true}
                    maskClosable={false}
                    centered
                    width={500}
                >
                    <div style={{ padding: '20px 0' }}>
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                color: '#1f2937',
                                marginBottom: '8px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                ⚠️ Connector đang được đặt trước
                            </p>
                            <p style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                margin: 0
                            }}>
                                Vui lòng nhập mã check-in 4 số để xác nhận và bắt đầu sạc
                            </p>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontWeight: '600',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '16px'
                            }}>
                                Mã Check-in (4 số)
                            </label>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    animation: otpError ? 'shake 0.5s' : 'none'
                                }}
                            >
                                <style>{`
                                    @keyframes shake {
                                        0%, 100% { transform: translateX(0); }
                                        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                                        20%, 40%, 60%, 80% { transform: translateX(10px); }
                                    }
                                `}</style>
                                {otpValues.map((value, index) => (
                                    <Input
                                        key={index}
                                        id={`otp-${index}`}
                                        value={value}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 1) {
                                                const newOtpValues = [...otpValues];
                                                newOtpValues[index] = val;
                                                setOtpValues(newOtpValues);
                                                setOtpError(false); // Reset error khi user nhập

                                                // Auto focus next input
                                                if (val && index < 3) {
                                                    document.getElementById(`otp-${index + 1}`)?.focus();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Backspace: focus previous input
                                            if (e.key === 'Backspace' && !value && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            }
                                        }}
                                        maxLength={1}
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            fontSize: '32px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            borderRadius: '8px',
                                            border: otpError ? '2px solid #ef4444' : '2px solid #d1d5db',
                                            backgroundColor: otpError ? '#fee2e2' : 'white',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </div>
                            {/* <p style={{
                                color: '#9ca3af',
                                fontSize: '12px',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                Mã này được gửi qua email/SMS khi bạn đặt chỗ
                            </p> */}
                        </div>
                    </div>
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
                                percent={chargingData.batteryLevel.toFixed(1)}
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
                                        <span className="text-gray-600">Giá điện: </span>
                                        <span className="font-semibold text-gray-800">
                                            {pricingData.pricePerKWh.toLocaleString()} VNĐ/kWh
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Thuế VAT: </span>
                                        <span className="font-semibold text-gray-800">{pricingData.vatRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-gray-700 font-medium">Công suất tối đa: </span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {pricingData.maxPowerKw} kW
                                        </span>
                                    </div>
                                    {chargingData.energyDelivered > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Tiền điện: </span>
                                            <span className="font-semibold text-gray-800">
                                                {(chargingData.energyDelivered * pricingData.pricePerKWh).toFixed(0).toLocaleString()} VNĐ
                                            </span>
                                        </div>
                                    )}
                                    {sessionId && (
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200 mt-4">
                                            <span className="text-gray-700 font-medium">Mã phiên: </span>
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
                        <Card
                            className="shadow-xl border-2 sticky top-4"
                            style={{
                                borderColor: '#00b09b',
                                background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)'
                            }}
                        >
                            <Space direction="vertical" className="w-full" size="large">
                                {/* Nút cắm sạc */}
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handlePlugToCar}
                                    disabled={connectorStatus !== "Available" || loading}
                                    className="w-full font-bold shadow-lg hover:shadow-xl transition-all"
                                    icon={<PlugZap size={24} />}
                                    style={{
                                        height: '64px',
                                        fontSize: '16px',
                                        background: connectorStatus === "Available" && !loading
                                            ? 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)'
                                            : undefined,
                                        border: 'none',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>🔌</span>
                                    <span>Cắm sạc vào xe</span>
                                </Button>

                                {/* Nút bắt đầu phiên sạc */}
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleStartSession}
                                    disabled={connectorStatus !== "InUse" || isCharging || loading || pricingData.loading}
                                    className="w-full font-bold shadow-lg hover:shadow-xl transition-all"
                                    icon={<Power size={24} />}
                                    style={{
                                        height: '64px',
                                        fontSize: '16px',
                                        background: connectorStatus === "InUse" && !isCharging && !loading && !pricingData.loading
                                            ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                            : undefined,
                                        border: 'none',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>⚡</span>
                                    <span>{pricingData.loading ? 'Đang tải...' : 'Bắt đầu sạc'}</span>
                                </Button>

                                {/* Nút dừng phiên sạc */}
                                <Button
                                    danger
                                    size="large"
                                    onClick={handleStopSession}
                                    disabled={connectorStatus !== "Charging" || loading}
                                    className="w-full font-bold shadow-lg hover:shadow-xl transition-all"
                                    icon={<StopCircle size={24} />}
                                    style={{
                                        height: '64px',
                                        fontSize: '16px',
                                        background: connectorStatus === "Charging" && !loading
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : undefined,
                                        borderColor: '#ef4444',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>🛑</span>
                                    <span>Dừng sạc</span>
                                </Button>

                                <Divider style={{ margin: '12px 0', borderColor: '#d1d5db' }} />

                                {/* Nút thanh toán */}
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handlePayment}
                                    disabled={connectorStatus === "Charging" || loading || !sessionId}
                                    className="w-full font-bold shadow-lg hover:shadow-xl transition-all"
                                    icon={<CreditCard size={24} />}
                                    style={{
                                        height: '64px',
                                        fontSize: '16px',
                                        background: connectorStatus !== "Charging" && !loading && sessionId
                                            ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                                            : undefined,
                                        border: 'none',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>💳</span>
                                    <span>Thanh toán</span>
                                </Button>

                                {/* Nút rút sạc */}
                                <Button
                                    size="large"
                                    onClick={handleUnplugFromCar}
                                    disabled={connectorStatus !== "InUse" || (!isPaid && sessionId)}
                                    className="w-full font-bold shadow-lg hover:shadow-xl transition-all"
                                    icon={<Plug size={24} />}
                                    style={{
                                        height: '64px',
                                        fontSize: '16px',
                                        background: connectorStatus === "InUse" && (isPaid || !sessionId)
                                            ? 'white'
                                            : undefined,
                                        borderWidth: '2px',
                                        borderColor: connectorStatus === "InUse" && (isPaid || !sessionId) ? '#00b09b' : undefined,
                                        color: connectorStatus === "InUse" && (isPaid || !sessionId) ? '#00b09b' : undefined,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>🔋</span>
                                    <span>Rút sạc khỏi xe</span>
                                </Button>
                            </Space>

                            {/* Hướng dẫn nhanh */}
                            <div
                                className="mt-6 p-4 rounded-lg"
                                style={{
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    border: '1px solid #bfdbfe'
                                }}
                            >
                                <p className="text-xs text-gray-600 font-medium mb-2">📌 Hướng dẫn:</p>
                                <ol className="text-xs text-gray-600 space-y-1 ml-4">
                                    <li>1. Cắm sạc vào xe</li>
                                    <li>2. Bắt đầu phiên sạc</li>
                                    <li>3. Dừng sạc khi đủ pin</li>
                                    <li>4. Thanh toán</li>
                                    <li>5. Rút sạc khỏi xe</li>
                                </ol>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Session;