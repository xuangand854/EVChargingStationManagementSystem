import React, { useState } from "react";
import InputField from "../account/InputField";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../API/Auth";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Vui lòng nhập email.");
      return;
    }
    // Validate format email đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Email không đúng định dạng.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const response = await forgotPassword(email);
      setIsSuccess(true);
      setMessage(response?.message || "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.");
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      const data = error.response?.data;
      const serverMsg =
        data?.errors?.Email?.[0] ||
        data?.errors?.email?.[0] ||
        data?.message ||
        data?.title ||
        "Đã xảy ra lỗi. Vui lòng thử lại.";
      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="forgot-wrapper">
      <div className="Forgot-container">
        <h2 className="form-title">Forgot Password</h2>

        <form className="Forgot-form" onSubmit={handleSubmit}>
          <InputField
            type="email"
            placeholder="Enter your email"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className={`response-message ${isSuccess ? 'ok' : 'err'}`}>{message}</p>
        )}

        <p className="signup-text">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};



export default ForgotPassword;
