import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";
import { logout } from "../../API/Auth";
import { getEVDriverProfile } from "../../API/EVDriver";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [driverProfile, setDriverProfile] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef();

  //  Lấy role từ localStorage sau khi login
  useEffect(() => {
    const storedRole = localStorage.getItem("user_role") || "";
    setRole(storedRole);
  }, []);

  //  Nếu là EVDriver → gọi API để lấy avatar thực
  useEffect(() => {
    if (role === "EVDriver") {
      (async () => {
        try {
          const res = await getEVDriverProfile();
          const driver = res?.data?.data || res?.data;
          if (driver) setDriverProfile(driver);
        } catch (err) {
          console.error(" Lỗi tải EVDriver profile:", err);
        }
      })();
    }
  }, [role]);

  //  Ảnh đại diện: EVDriver dùng ảnh API, còn lại ảnh mặc định
  const avatarSrc =
    role === "EVDriver"
      ? driverProfile?.profilePictureUrl ||
        "https://cdn-icons-png.flaticon.com/512/847/847969.png"
      : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  //  Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // hàm hướng trang 
  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="profile-container" ref={menuRef}>
      <div className="profile-trigger" onClick={() => setOpen(!open)}>
        <img src={avatarSrc} alt="User Avatar" className="avatar" />
      </div>

      {open && (
        <div className="profile-dropdown">
          <button onClick={() => handleNavigate("/profile-page")}>
            Thông tin tài khoản
          </button>

          {/*  Chỉ EVDriver mới thấy */}
          {role === "EVDriver" && (<button onClick={() => handleNavigate("/profile")}>Thông tin cá nhân</button>)}
          <button onClick={() => handleNavigate("/order-charging")}>Đặt chỗ sạc</button>
          {/* {role === "EVDriver" && ( */}
            <button onClick={() => handleNavigate("/orders")}>Lịch sử đặt hàng</button>
            {/* )} */}
          <button onClick={() => handleNavigate("/Payment")}>Thanh Toán</button>
          <button onClick={() => handleNavigate("/station-list")}>Mô Phỏng Sạc</button>
          {/* <button onClick={() => handleNavigate("/car")}>Xe của tôi</button> */}
          <button className="logout-btn" onClick={() => {logout();setOpen(false);}}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
