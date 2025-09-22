


import React from "react";

const Signup = () => {
  return (
    <div className="Login-container">
      <h2 className="form-title">Create an Account</h2>

      <form className="Login-form">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="input-field"
          />
          <i className="bx bx-user"></i>
        </div>

        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Email address"
            required
            className="input-field"
          />
          <i className="bx bx-envelope"></i>
        </div>

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

        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="input-field"
          />
          <i className="bx bx-lock-alt"></i>
          <i className="bx bx-hide eye-icon"></i>
        </div>

        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>

      <p className="signup-text">
        Already have an account? <a href="/">Log in</a>
      </p>
    </div>
  );
};

export default Signup;
