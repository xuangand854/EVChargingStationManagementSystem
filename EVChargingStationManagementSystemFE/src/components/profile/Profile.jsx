import React, { useState, useEffect } from "react";
import "./Profile.css";
import { updateEVDriver, getEVDriverProfile } from "../../API/EVDriver";
import { changePassword } from "../../API/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultAvatars = {
  customer: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  staff: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  admin: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view");
  const [showPopup, setShowPopup] = useState(""); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    address:"",
    avatar: "",
    car: "",
    driverId: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  //  Lấy thông tin tài xế khi load
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await getEVDriverProfile();
        const driver = res?.data?.data || res?.data;
        if (driver) {
          const userData = {
            name: driver.name || "Chưa cập nhật",
            email: driver.email || "Chưa cập nhật",
            phone: driver.phoneNumber || "Chưa cập nhật",
            role: driver.role || "customer",
            avatar: driver.profilePictureUrl || "",
            address:driver.address ||"Chưa Cập Nhật",
            car:
              driver.vehicleModelIds && driver.vehicleModelIds.length > 0
                ? driver.vehicleModelIds.join(", ")
                : "Chưa có xe",
            driverId: driver.id,
          };
          setUser(userData);
          setFormData(userData);
        } else {
          toast.warn("Không có dữ liệu tài xế!");
        }
      } catch (err) {
        console.error("Lỗi khi load EVDriver:", err);
        toast.error("Không thể tải thông tin tài xế!");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, []);

  //  Cập nhật thông tin tài xế
  const handleSaveProfile = async () => {
    try {
      if (!user?.driverId) {
        toast.error("Không tìm thấy mã tài xế!");
        return;
      }

      const updated = await updateEVDriver(
        user.driverId,
        formData.name,
        formData.phone,
        formData.address || "",
        formData.avatar || "",
        []
      );

      setUser({
        ...formData,
        car:
          updated?.vehicleModelIds && updated.vehicleModelIds.length > 0
            ? updated.vehicleModelIds.join(", ")
            : "Chưa có xe",
      });

      toast.success("Cập nhật thông tin thành công!");
      setMode("view");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  //  Đổi mật khẩu
  const handlePasswordChange = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      const res = await changePassword(oldPassword, newPassword, confirmPassword);
      if (res?.status === 200 || res?.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setMode("view");
      } else {
        toast.error(res?.message || "Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      toast.error("Mật khẩu cũ không đúng hoặc có lỗi hệ thống!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!user) return <p>Không tìm thấy thông tin tài xế</p>;

  return (
    <div className="profile-wrapper">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="sidebar-card user-card">
          <div className="avatar-container">
            <img
              src={formData.avatar || defaultAvatars[user.role]}
              alt="avatars"
              className="avatars"
            />
            <button
              className="edit-avatar-icon"
              onClick={() => setShowPopup("avatar")}
              title="Đổi ảnh đại diện"
            >
            📷
            </button>
          </div>
          <p className="welcome">Xin chào,</p>
          <h3>{user.name}</h3>
        </div>

        <div className="sidebar-card notice-card">
          <p className="warning">Thông tin tài xế</p>
          <p className="desc">Hãy cập nhật đầy đủ để sử dụng dịch vụ tốt hơn.</p>
        </div>
      </div>

      {/* Main Content */}
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
                <span className="label">Địa Chỉ</span>
                <span>{user.address}</span>
              </div>
              <div className="info-row vehicle-row">
                <span className="label">Xe</span>
                <div className="vehicle-right">
                
                  <span className="info-value">{user.car}</span>
                  <button className="link-btn" onClick={() => setShowPopup("vehicle")}>
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="info-row">
                <span className="label">Mật khẩu</span>
                <button className="link-btn" onClick={() => setMode("password")}>
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}

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
              <input type="email" name="email" value={formData.email} readOnly />
              <h3>Số điện thoại</h3>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <h3>Địa chỉ</h3>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
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

          {mode === "password" && (
            <div className="profile-form">
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
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

      {/* Popup avatar / vehicle */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            {showPopup === "avatar" ? (
              <>
                <h3> Nhập URL ảnh đại diện</h3>
                <input
                  type="text"
                  placeholder="Dán link ảnh vào đây để đổi ảnh đại diện"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, avatar: e.target.value }))
                  }
                  className="avatar-url-input"
                />
                <div className="popup-buttons">
                  <button
                    className="save"
                    onClick={async () => {
                      await handleSaveProfile();
                      setUser((prev) => ({ ...prev, avatar: formData.avatar }));
                      setShowPopup("");
                      
                    }}
                  >
                    Lưu
                  </button>
                  <button className="cancel" onClick={() => setShowPopup("")}>
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Nhập loại xe của bạn</h3>
                <input
                  type="text"
                  placeholder="VD: VinFast VF8"
                  value={formData.car}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, car: e.target.value }))
                  }
                />
                <div className="popup-buttons">
                  <button
                    className="save"
                    onClick={() => {
                      setUser((prev) => ({ ...prev, car: formData.car }));
                      toast.success("Đã cập nhật loại xe!");
                      setShowPopup("");
                    }}
                  >
                    Lưu
                  </button>
                  <button className="cancel" onClick={() => setShowPopup("")}>
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
