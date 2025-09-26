import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../../API/Auth";
import InputField from "../account/InputField";
import SocialLogin from "../account/SocialLogin";
import "./login.css";


const Login = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.className = "login-body"; // set body class
    return () => {
      document.body.className = ""; // cleanup khi thoát trang
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formValues.email || !formValues.password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await loginApi(formValues.email, formValues.password);
      if (typeof token === 'string' && token.length > 0) {
        localStorage.setItem('token', token);
      }
      navigate("/");
    } catch (err) {
      const msg = typeof err === "string" ? err : (err?.message || "Đăng nhập thất bại");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <div className="Login-container">
      <h2 className="form-title">
        <a href="#">Login in with</a>
      </h2>
      <SocialLogin />

      <p className="separator">
        <span>or</span>
      </p>

      <form className="Login-form" onSubmit={handleSubmit}>
        <InputField name="email" value={formValues.email} onChange={handleChange} type="email" placeholder="Email address" icon="mail" />
        <InputField name="password" value={formValues.password} onChange={handleChange} type="password" placeholder="Password" icon="lock" />

        <a href="/forgot-password" className="forgot-pass-link">Forgot Password?</a>
        <button className="login-button" disabled={submitting}>{submitting ? 'Logging in...' : 'Log In'}</button>
      </form>
      {error && <p style={{ color: '#d00', marginTop: '10px' }}>{error}</p>}
      <p className="signup-text">
        Don&apos;t have an account? <Link to="/sign-up">Sign up now</Link>
      </p>
    </div>
  );
};

export default Login;