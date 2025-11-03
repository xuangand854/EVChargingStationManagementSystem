import React, { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import { PostPaymentOffline, PatchPaymentOfflineStatus } from "../../../API/Payment";

const ConfirmPaymentOffline = () => {
    const [sessionId, setSessionId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [loading, setLoading] = useState(false);

    // Gọi API tạo thanh toán offline
    const handleCreateOfflinePayment = async () => {
        if (!sessionId) {
            message.warning("Vui lòng nhập mã phiên sạc (sessionId).");
            return;
        }
        try {
            setLoading(true);
            const data = await PostPaymentOffline(sessionId);
            message.success("✅ Tạo thanh toán offline thành công!");
            console.log("Kết quả:", data);
        } catch (error) {
            message.error("❌ Lỗi khi tạo thanh toán offline.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API cập nhật trạng thái thanh toán offline
    const handleUpdateOfflineStatus = async () => {
        if (!paymentId) {
            message.warning("Vui lòng nhập mã thanh toán (paymentId).");
            return;
        }
        try {
            setLoading(true);
            const data = await PatchPaymentOfflineStatus(paymentId);
            message.success("✅ Cập nhật trạng thái thanh toán thành công!");
            console.log("Kết quả:", data);
        } catch (error) {
            message.error("❌ Lỗi khi cập nhật trạng thái thanh toán.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-pink-50">
            <Card
                title="Xác nhận thanh toán Offline"
                bordered={false}
                className="shadow-lg w-[420px] rounded-2xl"
            >
                <Space direction="vertical" className="w-full">
                    {/* <div>
                        <label className="block mb-1 font-medium">Mã phiên sạc (sessionId)</label>
                        <Input
                            placeholder="Nhập sessionId..."
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                        />
                        <Button
                            type="primary"
                            className="mt-2 w-full"
                            onClick={handleCreateOfflinePayment}
                            loading={loading}
                        >
                            Tạo thanh toán Offline
                        </Button>
                    </div> */}

                    <div className="mt-5">
                        <label className="block mb-1 font-medium">Mã thanh toán (paymentId)</label>
                        <Input
                            placeholder="Nhập paymentId..."
                            value={paymentId}
                            onChange={(e) => setPaymentId(e.target.value)}
                        />
                        <Button
                            type="default"
                            className="mt-2 w-full"
                            onClick={handleUpdateOfflineStatus}
                            loading={loading}
                        >
                            Cập nhật trạng thái thanh toán
                        </Button>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default ConfirmPaymentOffline;
