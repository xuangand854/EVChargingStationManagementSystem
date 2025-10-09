import React from "react";
import { NavLink } from "react-router-dom";
import { Zap, Users, Car, LogOut, BarChart3, Settings } from "lucide-react";
// import "./AdminSidebar.css";

const StaffSidebar = () => {
    const menuItems = [
        { name: "Dashboard", path: "/staff", icon: <BarChart3 size={20} /> },
        { name: "Trạm sạc", path: "/staff/stations", icon: <Zap size={20} /> },
    ];
    return (
        <aside className="admin-sidebar">
                    {/* Logo Section */}
                    <div className="logo-section">
                        <div className="logo-container">
                            <div className="logo-icon">
                                <span>⚡</span>
                            </div>
                            <div className="logo-text">
                                <h1>EV Staff</h1>
                                <p>Chức năng trạm sạc</p>
                            </div>
                        </div>
                    </div>
        
                    {/* Navigation */}
                    <nav className="navigation">
                        <div className="nav-items">
                            {menuItems.map((item, index) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? "active" : ""}`
                                    }
                                >
                                    <div className="icon">
                                        {item.icon}
                                    </div>
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>
        
                    {/* User Section */}
                    <div className="user-section">
                        <div className="user-info">
                            <div className="user-avatar">
                                A
                            </div>
                            <div className="user-details">
                                <div className="user-name">Admin User</div>
                                <div className="user-role">Quản trị viên</div>
                            </div>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user_role");
                                    window.location.href = "/login";
                                }
                            }}
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </aside>


    )
}
