import React, { useEffect, useState } from "react";
import "./Order.css";
import { MyBooking } from "../../API/Booking"; //  API lấy lịch sử đặt trạm

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await MyBooking();
        if (res?.data) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Đang tải...</p>;

  const filteredOrders = orders.filter(
    (o) =>
      o.stationName?.toLowerCase().includes(search.toLowerCase()) ||
      o.startTime?.toLowerCase().includes(search.toLowerCase()) ||
      o.endTime?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="order-history-container">
      <div className="order-history-content">
        <div className="order-history-topbar">
          <h2>Lịch sử Đặt Hàng</h2>
          <input
            type="text"
            placeholder="Tìm kiếm trạm hoặc thời gian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="order-history-list">
          {filteredOrders.length === 0 ? (
            <p>Không có đơn hàng nào.</p>
          ) : (
            filteredOrders.map((order) => (
              <div className="order-history-card" key={order.id}>
                <div className="order-history-id">{order.stationName}</div>
                <div className="order-history-info">
                  <p>
                    <strong>Bắt đầu:</strong> {formatDateTime(order.startTime)}
                  </p>
                  <p>
                    <strong>Kết thúc:</strong> {formatDateTime(order.endTime)}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {order.status === "Scheduled" && <span className={"scheduled"}>Chờ Thanh Toán </span>}
                    {order.status === "Completed" && <span className={"completed"}>Đã Hoàn Thanh Giao Dịch </span>}
                    {order.status === "Cancelled" && <span className={"cancelled"}>Giao Dịch Của Bạn Đã Bị Hủy </span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
