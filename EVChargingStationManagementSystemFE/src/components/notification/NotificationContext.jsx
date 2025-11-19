import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Thêm notification
  const addNotification = useCallback((messageOrObject, type = "User") => {
    let newNoti;
    if (typeof messageOrObject === "string") {
      newNoti = {
        id: Date.now() + "-" + uuidv4(),
        title: messageOrObject,
        type,
        createdAt: new Date().toISOString()
      };
    } else {
      newNoti = { ...messageOrObject };
      if (!newNoti.id) newNoti.id = Date.now() + "-" + uuidv4();
      if (!newNoti.createdAt) newNoti.createdAt = new Date().toISOString();
      if (!newNoti.type) newNoti.type = "User";
    }

    setNotifications(prev => [newNoti, ...prev]);
  }, []);

  // Xóa toàn bộ notifications
  const clearNotifications = useCallback(() => setNotifications([]), []);

  // Reset notifications qua ngày mới
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDay = localStorage.getItem("notificationsDay");
    if (storedDay !== today) {
      clearNotifications();
      localStorage.setItem("notificationsDay", today);
    }
  }, [clearNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
