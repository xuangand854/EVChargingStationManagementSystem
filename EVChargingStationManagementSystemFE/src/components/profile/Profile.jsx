import React, { useState, useEffect } from "react";
import "./Profile.css";
import { updateEVDriver, getEVDriverProfile } from "../../API/EVDriver";

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
    const fetchDriver = async () => {
      try {
        // Lấy driverId từ localStorage 
        const driverId = localStorage.getItem("driverId");
        if (!driverId) {
          console.error("Không tìm thấy driverId trong localStorage");
          setLoading(false);
          return;
        }

        // Gọi API lấy thông tin tài xế
        const res = await getEVDriverProfile(driverId);
        const driver = res?.data?.data || res?.data; // tránh phòng backend trả khác cấu trúc

        if (driver) {
          const userData = {
            name: driver.name || "Chưa cập nhật",
            email: driver.email || "Chưa cập nhật",
            phone: driver.phoneNumber || "Chưa cập nhật",
            role: "customer",
            avatar: driver.profilePictureUrl || "",
            car:
              driver.vehicleModelIds && driver.vehicleModelIds.length > 0
                ? driver.vehicleModelIds.join(", ")
                : "Chưa có xe",
            driverId: driver.id,
          };
          setUser(userData);
          setFormData(userData);
        } else {
          console.warn("Không có dữ liệu tài xế trả về!");
          setUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi load EVDriver:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.driverId) {
        alert("Không tìm thấy mã tài xế để cập nhật!");
        return;
      }

      // Gọi API cập nhật thông tin
      const updated = await updateEVDriver(
        user.driverId,
        formData.name,
        formData.phone,
        formData.address || "",
        formData.avatar || "",
        [] // danh sách xe tạm để rỗng
      );

      // Cập nhật lại UI
      setUser({
        ...formData,
        car:
          updated?.vehicleModelIds && updated.vehicleModelIds.length > 0
            ? updated.vehicleModelIds.join(", ")
            : "Chưa có xe",
      });

      alert("Cập nhật thông tin thành công!");
      setMode("view");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPass !== passwordData.confirmPass) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    alert("Đổi mật khẩu thành công! (Giả lập)");
    setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
    setMode("view");
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!user) return <p>Không tìm thấy thông tin tài xế</p>;

  return (
    <div className="profile-wrapper">
      {/* Sidebar */}
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
          <p className="warning">⚡ Thông tin tài xế</p>
          <p className="desc">
            Thông tin được đồng bộ từ hệ thống EVDriver. Bạn có thể chỉnh sửa và
            lưu lại tại đây.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="profile-main">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Thông tin cá nhân</h2>
            {mode === "view" && (
              <button className="edit-btn" onClick={() => setMode("edit")}>
                Chỉnh sửa thông tin
              </button>
            )}
          </div>

          {/* View mode */}
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
                <span className="label">Xe</span>
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

          {/* Edit mode */}
          {mode === "edit" && (
            <div className="profile-form">
              <h3>Tên</h3>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <h3>Email</h3>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
              />
              <h3>Số điện thoại</h3>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
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

          {/* Password mode */}
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
