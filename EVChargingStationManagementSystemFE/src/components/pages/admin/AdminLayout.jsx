import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Search, Settings, User } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminNotification from "./AdminNotification";
import "./AdminLayout.css";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- SIDEBAR (bên trái cố định) --- */}
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <AdminSidebar />
            </div>

            {/* Overlay (chỉ hiện khi mở sidebar ở mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* --- CONTENT LỆCH SANG PHẢI --- */}
            <div className="admin-content">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6">
                    <div className="flex items-center justify-between">
                        {/* Nút mở sidebar (chỉ hiện trên mobile) */}
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu size={24} />
                            </button>

                            {/* Thanh tìm kiếm */}
                            <div className="hidden sm:block">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm trong hệ thống admin..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nút chức năng & thông tin user */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2">
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                    <Settings size={20} />
                                </button>
                                <AdminNotification />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    <User size={16} />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium text-gray-800">
                                        Admin User
                                    </div>
                                    <div className="text-xs text-gray-500">Quản trị viên</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Nội dung chính */}
                <main className="flex-1 p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
