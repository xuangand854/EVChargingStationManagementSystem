import React from "react";
import InputField from "../account/InputField";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="forgot-wrapper">
      <div className="Forgot-container">
        <h2 className="form-title">Forgot Password</h2>

        <form className="Forgot-form">
          <InputField type="email" placeholder="Enter your email" icon="mail" />
          <button type="submit" className="login-button">
            Send Reset Link
          </button>
        </form>

        <p className="signup-text">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
