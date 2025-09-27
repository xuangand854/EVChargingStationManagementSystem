import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Layout from "./pages/Layout";
import Layout from "./components/pages/Layout";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Login from "./components/login/login";
import Profile from "./components/profile/Profile";


import Signup from "./components/signpage/Signup";
import Forgotpassword from "./components/forgotpass/Forgotpassword";
// import NoPage from "./pages/NoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="sign-up" element={<Signup />} />
          <Route path="forgot-password" element={<Forgotpassword />} />
          <Route path="profile" element={<Profile />} />

          

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

