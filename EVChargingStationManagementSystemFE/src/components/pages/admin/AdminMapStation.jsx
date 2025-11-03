import React from "react";
import { Outlet } from "react-router-dom";
import StationList from "../../../RealDemo/StationList";

const AdminSession = () => {
  return (
    <div className="admin-session">
      <StationList basePath="/admin/admin-session" />
      <Outlet />
    </div>
  );
};

export default AdminSession;
