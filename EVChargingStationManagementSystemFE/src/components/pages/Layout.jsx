import { Outlet, Link, useLocation } from "react-router-dom";
import "./Layout.css";
import { getAuthStatus } from "../../API/Auth";
import { useEffect, useState } from "react";
import ProfileMenu from "../profile/ProfileMenu";
// import AuthDebug from "../debug/AuthDebug";



const Layout = () => {
    // const roleName = localStorage.getItem("roleName")
    // const isLoggedIn = !!roleName;
    const location = useLocation();
    const [auth, setAuth] = useState(getAuthStatus());

    useEffect(() => {
        const handleAuthChanged = () => setAuth(getAuthStatus());
        window.addEventListener('auth-changed', handleAuthChanged);
        return () => window.removeEventListener('auth-changed', handleAuthChanged);
    }, []);

    useEffect(() => {
        // Mỗi lần route đổi cũng kiểm tra lại
        setAuth(getAuthStatus());
    }, [location.pathname]);

    const { isAuthenticated, user } = auth;
    const role = user?.role;
    const userRole = localStorage.getItem("user_role");
    console.log("Auth status:", { isAuthenticated, user, role, userRole });
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
                    <>
                        <li>
                            <Link to="/order-charging">Đặt Trạm Sạc</Link>
                        </li>
                    </>
                    {!isAuthenticated && (
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    )}


                    {/* Admin */}
                    {/* {userRole === "Admin" && (
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>
                    )} */}

                    {/* Staff (và Admin nếu muốn) */}
                    {(userRole === "Staff" ) && (
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