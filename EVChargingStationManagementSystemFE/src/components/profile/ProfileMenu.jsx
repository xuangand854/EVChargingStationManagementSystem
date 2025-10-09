import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";
import { logout } from "../../API/Auth";

const ProfileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-container" ref={menuRef}>
      <div className="profile-trigger" onClick={() => setOpen(!open)}>
        <img
          src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
          alt="User Avatar"
          className="avatar"
        />
        <span className="username">{user?.name}</span>
      </div>

      {open && (
        <div className="profile-dropdown">
          <button onClick={() => handleNavigate("/profile")}>Thông tin tài khoản</button>
          <button onClick={() => handleNavigate("/order-charging")}>Đặt chổ sạc</button>
          <button onClick={() => handleNavigate("/orders")}>Lịch sử đặt hàng</button>
          {/* <button onClick={() => handleNavigate("/charging-history")}>Lịch sử Sạc Pin</button> */}
          <button onClick={() => handleNavigate("/car")}>Xe của tôi</button>
          <hr />
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
