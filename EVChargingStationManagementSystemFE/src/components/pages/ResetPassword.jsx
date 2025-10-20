import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import './ResetPassword.css';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const userId = query.get("userId");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token || !userId) {
            setError("Liên kết đặt lại mật khẩu không hợp lệ.");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        if (password !== confirm) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            // Thay endpoint bằng API thật của bạn
            const resp = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, token, password }),
            });

            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                throw new Error(data.message || "Đặt lại mật khẩu thất bại.");
            }

            setSuccess("Đặt lại mật khẩu thành công. Đang chuyển hướng...");
            setTimeout(() => navigate("/login"), 1400);
        } catch (err) {
            setError(err.message || "Đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <h2 className="reset-title">Đặt lại mật khẩu</h2>
                <p className="reset-subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <form className="reset-form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label className="input-label">Mật khẩu mới</label>
                        <input
                            className="reset-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mật khẩu mới"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Xác nhận mật khẩu</label>
                        <input
                            className="reset-input"
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Xác nhận mật khẩu"
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>
                </form>

                <div style={{ marginTop: 12 }}>
                    <span className="helper-text">
                        <Link className="reset-link" to="/login">Đăng nhập</Link>
                    </span>
                    <span style={{ float: "right" }}>
                        <Link className="reset-link" to="/forgot-password">Quên mật khẩu?</Link>
                    </span>
                </div>
            </div>
        </div>
    );
}
