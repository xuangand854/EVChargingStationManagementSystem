import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx"; // App = HomePage
import Login from "./components/login/login.jsx";
import Signup from "./components/signpage/signup.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />        {/* HomePage */}
        <Route path="/login" element={<Login />} /> {/* LoginPage */}
        <Route path="/sign-up" element={<Signup />} /> {/* SignupPage */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
