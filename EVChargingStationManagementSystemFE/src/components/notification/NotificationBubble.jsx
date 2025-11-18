import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";
import { getAuthStatus } from "../../API/Auth"; // hàm lấy trạng thái login
import "./NotificationBubble.css";

const NotificationBubble = () => {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(getAuthStatus().isAuthenticated);

  useEffect(() => {
    const handleAuthChanged = () => {
      setLoggedIn(getAuthStatus().isAuthenticated);
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    // cleanup
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  if (!loggedIn) return null;

  return (
    <div className="notification-wrapper">
      <div
        className="notification-bubble"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>

      {open && (
        <div className="notification-panel">
          <h4>Thông báo</h4>
          {notifications.length === 0 ? (
            <p className="no-notification">Không có thông báo mới</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>{n.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBubble;
