
import React, { useEffect, useState } from "react";
import "../signpage/Signup.css" // file CSS riêng
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
    // set class cho body khi Signup mount
    document.body.className = "signup-body";

    // cleanup khi rời trang
    return () => {
      document.body.className = "";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formValues.email || !formValues.password || !formValues.name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    if (formValues.password !== formValues.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      await registerApi(formValues.email, formValues.password, formValues.name, formValues.phone);
      setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg = typeof err === "string" ? err : (err?.message || "Đăng ký thất bại");
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

            required
            className="input-field"
            value={formValues.name}
            onChange={handleChange}
          />
          <i className="bx bx-envelope"></i>
        </div>

        {/* Full Name */}
        <div className="input-wrapper">
          <input

            name="email"
            type="email"
            placeholder="Email address"

            required
            className="input-field"
            value={formValues.email}
            onChange={handleChange}
          />
          <i className="bx bx-user"></i>
        </div>

        {/* Password */}
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
            required
            className="input-field"
            value={formValues.password}
            onChange={handleChange}
          />
          <i className="bx bx-lock-alt"></i>
          <i className="bx bx-hide eye-icon"></i>
        </div>

        {/* Phone */}
        <div className="input-wrapper">
          <input

            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"

            required
            className="input-field"
            value={formValues.confirmPassword}
            onChange={handleChange}
          />
          <i className="bx bx-phone"></i>
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
