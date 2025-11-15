import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../API/Auth";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  Lấy userId bằng searchParams, token thì giữ nguyên gốc
  useEffect(() => {
    const urlUserId = searchParams.get("userId");

    //  Lấy token gốc từ window.location.search (giữ nguyên ký tự %)
    const rawQuery = window.location.search.substring(1); // bỏ dấu '?'
    const rawParams = Object.fromEntries(rawQuery.split("&").map(p => p.split("=")));
    const rawToken = rawParams.token;

    if (urlUserId && rawToken) {
      setUserId(urlUserId);
      setToken(rawToken);
      console.log(" Token gốc (giữ nguyên %):", rawToken);
    } else {
      setMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      setIsSuccess(false);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      setMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      setIsSuccess(false);
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      setIsSuccess(false);
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setMessage("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      setIsSuccess(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await resetPassword(userId, token, formData.newPassword);

      setIsSuccess(true);
      setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setIsSuccess(false);

      const data = error.response?.data;
      let serverMsg = "Đã xảy ra lỗi. Vui lòng thử lại.";

      if (data?.errors && Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        if (firstError?.code === "InvalidToken") {
          serverMsg = "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.";
        } else if (firstError?.description) {
          serverMsg = firstError.description;
        }
      } else if (data?.message) {
        serverMsg = data.message;
      } else if (data?.title) {
        serverMsg = data.title;
      } else if (error?.message) {
        serverMsg = error.message;
      }

      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-title">Đặt lại mật khẩu</h1>
        <p className="reset-subtitle">Nhập mật khẩu mới của bạn</p>

        <form className="reset-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Mật khẩu mới</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                className="reset-input"
                placeholder="Nhập mật khẩu mới"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Xác nhận mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="reset-input"
                placeholder="Nhập lại mật khẩu mới"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !userId || !token}
            >
              {loading ? "Đang xử lý..." : (!userId || !token) ? "Liên kết không hợp lệ" : "Đặt lại mật khẩu"}
            </button>
          </div>
        </form>

        {message && (
          <div className={isSuccess ? "success" : "error"}>
            {message}
            {!isSuccess && message.includes("Token đặt lại mật khẩu không hợp lệ") && (
              <div style={{ marginTop: "8px" }}>
                <Link to="/forgot-password" style={{ color: "#2563eb", textDecoration: "underline" }}>
                  Yêu cầu liên kết đặt lại mật khẩu mới
                </Link>
              </div>
            )}
          </div>
        )}

        <Link to="/login" className="reset-link">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
