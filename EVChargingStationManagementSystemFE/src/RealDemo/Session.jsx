// src/pages/admin/Session/Session.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, message, Card, Space, Tag } from "antd";
import { StartSession, Stop } from "../API/ChargingSession";
import { PatchConnectorToggle } from "../API/Connector";
import { PlugZap, Power, StopCircle } from "lucide-react";

const Session = () => {
    // const { connectorId } = useParams();
    const [sessionId, setSessionId] = useState(null);
    const [isPlugged, setIsPlugged] = useState(true);
    const [isCharging, setIsCharging] = useState(false);
    const { connectorID } = useParams();
    console.log("🔌 connectorId:", connectorID);



    const handlePlugIn = async () => {
        try {
            await PatchConnectorToggle(false, connectorID);
            setIsPlugged(false);
            message.success("🔌 Đã cắm sạc vào xe!");
        } catch (error) {
            console.error("❌ Lỗi khi cắm sạc:", error);
            message.error("Lỗi khi cắm sạc!");
        }
    };

    const handleStartSession = async () => {
        try {
            const response = await StartSession(
                80, // batteryCapacityKWh
                20, // initialBatteryLevelPercent
                100, // expectedEnergiesKWh
                connectorID
            );
            setSessionId(response.sessionId);
            setIsCharging(true);
            message.success("⚡ Phiên sạc đã bắt đầu!");
        } catch (error) {
            console.error("❌ Lỗi khi bắt đầu phiên sạc:", error);
            message.error("Không thể bắt đầu phiên sạc!");
        }
    };

    const handleStopSession = async () => {
        try {
            await Stop(sessionId, 12.4);
            setIsCharging(true);
            setIsPlugged(true);
            message.success("🛑 Phiên sạc đã dừng!");
        } catch (error) {
            console.error("❌ Lỗi khi dừng phiên sạc:", error);
            message.error("Lỗi khi dừng phiên sạc!");
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
                        <Button
                            type="primary"
                            onClick={handlePlugIn}
                            disabled={isPlugged}
                            className="bg-pink-500 hover:bg-pink-600 border-none rounded-xl py-5 text-lg"
                            icon={<PlugZap size={20} />}
                        >
                            Cắm sạc vào xe
                        </Button>

                        <Button
                            type="default"
                            onClick={handleStartSession}
                            disabled={!isPlugged || isCharging}
                            className="rounded-xl py-5 text-lg"
                            icon={<Power size={20} />}
                        >
                            Bắt đầu phiên sạc
                        </Button>

                        <Button
                            danger
                            onClick={handleStopSession}
                            disabled={!isCharging}
                            className="rounded-xl py-5 text-lg"
                            icon={<StopCircle size={20} />}
                        >
                            Dừng phiên sạc
                        </Button>
                    </div>

                    <div className="mt-6">
                        {isCharging ? (
                            <Tag color="green">Đang sạc 🔋</Tag>
                        ) : isPlugged ? (
                            <Tag color="blue">Đã cắm sạc nhưng chưa bắt đầu</Tag>
                        ) : (
                            <Tag color="default">Chưa cắm sạc</Tag>
                        )}
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default Session;
