import React from "react";
import { Outlet } from "react-router-dom";
import { User } from "lucide-react";
import AdminSidebar from "../admin/AdminSidebar";
import StaffSidebar from "./StaffSidebar";
import "../admin/AdminLayout.css";


const StaffLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- SIDEBAR (bên trái cố định) --- */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30">
                <StaffSidebar />
            </div>

            CONTENT LỆCH SANG PHẢI
            <div className="admin-content">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2 lg:px-6">
                    <div className="flex items-center justify-end">
                        {/* Thông tin user */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                <User size={16} />
                            </div>
                            <div className="hidden sm:block">


                            </div>
                        </div>
                    </div>
                </header>

                {/* Nội dung chính */}
                <main className="flex-1 p-2 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
