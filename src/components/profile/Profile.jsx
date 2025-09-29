import React, { useState, useEffect } from "react";
import "./Profile.css";
import { getAuthStatus } from "../../API/Auth";


// Default avatars theo role
const defaultAvatars = {
    customer: "https://i.pravatar.cc/150?img=5",
    staff: "https://i.pravatar.cc/150?img=12",
    admin: "https://i.pravatar.cc/150?img=20",
};

const Profile = () => {
    const [user, setUser] = useState(null); // null nếu chưa login
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile"); // "profile" | "choose-car"
    const [selectedCar, setSelectedCar] = useState(null); // Loại xe chọn

    // useEffect(() => {
    //     // ===== Demo profile để test bố cục =====
    //     setUser({
    //     name: "Nguyen Van A",
    //     email: "a@example.com",
    //     phone: "0123456789",
    //     role: "staff", // customer | staff | admin
    //     avatar: "", // nếu để trống, sẽ lấy avatar mặc định theo role
    //     });
    //     setFormData({
    //     name: "Nguyen Van A",
    //     email: "a@example.com",
    //     phone: "0123456789",
    //     role: "staff",
    //     avatar: "",
    //     });

    // ====== NOTE: Gọi API lấy profile ở đây ======
    // apiGetProfile().then(data => {
    //   setUser(data);
    //   setFormData(data);
    // }).catch(() => setUser(null));

    // }, []);

    // useEffect để lấy thông tin user từ JWT
    useEffect(() => {
        const loadUserProfile = () => {
            try {
                console.log('Bắt đầu load user profile...');
                const authStatus = getAuthStatus();

                console.log('Auth Status:', authStatus);

                if (authStatus.isAuthenticated && authStatus.user) {
                    console.log('User data từ JWT:', authStatus.user);

                    // Lấy thông tin từ JWT decoded
                    const userData = {
                        name: authStatus.user.name || 'Chưa cập nhật',
                        email: authStatus.user.email || '',
                        phone: authStatus.user.phone || 'Chưa cập nhật',
                        role: Array.isArray(authStatus.user.role)
                            ? authStatus.user.role[0] || 'customer'  // Lấy role đầu tiên nếu là array
                            : authStatus.user.role || 'customer',
                        avatar: authStatus.user.avatar || '',
                        userId: authStatus.user.userId || '',
                    };

                    console.log('User data đã xử lý:', userData);

                    setUser(userData);
                    setFormData(userData);
                } else {
                    console.log('User chưa authenticated hoặc không có user data');
                    setUser(null);
                }
            } catch (error) {
                console.error('Lỗi khi load user profile:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            // ====== NOTE: Gọi API update profile ở đây ======
            // await apiUpdateProfile(formData);

            setUser(formData);
            setSuccess("Cập nhật hồ sơ thành công!");
            setIsEditing(false);
        } catch (err) {
            setError(err?.message || "Cập nhật thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="profile-loading">
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    // ===== Chưa login =====
    if (!user) {
        return (
            <div className="profile-not-logged-in">
                <p>Bạn chưa đăng nhập</p>
                {/* ===== NOTE: dùng react-router để chuyển trang login ===== */}
                <button onClick={() => (window.location.href = "/login")}>
                    Đến trang đăng nhập
                </button>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            {/* Bên trái: menu */}
            <div className="profile-left">
                <h3>Menu</h3>
                <button onClick={() => { setActiveTab("profile"); setIsEditing(false); }}>
                    Xem thông tin
                </button>
                <button
                    onClick={() => {
                        setActiveTab("profile");
                        setIsEditing(true);
                    }}
                >
                    Chỉnh sửa thông tin
                </button>
                <button
                    onClick={() => {
                        setActiveTab("choose-car");
                        setIsEditing(false);
                    }}
                >
                    Chọn loại xe
                </button>
            </div>

            {/* Giữa: nội dung hiển thị */}
            <div className="profile-center">
                {activeTab === "profile" && (
                    <>
                        <div className="profile-avatar">
                            <img
                                src={user.avatar || defaultAvatars[user.role] || defaultAvatars.customer}
                                alt="User Avatar"
                            />
                        </div>

                        {!isEditing ? (
                            <div className="profile-info">
                                <h2>{user.name}</h2>
                                <p>Email: {user.email}</p>
                                <p>Phone: {user.phone}</p>
                                <p>Role: {user.role}</p>
                                {/* Hiển thị thêm thông tin từ JWT nếu có */}
                                {user.userId && <p>User ID: {user.userId}</p>}
                            </div>
                        ) : (
                            <div className="profile-form">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Name"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Phone"
                                />
                                {error && <p className="error">{error}</p>}
                                {success && <p className="success">{success}</p>}
                                <div className="form-buttons">
                                    <button onClick={handleSave} disabled={submitting}>
                                        {submitting ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "choose-car" && (
                    <div className="choose-car-section">
                        <h2>Chọn loại xe</h2>
                        <p>Thông tin loại xe bạn đã chọn sẽ hiển thị ở đây</p>

                        {/* ===== NOTE: API gợi ý loại xe, danh sách xe, scrollable ===== */}
                        <div className="car-list">
                            {/* Demo */}
                            {["Xe A", "Xe B", "Xe C"].map((car) => (
                                <div
                                    key={car}
                                    className={`car-item ${selectedCar === car ? "selected" : ""}`}
                                    onClick={() => setSelectedCar(car)}
                                >
                                    {car}
                                </div>
                            ))}
                        </div>

                        {selectedCar && <p>Bạn chọn: {selectedCar}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;