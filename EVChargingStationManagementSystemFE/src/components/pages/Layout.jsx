import { Outlet, Link, useLocation } from "react-router-dom";
import "./Layout.css";
import { getAuthStatus } from "../../API/Auth";
import { useEffect, useState } from "react";
import ProfileMenu from "../profile/ProfileMenu";
import { jwtDecode } from "jwt-decode";
// import AuthDebug from "../debug/AuthDebug";



const Layout = () => {
    // const roleName = localStorage.getItem("roleName")
    // const isLoggedIn = !!roleName;
    const location = useLocation();
    const [auth, setAuth] = useState(getAuthStatus());
    const [role, setRole] = useState(localStorage.getItem("user_role") || null);

  useEffect(() => {
    const handleAuthChanged = () => {
      const newAuth = getAuthStatus();
      setAuth(newAuth);

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded?.role) {
            localStorage.setItem("user_role", decoded.role);
            setRole(decoded.role);
          }
        } catch (err) {
          console.error("Lỗi giải mã token:", err);
          localStorage.removeItem("user_role");
          setRole(null);
        }
      } else {
        localStorage.removeItem("user_role");
        setRole(null);
      }
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    handleAuthChanged();
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, [location.pathname]);

  const { isAuthenticated, user } = auth;
  console.log(" Auth Layout:", { isAuthenticated, user, role });
    return (
        <>
            {/* <AuthDebug /> */}
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {/* <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li> */}
                    {/* OrderCharging */}
                    {role !== "Admin" && role !== "Staff" && (
                        <li>
                        <Link to="/order-charging">Đặt Trạm Sạc</Link>
                        </li>
                    )}
                    {role === "EVDriver" && (
                        <li>
                            <Link to="/profile-page">Thông Tin Tài Khoản</Link>
                        </li>
                    )}

                    {!isAuthenticated && (
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    )}


                    {/* Admin */}
                    {role === "Admin" && (
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>
                    )}

                    {/* Staff (và Admin nếu muốn) */}
                    {(role === "Admin"  ) && (
                        <li>
                            <Link to="/staff">Staff Page</Link>
                        </li>
                    )}
                    {isAuthenticated && (
                        <>
                            <li>
                                {/* Thay vì hiện Profile/Logout link → hiện avatar dropdown */}
                                <ProfileMenu />
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            <Outlet />
        </>
    )
};

export default Layout;