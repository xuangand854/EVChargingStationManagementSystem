import React, { useState, useEffect } from "react";
import "./Profile.css";
import { getAuthStatus } from "../../API/Auth";

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
    car: "",   
  });
  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        
        const authStatus = await getAuthStatus();

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
            car: authStatus.user.car || "Chưa có xe", 
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
    <div className="profile-wrapper">
      {/* Sidebar bên trái */}
      <div className="profile-sidebar">
        <div className="sidebar-card user-card">
          <img
            src={user.avatar || defaultAvatars[user.role]}
            alt="avatar"
            className="avatar"
          />
          <p className="welcome">Xin chào,</p>
          <h3>{user.name}</h3>
        </div>

        <div className="sidebar-card notice-card">
          <p className="warning">⚠️ Bạn chưa liên kết tài khoản</p>
          <p className="desc">
            Hãy truy cập web quản lý trạm sạc và liên kết tài khoản bằng Email hoặc SĐT
            để nhận các ưu đãi đặc quyền.
          </p>
          <a href="#">Xem hướng dẫn</a>
          <div className="app-links">
            <img
              src="https://developer.android.com/images/brand/en_generic_rgb_wo_45.png"
              alt="Google Play"
            />
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
            />
          </div>
        </div>
      </div>

      {/* Nội dung bên phải */}
      <div className="profile-main">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Thông tin cá nhân</h2>
            {mode === "view" && (
              <button
                className="edit-btn"
                onClick={() => setMode("edit")}
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>

          {/* View info */}
          {mode === "view" && (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Họ và tên</span>
                <span>{user.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Số điện thoại</span>
                <span>{user.phone}</span>
              </div>
              <div className="info-row">
                <span className="label">Car</span>
                <span>{user.car}</span>
              </div>

              <div className="info-row">
                <span className="label">Mật khẩu</span>
                <button
                  className="link-btn"
                  onClick={() => setMode("password")}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}

          {/* Edit form */}
          {mode === "edit" && (
            <div className="profile-form">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Họ và tên"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Số điện thoại"
              />
              <div className="form-buttons">
                <button className="save" onClick={handleSaveProfile}>
                  Lưu
                </button>
                <button className="cancel" onClick={() => setMode("view")}>
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Password form */}
          {mode === "password" && (
            <div className="profile-form">
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={passwordData.oldPass}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPass: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordData.newPass}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPass: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirmPass}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPass: e.target.value,
                  })
                }
              />
              <div className="form-buttons">
                <button className="save" onClick={handlePasswordChange}>
                  Đổi mật khẩu
                </button>
                <button className="cancel" onClick={() => setMode("view")}>
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
