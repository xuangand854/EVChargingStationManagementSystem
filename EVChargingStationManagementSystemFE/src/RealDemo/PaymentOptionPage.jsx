import React, { useState,useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, CreditCard, Store ,Banknote} from "lucide-react";
import PaymentOption from "./PaymentOption";
import "../components/Payment/PaymentPage.css";
import { Modal } from "antd";
import { message, Button } from "antd";
import { PostPayment, PostPaymentOffline } from "../API/Payment";

const PaymentOptionPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null); // 'online' | 'offline'
    const [loading, setLoading] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const [amount, setAmount] = useState(0);
    const [paidOffline, setPaidOffline] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    

    const handleBack = () => {
        const returnPath = (() => { try { return sessionStorage.getItem('payment.returnPath'); } catch { return null; } })();
        if (returnPath) navigate(returnPath); else navigate(-1);
    };
    useEffect(() => {
        try {
            const storedAmount = parseFloat(sessionStorage.getItem('payment.amount') || 0);
            setAmount(storedAmount);
        } catch {
            message.error("Không thể lấy số tiền thanh toán");
        }
    }, []);


    const handleNext = async () => {
        if (!selected) return;
        if (!sessionId) {
            message.error("Không tìm thấy sessionId");
            return;
        }
        setLoading(true);
        try {
            if (selected === 'online') {
                const resp = await PostPayment(sessionId);
                const url = resp?.data;
                if (url) {
                    window.location.href = url;
                } else {
                    message.error("Không tìm thấy URL thanh toán");
                }
            } else if (selected === 'offline') {
                const resp = await PostPaymentOffline(sessionId);
                const id = resp?.data?.id ?? resp?.data;
                setPaidOffline(true);
                setShowPopup(true); 
                if (id) {
                    setPaymentId(id);
                    try { sessionStorage.setItem('payment.paid', 'true'); } catch {}
                    message.success(resp?.message || "Ghi nhận thanh toán offline thành công");
                } else {
                    message.error("Không tìm thấy paymentId");
                }
            }
        } catch (e) {
            message.error("Có lỗi khi xử lý thanh toán");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page">
            {/* Header */}
            <div className="payment-header">
                <h1>Thanh toán phiên sạc</h1>
                
                <p>Chọn phương thức thanh toán phù hợp cho phiên sạc hiện tại</p>
            </div>

            

            {/* Content */}
            <div className="payment-method-section">
                {/* Hiển thị số tiền */}
                        <div className="text-center p-6 mb-6 border rounded-lg shadow-md bg-white">
                        <div className="total-amount-box">
                            <span className="label">Tổng Số Tiền:</span>
                            <span className="amount">
                                {amount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND
                                <Banknote className="banknote-icon" size={24} />
                            </span>
                            </div>


                        </div>
                <h3>Chọn phương thức thanh toán</h3>
                <p>Hỗ trợ thanh toán Online (VNPAY) hoặc Offline tại quầy</p>

                {/* Hai lựa chọn lớn */}
                <div className="method-grid">
                    <div
                        className={`method-card ${selected === 'online' ? 'selected' : ''}`}
                        onClick={() => setSelected('online')}
                    >
                        <div className="method-header">
                            <CreditCard className="w-6 h-6 text-green-600" />
                            <div className="method-title">
                                <h4>Thanh toán Online (VNPAY)</h4>
                                <p>Nhanh chóng, nhận hoá đơn điện tử</p>
                            </div>
                        </div>
                        <ul className="benefit-list">
                            <li>✔ Thanh toán an toàn</li>
                            <li>✔ Xác nhận ngay lập tức</li>
                            <li>✔ Tiện lợi mọi lúc</li>
                        </ul>
                        {selected === 'online' && (
                            <div className="selected-badge">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                    </div>

                    <div
                        className={`method-card ${selected === 'offline' ? 'selected' : ''}`}
                        onClick={() => setSelected('offline')}
                    >
                        <div className="method-header">
                            <Store className="w-6 h-6 text-green-600" />
                            <div className="method-title">
                                <h4>Thanh toán Offline tại quầy</h4>
                                <p>Thuận tiện tại điểm sạc</p>
                            </div>
                        </div>
                        <ul className="benefit-list">
                            <li>✔ Dễ dàng, quen thuộc</li>
                            <li>✔ Phù hợp khi không dùng VNPAY</li>
                            <li>✔ Hỗ trợ tại chỗ</li>
                        </ul>
                        {selected === 'offline' && (
                            <div className="selected-badge">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="hint-box">
                    <p>
                        💡 Gợi ý: Nếu bạn cần hoá đơn điện tử, hãy chọn <b>Thanh toán Online</b>.
                        Nếu thuận tiện tại điểm sạc, có thể chọn <b>Thanh toán Offline</b>.
                    </p>
                </div>

                {/* Navigation */}
                <div className="nav-buttons">
                    <div></div>
                    <button className={`next-btn ${!selected || loading ? 'disabled' : ''}`} disabled={!selected || loading} onClick={handleNext}>
                        {loading ? 'Đang xử lý...' : 'Tiếp tục'} <ArrowRight className="icon" />
                    </button>
                </div>
            </div>

            {/* Help Section */}
            <div className="support-section">
                <h3>Cần hỗ trợ?</h3>
                <div className="support-grid">
                    <div>
                        <h4>Hotline</h4>
                        <p>1900 1234</p>
                    </div>
                    <div>
                        <h4>Email</h4>
                        <p>support@evbattery.com</p>
                    </div>
                    <div>
                        <h4>Chat</h4>
                        <p>Hỗ trợ trực tuyến</p>
                    </div>
                </div>
            </div>

            {/* Hiển thị kết quả offline */}
            <Modal 
                open={showPopup}
                onCancel={() => setShowPopup(false)}
                footer={null}
                centered
            >
                <div style={{ textAlign: "center", padding: 20 }}>
                    <CheckCircle size={50} color="green" />
                    <h2 style={{ marginTop: 10,color: "#28a745", fontSize: "22px",fontWeight: 600, lineHeight: 1.5, textAlign: "center", }}>Yêu Cầu Thanh Toán Của Bạn Đã Được Ghi Nhận!<br /> </h2>
                    <div style={{fontSize: "14px",fontWeight: 600}}>Hoàn thành tại quầy</div>
                     <Button
                        type="primary"
                        style={{ marginTop: 20 }}
                        onClick={() => navigate("/")}
                    >
                        Về Trang Chủ
                    </Button>
                    

                    {paymentId && (
                        <p style={{ marginTop: 10 }}>Mã thanh toán: <b>{paymentId}</b></p>
                    )}

                    
                </div>
            </Modal>


        </div>
    );
};

export default PaymentOptionPage;


