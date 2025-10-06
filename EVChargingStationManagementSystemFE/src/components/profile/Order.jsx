import React, { useEffect, useState } from "react";
import "./Order.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const data = [
        {
          id: "ORD001",
          customerName: "Nguyễn Văn A",
          vehicleName: "VF 8",
          date: "2025-10-01",
          status: "Chờ xử lý",
        },
        {
          id: "ORD002",
          customerName: "Trần Thị B",
          vehicleName: "VF 9",
          date: "2025-10-02",
          status: "Đang vận chuyển",
        },
        {
          id: "ORD003",
          customerName: "Lê Văn C",
          vehicleName: "VF e34",
          date: "2025-10-03",
          status: "Hoàn thành",
        },
      ];
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Đang tải...</p>;

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicleName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="order-history-container">
      <div className="order-history-content">
        <div className="order-history-topbar">
          <h2>Lịch sử Đơn hàng</h2>
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="order-history-list">
          {filteredOrders.map((order) => (
            <div className="order-history-card" key={order.id}>
              <div className="order-history-id">{order.id}</div>
              <div className="order-history-info">
                <p><strong>Khách hàng:</strong> {order.customerName}</p>
                <p><strong>Xe:</strong> {order.vehicleName}</p>
                <p><strong>Ngày:</strong> {order.date}</p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={`order-status ${order.status
                      .replace(/\s/g, "-")
                      .toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;
