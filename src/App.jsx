import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

function App() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <h1>Welcome to My App 🚀</h1>
      <p>This is your homepage. Click below to login.</p>
      <button onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );
}

export default App;
