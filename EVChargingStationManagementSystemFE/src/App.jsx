import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Layout from "./pages/Layout";

import Layout from "./components/pages/Layout";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Login from "./components/pages/Login";
import Profile from "./components/profile/Profile";

import Logout from "./components/pages/Logout";
import PrivateRoute from "./components/pages/PrivateRoute";
import Order from "./components/profile/Order"
import Car from "./components/profile/Car"

import Signup from "./components/pages/Signup";
import Forgotpassword from "./components/pages/Forgotpassword";
import OrderChargingST from "./components/ordercharging/OrderChargingST";
import ChargingPost from "./components/ordercharging/ChargingPost"

// Admin imports
import AdminLayout from "./components/pages/admin/AdminLayout";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import AdminStations from "./components/pages/admin/Stations";
import AdminStaff from "./components/pages/admin/Staff";
import AdminVehicles from "./components/pages/admin/AdminVehicles";
import AdminSettings from "./components/pages/admin/AdminSettings";
import AdminPrivateRoute from "./components/pages/admin/AdminPrivateRoute";
import PaymentPage from "./components/Payment/PaymentPage";
import Pay from "./components/Payment/Pay";
import ProfilePage from "./components/profile/ProfilePage";



// import NoPage from "./pages/NoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* LOGIN */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="sign-up" element={<Signup />} />
          <Route path="forgot-password" element={<Forgotpassword />} />
          {/* // */}
          {/* Profile */}
          <Route path="profile-page" element={<ProfilePage/>} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="Logout" element={<Logout />} />
          <Route path="orders" element={<Order />} />
          <Route path="car" element={<Car />} />
          {/* // */}
          {/* Trạm Sạc */}
          <Route path="order-charging" element={<OrderChargingST />} />
          <Route path="charging-post" element={<ChargingPost />} />
          {/* // */}
          {/* Pay */}
          <Route path="Payment" element={<PaymentPage/>} />
          <Route path="Pay" element={<Pay/>} />

          {/* // */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="stations" element={<AdminStations />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

