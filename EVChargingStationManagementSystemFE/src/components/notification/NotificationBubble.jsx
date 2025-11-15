import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";
import "./NotificationBubble.css";

const NotificationBubble = () => {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="notification-wrapper">
      {/* Bong bóng thông báo */}
      <div
        className="notification-bubble"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>

      {/* Khung danh sách thông báo */}
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
