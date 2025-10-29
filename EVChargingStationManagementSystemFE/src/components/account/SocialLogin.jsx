import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SocialLogin.css";

export default function SocialLogin() {
  const navigate = useNavigate();

    useEffect(() => {
      const initializeGoogle = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id:
              "564058384344-udma25adjacc77i4kfoo2bs8tmhddirs.apps.googleusercontent.com",
            callback: handleCredentialResponse,
          });
          console.log("Google SDK initialized");
        } else {
          console.error("Google SDK not loaded");
        }
      };

      // Nếu SDK chưa load thì chờ sự kiện load
      if (!window.google) {
        window.addEventListener("load", initializeGoogle);
      } else {
        initializeGoogle();
      }

      return () => {
        window.removeEventListener("load", initializeGoogle);
      };
    }, []);

  //  Hàm xử lý khi Google trả token
  const handleCredentialResponse = async (response) => {
    console.log("Google ID Token:", response.credential);

    try {
      const res = await fetch("https://localhost:7252/api/Auth/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      console.log("Response từ BE:", data);

      const token = data.token;
      if (token) {
        localStorage.setItem("token", token);
        window.dispatchEvent(new Event("auth-changed"));
        navigate("/", { replace: true });
      } else {
        throw new Error("Không tìm thấy token trong phản hồi");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Đăng nhập Google thất bại!");
    }
  };

  // Khi click vào nút custom
  const handleCustomGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt(); // mở popup Google
    } else {
      alert("Google SDK chưa sẵn sàng, vui lòng thử lại!");
    }
  };

  return (
    <div className="social-login">
      <button className="google-btn" onClick={handleCustomGoogleLogin}>
        <img src="/img/google.svg" alt="Google" className="google-icon" />
        <span>Đăng nhập với Google</span>
      </button>
    </div>
  );
}
