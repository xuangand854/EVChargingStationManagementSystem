import React, { useEffect, useState } from "react";
import "../pages/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../API/Auth";

const Signup = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.className = "signup-body";
    return () => {
      document.body.className = "";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Validate chung: nếu bỏ trống bất kỳ trường bắt buộc nào
  const validateForm = () => {
    const { name, email, password, confirmPassword, phone } = formValues;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return "Vui lòng điền đầy đủ thông tin.";
    }

    // Validate chi tiết nếu đã nhập
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ.";

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(password))
      return "Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt.";

    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp.";

    if (phone) {
      const phoneRegex = /^(0|\+84)\d{9,10}$/;
      if (!phoneRegex.test(phone)) return "Số điện thoại không hợp lệ.";
    }

    return null; // không có lỗi
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await registerApi(
        formValues.email,
        formValues.password,
        formValues.name,
        formValues.phone
      );
      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản."
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Đăng ký thất bại";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="Signup-container">
      <h2 className="form-title">Create an Account</h2>

      <form className="Signup-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={formValues.name}
            onChange={handleChange}
          />
          <i className="bx bx-user"></i>
        </div>

        <div className="input-wrapper">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            className="input-field"
            value={formValues.email}
            onChange={handleChange}
          />
          <i className="bx bx-envelope"></i>
        </div>

        <div className="input-wrapper">
          <input
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            className="input-field"
            value={formValues.phone}
            onChange={handleChange}
          />
          <i className="bx bx-phone"></i>
        </div>

        <div className="input-wrapper">
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="input-field"
            value={formValues.password}
            onChange={handleChange}
          />
          <i className="bx bx-lock-alt"></i>
          <i className="bx bx-hide eye-icon"></i>
        </div>

        <div className="input-wrapper">
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="input-field"
            value={formValues.confirmPassword}
            onChange={handleChange}
          />
          <i className="bx bx-lock-alt"></i>
        </div>

        {error && <p style={{ color: "#d00", marginBottom: "12px" }}>{error}</p>}
        {success && <p style={{ color: "#0a0", marginBottom: "12px" }}>{success}</p>}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <p className="signup-text">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
