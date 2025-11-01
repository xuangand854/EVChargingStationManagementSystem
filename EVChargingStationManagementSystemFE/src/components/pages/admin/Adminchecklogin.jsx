// import { Navigate } from "react-router-dom";
// import { getAuthStatus } from "../../../API/Auth";

// export default function AdminCheckLogin({ children }) {
//   const { isAuthenticated, user } = getAuthStatus();

//   // chưa đăng nhập → quay lại login
//   if (!isAuthenticated) return <Navigate to="/login" replace />;

//   // nếu là admin → ép quay về trang admin
//   if (user.role === "Admin") return <Navigate to="/admin" replace />;

//   // còn lại (user thường) → được phép vào
//   return children;
// }
import { Navigate } from "react-router-dom";
import { getAuthStatus } from "../../../API/Auth";

export default function AdminCheckLogin({ children }) {
  const { isAuthenticated, user } = getAuthStatus();

  // Nếu đã đăng nhập và là admin → chuyển đến trang admin
  if (isAuthenticated && user.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  // Còn lại (chưa login hoặc không phải admin) → cho vào trang Home
  return children;
}


