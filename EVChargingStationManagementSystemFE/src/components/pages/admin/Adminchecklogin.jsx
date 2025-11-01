import { Navigate } from "react-router-dom";
import { getAuthStatus } from "../../../API/Auth";

export default function AdminCheckLogin({ children }) {
  const { isAuthenticated, user } = getAuthStatus();

  // chưa đăng nhập → quay lại login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // nếu là admin → ép quay về trang admin
  if (user.role === "Admin") return <Navigate to="/admin" replace />;

  // còn lại (user thường) → được phép vào
  return children;
}