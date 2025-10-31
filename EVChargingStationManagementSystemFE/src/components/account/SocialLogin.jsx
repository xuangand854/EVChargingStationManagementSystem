import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SocialLogin.css";

export default function SocialLogin() {
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    console.log("✅ ID Token:", response.credential);
    try {
      const res = await fetch("https://localhost:7252/api/Auth/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: "1013907037329-9a7jagaa0pql89haevnh74fr88mp5cl3.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    // Render nút Google
    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",      
        size: "large",
        width: 280,             
        shape: "rectangular",
      }
    );
  }, []);

  return (
    <div className="social-login">
      {/* Wrapper để kéo dài nút và thêm text */}
      <div className="google-btn-wrapper">
        <div id="googleBtn"></div>
        <span className="google-text">Đăng nhập với Google</span>
      </div>
    </div>
  );
}
