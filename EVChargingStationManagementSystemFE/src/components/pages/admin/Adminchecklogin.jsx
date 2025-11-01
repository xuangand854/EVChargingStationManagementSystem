
import { getAuthStatus } from "../../../API/Auth";

export default function AdminCheckLogin({ children }) {
  const { isAuthenticated, user } = getAuthStatus();
  const location = useLocation();

  // ✅ Các trang public (ai cũng vào được)
  const publicPaths = ["/", "/login", "/sign-up", "/logout", "/forgot-password"];

  // Nếu đang ở trang public → cho phép
  if (publicPaths.includes(location.pathname)) {
    return children;
  }

  // 🔹 1️⃣ Nếu chưa đăng nhập → chỉ cho phép trang public
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 2️⃣ Nếu là Admin → chỉ cho phép trong /admin
  if (user?.role === "Admin") {
    if (!location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  }

  // 🔹 3️⃣ Nếu là Staff → chỉ cho phép trong /staff
  if (user?.role === "Staff") {
    if (!location.pathname.startsWith("/staff")) {
      return <Navigate to="/staff" replace />;
    }
    return children;
  }

  // 🔹 4️⃣ Nếu là User thường → cấm vào /admin và /staff
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff")
  ) {
    return <Navigate to="/" replace />;
  }

  // 🔹 5️⃣ Cho phép tất cả còn lại
  return children;
}
