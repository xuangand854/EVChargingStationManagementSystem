import { useNavigate } from "react-router-dom"

const SocialLogin = () => {
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    // sau này bạn có thể gọi API Google Auth ở đây
    navigate("#")  // chuyển tới trang login
  }

  return (
    <div className="social-login">
      <button className="social-button" onClick={handleGoogleLogin}>
        <img src="/img/google.svg" alt="Google" className="social-icon" />
        Google
      </button>
      <button className="social-button">
        <img src="/img/apple.svg" alt="Apple" className="social-icon" />
        Apple
      </button>
    </div>
  )
}

export default SocialLogin