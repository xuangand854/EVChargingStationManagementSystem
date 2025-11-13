import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ReportPage.css";

import { addReport } from "../../API/Report";
import { getChargingStation } from "../../API/Station";
import { getAllChargingPost } from "../../API/ChargingPost";

const ReportPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    reportType: "",
    severity: "",
    description: "",
    stationId: "",
    postId: "",
  });

  const [stations, setStations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stationSearch, setStationSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [showStationList, setShowStationList] = useState(false);
  const [showPostList, setShowPostList] = useState(false);


  // Lấy danh sách trạm

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await getChargingStation();
        const stationList = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setStations(stationList);
      } catch (err) {
        console.error("Lỗi khi lấy trạm:", err);
        setStations([]);
      }
    };
    fetchStations();
  }, []);


  // Lấy danh sách cột sạc theo trạm

  useEffect(() => {
    if (!formData.stationId) {
      setPosts([]);
      return;
    }
    const fetchPosts = async () => {
      try {
        const data = await getAllChargingPost(formData.stationId);
        setPosts(data || []);
      } catch (err) {
        console.error("Lỗi khi lấy post:", err);
      }
    };
    fetchPosts();
  }, [formData.stationId]);


  // Submit form

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.reportType || !formData.severity) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      reportType: formData.reportType,
      severity: formData.severity,
      description: formData.description.trim() || "",
      stationId: formData.stationId || null,
      postId: formData.postId || null,
    };

    console.log(" Payload gửi lên:", payload);

    try {
      setLoading(true);
      await addReport(
        payload.title,
        payload.reportType,
        payload.severity,
        payload.description,
        payload.stationId,
        payload.postId
      );
      setMessage(" Báo cáo đã gửi thành công!");
      setFormData({
        title: "",
        reportType: "",
        severity: "",
        description: "",
        stationId: "",
        postId: "",
      });
      setStationSearch("");
      setPostSearch("");
      setShowStationList(false);
      setShowPostList(false);
      setTimeout(() => navigate("/staff/staff-report"), 1500);
    } catch (err) {
      console.error(" Lỗi gửi báo cáo:", err);
      setMessage(" Gửi báo cáo thất bại!");
    } finally {
      setLoading(false);
    }
  };


  // Filter danh sách trạm & cột
  // Hàm bỏ dấu
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .toLowerCase();
};

  const filteredStations = Array.isArray(stations)
    ? stations.filter((s) => s.stationName?.toLowerCase().includes(stationSearch.toLowerCase()))
    : [];

const filteredPosts = Array.isArray(posts)
  ? posts.filter((p) => {
      const search = removeVietnameseTones(postSearch);
      const code = removeVietnameseTones(p.postCode || "");
      const name = removeVietnameseTones(p.postName || "");
      const idStr = (p.id || "").toString();
      return code.includes(search) || name.includes(search) || idStr.includes(search);
    })
  : [];

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Gửi báo cáo</h1>
        <p>Hãy mô tả vấn gửi cho hệ thống</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề báo cáo"
              required
            />
          </div>

          {/* Loại báo cáo */}
          <div className="form-group">
            <label>Loại báo cáo</label>
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              required
            >
              <option value="">-- Chọn loại báo cáo --</option>
              <option value="Bug">Lỗi hệ thống</option>
              <option value="FeatureRequest">Yêu cầu tính năng</option>
              <option value="Maintenance">Bảo trì</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          {/* Mức độ */}
          <div className="form-group">
            <label>Mức độ nghiêm trọng</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              required
            >
              <option value="">-- Chọn mức độ --</option>
              <option value="Low">Thấp</option>
              <option value="Medium">Trung bình</option>
              <option value="High">Cao</option>
              <option value="Critical">Nghiêm trọng</option>
            </select>
          </div>

          {/* Trạm sạc */}
          <div className="form-group" style={{ position: "relative" }}>
            <label>Trạm sạc</label>
            <input
              type="text"
              placeholder="Tìm trạm sạc..."
              value={stationSearch}
              onFocus={() => setShowStationList(true)}
              onChange={(e) => {
                setStationSearch(e.target.value);
                setShowStationList(true);
              }}
            />
            {showStationList && stationSearch && (
              <ul className="dropdown-list">
                {filteredStations.length > 0 ? (
                  filteredStations.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => {
                        setFormData({ ...formData, stationId: s.id, postId: "" });
                        setStationSearch(s.stationName);
                        setShowStationList(false);
                        setPostSearch("");
                      }}
                    >
                      {s.stationName} ({s.province})
                    </li>
                  ))
                ) : (
                  <li className="no-result">Không tìm thấy trạm phù hợp</li>
                )}
              </ul>
            )}
          </div>

          {/* Cột sạc */}
          <div className="form-group" style={{ position: "relative" }}>
            <label>Trụ sạc</label>
            <input
              type="text"
              placeholder={formData.stationId ? "Tìm Trụ sạc..." : "Hãy chọn trạm sạc trước"}
              value={postSearch}
              disabled={!formData.stationId}
              onFocus={() => setShowPostList(true)}
              onChange={(e) => {
                setPostSearch(e.target.value);
                setShowPostList(true);
              }}
            />
            {showPostList && (
                <ul className="dropdown-list">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => {
                          setFormData({ ...formData, postId: p.id }); 
                          setPostSearch(p.postName || p.postCode || `Trụ:${p.id}`);
                          setShowPostList(false);
                        }}
                      >
                        {p.postName || p.postCode || `Trụ:${p.id}`}
                      </li>
                    ))
                  ) : (
                    <li className="no-result">Không tìm thấy trụ phù hợp</li>
                  )}
                </ul>
              )}

          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết vấn đề..."
            />
          </div>

          {/* Buttons */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>

          
        </form>

        {message && (
          <div className="notify" style={{ marginTop: "10px", color: message.includes("✅") ? "green" : "red" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
