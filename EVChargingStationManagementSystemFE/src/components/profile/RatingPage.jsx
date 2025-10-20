import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RatingPage.css";

const RatingPage = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao trước khi gửi!");
      return;
    }
    toast.success("✅ Cảm ơn đánh giá của bạn!");
    setTimeout(() => {
      navigate("/profile-page");
    }, 1500);
    setRating(0);
    setHoverRating(0);
    setComment("");
  };
  const handleGoBack = () => {
    navigate("/profile-page"); // chỉ quay lại, không validate
  };

  return (
    <div className="rating-page">
      <div className="rating-header">
        <h1>🌟 Đánh giá dịch vụ</h1>
        <p>Hãy cho chúng tôi biết trải nghiệm của bạn</p>
      </div>

      <div className="rating-cards">
        <div className="rating-card">
          <h3>Chọn số sao</h3>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= (hoverRating || rating) ? "active" : ""}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Nhập nhận xét (tùy chọn)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="submit-btn" onClick={handleSubmit}>
            Gửi đánh giá
          </button>
          <button className="submit-btn" onClick={handleGoBack}>
            Quay lại
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default RatingPage;
