    import React, { useState, useEffect } from "react";
    import "./Profile.css";

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

    const [activeTab, setActiveTab] = useState("profile"); // "profile" | "choose-car"

    const [selectedCar, setSelectedCar] = useState(null); // Loại xe chọn

    useEffect(() => {
        // ===== Demo profile để test bố cục =====
        

        // ====== NOTE: Gọi API lấy profile ở đây ======
        // apiGetProfile().then(data => {
        //   setUser(data);
        //   setFormData(data);
        // }).catch(() => setUser(null));

        




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
