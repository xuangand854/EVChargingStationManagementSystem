import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Car, Calendar, BarChart2, HelpCircle, Star, MapPin,User} from "lucide-react";
import { getAuthStatus } from "../../API/Auth";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authStatus = await getAuthStatus();
        if (authStatus.isAuthenticated && authStatus.user) {
          setUser({ 
            name: authStatus.user.name || "Người dùng",
            role: authStatus.user.role 
          });
        } else setUser({ name: "Khách", role: null });
      } catch {
        setUser({ name: "Khách", role: null });
      }
    };
    fetchUser();
  }, []);


  const quickActions = [
    { title: "Tìm trạm sạc", icon: <MapPin size={20} />, path: "/order-charging" },
    { title: "Lịch sử sạc", icon: <Calendar size={20} />, path: "/orders" },
    { title: "Thanh toán", icon: <Wallet size={20} />, path: "/Payment" },
    { title: "Tài khoản", icon: <User size={20} />, path: "/profile" },
    { title: "Liên kết xe", icon: <Car size={20} />, path: "/car" },
    { title: "Gói dịch vụ", icon: <BarChart2 size={20} />, path: "#" },
    { title: "Hỗ trợ", icon: <HelpCircle size={20} />, path: "/report-page" },
    { title: "Đánh giá", icon: <Star size={20} />, path: "/rating-page " },
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>Xin chào, {user?.name || "Người dùng"} 👋</h1>
          <p>Chào mừng bạn đến với hệ thống quản lý trạm sạc pin xe điện</p>
        </div>
        <div className="status">
            Tài khoản: <span className="status-badge active">Đã kích hoạt</span>
            </div>

      </div>

      {/* Thao tác nhanh */}
      {user && (
        <div className="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div className="actions-grid">
            {quickActions.map((a, i) => {
              // Ẩn "/profile" và "/Payment" nếu là admin/staff
              if ((a.path === "/profile" || a.path === "/Payment") && (user.role === "Admin" || user.role === "Staff")) {
                return null;
              }
              return (
                <div key={i} className="action-box" onClick={() => navigate(a.path)}>
                  <div className="icon">{a.icon}</div>
                  <p>{a.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Giao dịch & Trạng thái */}
      <div className="bottom-section">
        <div className="recent-transactions">
          <h3>Giao dịch gần đây</h3>
          <div className="transaction-item">
            <p>Đặc sạc tại Trạm Q1 <span className="positive">+1 lần</span></p>
            <small>Hôm nay, 14:30</small>
          </div>
          <div className="transaction-item">
            <p>Mua gói Premium <span className="price">500,000đ</span></p>
            <small>Hôm qua, 09:15</small>
          </div>
          <button onClick={() => navigate("/orders")}>Xem tất cả giao dịch →</button>
        </div>

        <div className="account-status">
          <h3>Trạng thái tài khoản</h3>
          <p>Gói hiện tại: <strong>Premium</strong></p>
          <p>Số lần đặc còn lại: <span className="green">15 lần</span></p>
          <p>Phương tiện đã liên kết: 0 xe</p>
          <p>Đánh giá trung bình: <span className="star">★ 4.8/5</span></p>
          <button className="manage-btn" onClick={() => navigate("/Payment")}>
            Quản lý gói dịch vụ
          </button>
        </div>
      </div>

      {/* Hỗ trợ */}
      <div className="support-section">
        <div>
          <h3>Cần hỗ trợ?</h3>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>
        <div className="support-buttons">
          <button onClick={() => navigate("/report-page")}>Gửi yêu cầu hỗ trợ</button>
          <button onClick={() => navigate("#")}>Đánh giá dịch vụ</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
