import React, { useEffect, useState, useRef } from "react";
import "./Order.css";


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const ctaRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = [
            { id: "ORD001", customerName: "Nguyễn Văn A", vehicleName: "VF 8", date: "2025-10-01", status: "Chờ xử lý" },
            { id: "ORD002", customerName: "Trần Thị B", vehicleName: "VF 9", date: "2025-10-02", status: "Đang vận chuyển" },
            { id: "ORD003", customerName: "Lê Văn C", vehicleName: "VF e34", date: "2025-10-03", status: "Hoàn thành" },
  
        ]; // [] = chưa có đơn
        setOrders(res);
      } catch (err) {
        console.error("Lấy danh sách đơn hàng lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

 


  if (loading) return <p className="loading">Đang tải...</p>;

  const filteredOrders = orders.filter(
    (o) =>
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicleName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="order-container">
      <div className="order-header">
        <h2>Lịch sử Đơn hàng</h2>
        {orders.length > 0 && (
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {orders.length === 0 ? (
        <div className="order-empty">
          <p className="empty-message">Bạn chưa có đơn hàng nào</p>
          <p className="empty-info">
            Để xem lịch sử đơn hàng, vui lòng thực hiện một đơn hàng.
          </p>
          <a href="#" className="cta-button" ref={ctaRef}>
            Đặt ngay
          </a>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.length === 0 ? (
            <p className="no-order">Không tìm thấy đơn hàng</p>
          ) : (
            filteredOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-id">{order.id}</div>
                <div className="order-info">
                  <p>
                    <strong>Khách hàng:</strong> {order.customerName}
                  </p>
                  <p>
                    <strong>Xe:</strong> {order.vehicleName}
                  </p>
                  <p>
                    <strong>Ngày:</strong> {order.date}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    <span
                      className={`status ${order.status
                        ?.replace(/\s/g, "-")
                        .toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Order;
