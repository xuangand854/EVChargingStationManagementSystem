import { useEffect } from "react";
import InputField from "../account/InputField";
import SocialLogin from "../account/SocialLogin";
import "./login.css";

const Login = () => {
  useEffect(() => {
    document.body.className = "login-body"; // set body class
    return () => {
      document.body.className = ""; // cleanup khi thoát trang
    };
  }, []);

  return (
    <div className="Login-container">
      <h2 className="form-title">
        <a href="/google-connection">Login in with</a>
      </h2>
      <SocialLogin />

      <p className="separator">
        <span>or</span>
      </p>

      <form action="#" className="Login-form">
        <InputField type="email" placeholder="Email address" icon="mail" />
        <InputField type="password" placeholder="Password" icon="lock" />

        <a href="#" className="forgot-pass-link">Forgot Password?</a>
        <button className="login-button">Log In</button>
      </form>
      <p className="signup-text">
        Don&apos;t have an account? <a href="/sign-up">Sign up now</a>
      </p>
    </div>
  );
};

export default Login;
