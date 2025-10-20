import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import confetti from "canvas-confetti";
import "./ReportPage.css";


const ReportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    type: "bug",
    description: "",
  });

  const submitBtnRef = useRef(null); // ref để lấy nút submit

  const handleSubmit = (e) => {
    e.preventDefault();

    // Lấy vị trí nút submit
    const btn = submitBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // trigger confetti tại vị trí nút
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#27ae60", "#f1c40f", "#2c7be5", "#ff6b6b", "#8e44ad"],
      });
    }

    toast.success("✅ Báo cáo đã gửi thành công!");

    setFormData({ subject: "", type: "bug", description: "" });

    setTimeout(() => {
      navigate("/profile-page");
    }, 1500);
  };
  const handleGoBack = () => {
    navigate("/profile-page");
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>📢 Gửi báo cáo</h1>
        <p>Hãy cho chúng tôi biết vấn đề bạn gặp phải hoặc góp ý cải thiện hệ thống</p>
      </div>

      <div className="form-container">
        <h3>Thông tin báo cáo</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Nhập tiêu đề báo cáo"
              required
            />
          </div>
          <div className="form-group">
            <label>Loại báo cáo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="bug">Lỗi hệ thống</option>
              <option value="feature">Gợi ý tính năng</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết <span style={{fontWeight:400, fontSize:"13px", color:"#666"}}>(tùy chọn)</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết vấn đề hoặc góp ý"
            />
          </div>
          <button type="submit" ref={submitBtnRef} className="submit-btn">
            Gửi báo cáo
          </button>
          
          <button type="button" className="nav-buttonrollbackRP" onClick={handleGoBack}>
           <ArrowLeft className="icon" /> Quay lại
         </button>
        </form>
        
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ReportPage;
