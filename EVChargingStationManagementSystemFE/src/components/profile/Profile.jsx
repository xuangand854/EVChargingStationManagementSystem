import React, { useState, useEffect } from "react";
import "./Profile.css";
import { updateEVDriver, getEVDriverProfile,deleteEVDriverVehicalid } from "../../API/EVDriver";
import { getVehicleModels } from "../../API/Admin";
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
    address: "",
    avatar: "",
    driverId: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [vehicleModels, setVehicleModels] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
            address: driver.address || "Chưa cập nhật",
            driverId: driver.id,
            vehicleModelIds: driver.vehicleModelIds || [],
          };
          setUser(userData);
          setFormData(userData);
          setSelectedVehicles([...userData.vehicleModelIds]);
        } else {
          toast.warn("Không có dữ liệu tài xế!");
        }

        const modelRes = await getVehicleModels();
        setVehicleModels(modelRes?.data || []);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
        toast.error("Không thể tải thông tin tài xế!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    const handleSaveProfile = async () => {
      try {
        if (!user?.driverId) {
          toast.error("Không tìm thấy mã tài xế!");
          return;
        }

        // In ra để debug
        console.log(" Dữ liệu gửi lên:", {
          driverId: user.driverId,
          name: formData.name,
          phoneNumber: formData.phone,
          address: formData.address || "",
          profilePictureUrl: formData.avatar || "",
          vehicleModelIds: selectedVehicles, //  danh sách ID xe đã chọn
        });

        const res = await updateEVDriver(
          user.driverId,
          formData.name,
          formData.phone,
          formData.address || "",
          formData.avatar || "",
          selectedVehicles
        );

        if (res?.status === 200 || res?.data?.success) {
          toast.success("Cập nhật thông tin thành công!");

          // Cập nhật lại local state sau khi API OK
          setUser({
            ...formData,
            driverId: user.driverId,
            vehicleModelIds: selectedVehicles,
          });

          setMode("view");
          setShowPopup("");
        } else {
          toast.error(res?.data?.message || "Lỗi cập nhật!");
        }
      } catch (error) {
        console.error(" Lỗi khi cập nhật:", error.response?.data || error);
        toast.error("Cập nhật thất bại, vui lòng thử lại!");
      }
    };


  const handlePasswordChange = async (vehicleModelIds) => {
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
  const handleDelete = async (vehicleModelIds) => {
    if(window.confirm("Bạn Chắc Muốn Xóa Sự Lựa Chọn Này Chứ?")){
      try {
        await deleteEVDriverVehicalid(vehicleModelIds);
        toast.success("Xóa Thành Công!");
        setSelectedVehicles(prev => prev.filter(id => id !== vehicleModelIds));
      } catch (error) {
        console.log("Xóa Thất Bại!",error);
        toast.error("Xóa Thất Bại!");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!user) return <p>Không tìm thấy thông tin tài xế</p>;

  // Hiển thị tên xe
  const selectedVehicleNames = selectedVehicles
    .map((id) => vehicleModels.find((v) => v.id === id)?.modelName)
    .filter(Boolean);

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

      {/* Main */}
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
                <span className="label">Địa chỉ</span>
                <span>{user.address}</span>
              </div>
              <div className="info-row vehicle-row">
                <span className="label">Xe</span>
                <div className="vehicle-right">
                  <span className="info-value">
                    {selectedVehicleNames.length > 0
                      ? selectedVehicleNames.join(", ")
                      : "Chưa có xe"}
                  </span>
                  <button
                    className="link-btn"
                    onClick={() => setShowPopup("vehicle")}
                  >
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
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              <h3>Email</h3>
              <input type="email" name="email" value={formData.email} readOnly />
              <h3>Số điện thoại</h3>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
              <h3>Địa chỉ</h3>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
              <div className="form-buttons">
                <button className="save" onClick={handleSaveProfile}>Lưu</button>
                <button className="cancel" onClick={() => setMode("view")}>Hủy</button>
              </div>
            </div>
          )}

          {mode === "password" && (
            <div className="profile-form">
              <input type="password" placeholder="Mật khẩu cũ" value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
              <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
              <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              <div className="form-buttons">
                <button className="save" onClick={handlePasswordChange}>Đổi mật khẩu</button>
                <button className="cancel" onClick={() => setMode("view")}>Hủy</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup Vehicle */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            {showPopup === "avatar" && (
              <>
                <h3>Nhập URL ảnh đại diện</h3>
                <input
                  type="text"
                  placeholder="Dán link ảnh"
                  value={formData.avatar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                />
                <div className="popup-buttons">
                  <button className="save" onClick={async () => { await handleSaveProfile(); setShowPopup(""); }}>Lưu</button>
                  <button className="cancel" onClick={() => setShowPopup("")}>Hủy</button>
                </div>
              </>
            )}

            {showPopup === "vehicle" && (
              <>
                <h3>Xe đã chọn</h3>
                <div className="selected-vehicles">
                  {selectedVehicles.length === 0 && <p>Chưa có xe nào</p>}
                  {selectedVehicles.map((vId) => {
                    const vehicle = vehicleModels.find(vm => vm.id === vId);
                    return (
                      <div key={vId} className="vehicle-item">
                        <span>{vehicle?.modelName || vId}</span>
                        <button className="link-btn"
                          onClick={() => handleDelete(vId)}>
                          Xóa
                        </button>
                      </div>
                    );
                  })}
                </div>

                <h3>Những loại xe hỗ trợ</h3>
                <div className="available-vehicles">
                  {vehicleModels.map((vm) => (
                    <div key={vm.id} className="vehicle-item">
                      <span>{vm.modelName}</span>
                      {!selectedVehicles.includes(vm.id) && (
                        <button className="link-btn"
                          onClick={() => setSelectedVehicles([...selectedVehicles, vm.id])}>
                          Chọn
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="popup-buttons">
                  <button className="save" onClick={async () => { await handleSaveProfile(); setShowPopup(""); }}>Lưu</button>
                  <button className="cancel" onClick={() => setShowPopup("")}>Hủy</button>
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
