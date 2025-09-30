import { Outlet, Link, useLocation } from "react-router-dom";
import "./Layout.css";
import { getAuthStatus } from "../../API/Auth";
import { useEffect, useState } from "react";


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
    console.log("Auth status:", { isAuthenticated, user });
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li>
                    {!isAuthenticated && (
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    )}

                    {isAuthenticated && (
                        <>
                            <li>
                                <Link to="/profile">Profile</Link>
                            </li>
                            <li>
                                <Link to="/Logout">Logout</Link>
                            </li>
                        </>
                    )}
                    {/* Admin */}
                    {role === "Admin" && (
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>
                    )}

                    {/* Staff (và Admin nếu muốn) */}
                    {(role === "Staff" || role === "Admin") && (
                        <li>
                            <Link to="/staff">Staff Page</Link>
                        </li>
                    )}
                </ul>
            </nav>

            <Outlet />
        </>
    )
};

export default Layout;