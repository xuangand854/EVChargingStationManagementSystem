import React, { useEffect } from "react";
import "../signpage/Signup.css"; // file CSS riêng
import { Link } from "react-router-dom";

const Signup = () => {
  useEffect(() => {
    // set class cho body khi Signup mount
    document.body.className = "signup-body";

    // cleanup khi rời trang
    return () => {
      document.body.className = "";
    };
  }, []);

  return (
    <div className="Signup-container">
      <h2 className="form-title">Create an Account</h2>

      <form className="Signup-form">
        {/* Email */}
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Email address"
            required
            className="input-field"
          />
          <i className="bx bx-envelope"></i>
        </div>

        {/* Full Name */}
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="input-field"
          />
          <i className="bx bx-user"></i>
        </div>

        {/* Password */}
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Password"
            required
            className="input-field"
          />
          <i className="bx bx-lock-alt"></i>
          <i className="bx bx-hide eye-icon"></i>
        </div>

        {/* Phone */}
        <div className="input-wrapper">
          <input
            type="tel"
            placeholder="Phone number"
            required
            className="input-field"
          />
          <i className="bx bx-phone"></i>
        </div>

        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>

      <p className="signup-text">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
