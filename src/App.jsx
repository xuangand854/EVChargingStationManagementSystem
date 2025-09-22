// import { Router } from "react-router-dom";
// import InputField from "./components/account/InputField";
// import SocialLogin from "./components/account/SocialLogin";
// import Login from "./components/pages/Login";
// import Home from "./components/pages/Home";
// import About from "./components/pages/About";
// import Contact from "./components/pages/Contact";
// // const App = () => {
//   return (
//     <div className="Login-container">
//       <h2 className="form-title"><a href="/google-connection"> Login in with</a></h2>
//       <SocialLogin />

//       <p className="separator"><span>or</span></p>

//       <form action="#" className="Login-form">
//         <InputField type="email" placeholder="Email address" icon="mail" />
//         <InputField type="password" placeholder="Password" icon="lock" />



//         <a href="#" className="forgot-pass-link">Forgot Password?</a>
//         <button className="login-button">Log In</button>
//       </form>
//       <p className="signup-text">Don&apos;t have an account? <a href="/sign-up">Sign up now</a></p>
//     </div>
//   )
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Layout from "./pages/Layout";
import Layout from "./components/pages/Layout";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Login from "./components/pages/Login";
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}






