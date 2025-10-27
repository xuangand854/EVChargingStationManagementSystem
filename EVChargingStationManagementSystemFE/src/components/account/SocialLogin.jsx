import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SocialLogin.css";

const SocialLogin = () => {
  const navigate = useNavigate();
  const googleClient = useRef(null);
//khởi tạo Google OAuth
  useEffect(() => {
    const loadGoogle = () => {
      if (window.google && window.google.accounts && !googleClient.current) {
        googleClient.current = window.google.accounts.oauth2.initCodeClient({
          client_id:
            "564058384344-udma25adjacc77i4kfoo2bs8tmhddirs.apps.googleusercontent.com",//client id của googleclound
          scope: "openid email profile",//xin goole cấp quyền truy cập
          ux_mode: "popup",//khung trang google
          callback: handleCredentialResponse,//trả về người dùng
        });
        console.log(" Google SDK loaded successfully");
      } else if (!window.google) {
        console.log(" Waiting for Google SDK...");
        setTimeout(loadGoogle, 500);
      }
    };

    loadGoogle();
  }, []);

  const handleCredentialResponse = (response) => {
    console.log("Authorization code:", response.code);
    // api xac thuc token của BE 
    fetch("http://localhost:7252/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: response.code }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("token", data.accessToken);//lưu token trên fe 
        navigate("/");//trả về homepage
      })
      .catch((err) => console.error("Login failed:", err));
  };
// xử lý khi click 
  const handleCustomGoogleLogin = () => {
    if (googleClient.current) {
      googleClient.current.requestCode();//mở pop
    } else {
      alert("Google chưa sẵn sàng, thử lại sau!");
    }
  };

  return (
    <div className="social-login">
      <button className="google-btn" onClick={handleCustomGoogleLogin}>
        <img src="/img/google.svg" alt="Google" className="google-icon" />
        Google
      </button>
    </div>
  );
};

export default SocialLogin;
