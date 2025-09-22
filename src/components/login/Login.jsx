import SocialLogin from "../account/SocialLogin";
import InputField from "../account/InputField";
import Signup from "../signpage/Signup";
const Login = () => {
    return (
        <div className="Login-container">
            <h2 className="form-title"> Login in with</h2>
            <SocialLogin />

            <p className="separator"><span>or</span></p>

            <form action="#" className="Login-form">
                <InputField type="email" placeholder="Email address" icon="mail" />
                <InputField type="password" placeholder="Password" icon="lock" />


                <a href="#" className="forgot-pass-link">Forgot Password?</a>
                <button className="login-button">Log In</button>
            </form>
            <p className="signup-text">Don&apos;t have an account? <a href="Signup">Sign up now</a></p>
        </div>
    )
}
export default Login;