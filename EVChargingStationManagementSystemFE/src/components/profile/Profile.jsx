import React, { useState, useEffect } from "react";
import "./Profile.css";
import { getAuthStatus } from "../../API/Auth";
// Nếu cần decode JWT thì bật dòng dưới
// import { jwtDecode } from "jwt-decode";

const defaultAvatars = {
  customer: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  staff: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  admin: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view"); // view | edit | password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    avatar: "",
    vehicle: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  // tab menu bên trái
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authStatus = await getAuthStatus();
        console.log("API trả về:", authStatus);

        if (authStatus.isAuthenticated && authStatus.user) {
          const roleRaw = Array.isArray(authStatus.user.role)
            ? authStatus.user.role[0]
            : authStatus.user.role;
          const role = roleRaw ? roleRaw.toLowerCase() : "customer";

          const userData = {
            name: authStatus.user.name || "Chưa cập nhật",
            email: authStatus.user.email || "Chưa cập nhật",
            phone: authStatus.user.phone || "Chưa cập nhật",
            role,
            avatar: authStatus.user.avatar || "",
            vehicle: authStatus.user.vehicle || "Chưa có xe",
          };
          setUser(userData);
          setFormData(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi load user profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setUser(formData);
    setMode("view");
  };

  const handlePasswordChange = () => {
    if (passwordData.newPass !== passwordData.confirmPass) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    alert("Đổi mật khẩu thành công!");
    setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
    setMode("view");
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!user) return <p>Bạn chưa đăng nhập</p>;

  return (
    <div className="profile-page-container">
      {/* Bên trái: menu */}
      <div className="profile-left">
        <h3>Menu</h3>
        <button onClick={() => { setActiveTab("profile"); setIsEditing(false); }}>
          Xem thông tin
        </button>
        <button onClick={() => { setActiveTab("profile"); setIsEditing(true); }}>
          Chỉnh sửa thông tin
        </button>
        <button onClick={() => { setActiveTab("choose-car"); setIsEditing(false); }}>
          Chọn loại xe
        </button>
      </div>

      {/* Giữa: nội dung hiển thị */}
      <div className="profile-center">
        {activeTab === "profile" && (
          <>
            <div className="profile-avatar">
              <img
                src={user.avatar || defaultAvatars[user.role] || defaultAvatars.customer}
                alt="User Avatar"
              />
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <h2>{user.name}</h2>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone}</p>
                <p>Role: {user.role}</p>
                <p>Loại xe: {user.vehicle}</p>
              </div>
            ) : (
              <div className="profile-form">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" />
                <div className="form-buttons">
                  <button onClick={handleSaveProfile}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "choose-car" && (
          <div className="choose-car-section">
            <h2>Chọn loại xe</h2>
            <div className="car-list">
              {["VF8", "VF9", "VF e34"].map((car) => (
                <div
                  key={car}
                  className={`car-item ${selectedCar === car ? "selected" : ""}`}
                  onClick={() => setSelectedCar(car)}
                >
                  {car}
                </div>
              ))}
            </div>
            {selectedCar && <p>Bạn chọn: {selectedCar}</p>}
          </div>
        )}
      </div>

      {/* Bên phải: nội dung nâng cao */}
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Thông tin cá nhân</h2>
            {mode === "view" && (
              <div className="actions">
                <button className="edit-btn" onClick={() => setMode("edit")}>✏️ Chỉnh sửa</button>
                <button className="password-btn" onClick={() => setMode("password")}>🔑 Đổi mật khẩu</button>
              </div>
            )}
          </div>

          {mode === "view" && (
            <div className="profile-info">
              <div className="info-row"><span className="label">Họ và tên:</span> <span>{user.name}</span></div>
              <div className="info-row"><span className="label">Email:</span> <span>{user.email}</span></div>
              <div className="info-row"><span className="label">Số điện thoại:</span> <span>{user.phone}</span></div>
              <div className="info-row"><span className="label">Vai trò:</span> <span>{user.role}</span></div>
              <div className="info-row"><span className="label">Loại xe:</span> <span>{user.vehicle}</span></div>
            </div>
          )}

          {mode === "edit" && (
            <div className="profile-form">
              <h3>Chỉnh sửa thông tin</h3>
              <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Họ và tên" />
              <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
              <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Số điện thoại" />
              <div className="form-buttons">
                <button className="save" onClick={handleSaveProfile}>💾 Lưu</button>
                <button className="cancel" onClick={() => setMode("view")}>❌ Hủy</button>
              </div>
            </div>
          )}

          {mode === "password" && (
            <div className="profile-form profile-form-password">
              <h3>Đổi mật khẩu</h3>
              <input type="password" placeholder="Mật khẩu cũ" value={passwordData.oldPass}
                     onChange={(e) => setPasswordData({ ...passwordData, oldPass: e.target.value })} />
              <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPass}
                     onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} />
              <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPass}
                     onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })} />
              <div className="form-buttons">
                <button className="save" onClick={handlePasswordChange}>🔑 Đổi mật khẩu</button>
                <button className="cancel" onClick={() => setMode("view")}>❌ Hủy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
