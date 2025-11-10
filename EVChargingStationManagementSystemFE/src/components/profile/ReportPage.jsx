import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ReportPage.css";

import { addReport } from "../../API/Report";
import { getChargingStation } from "../../API/Station";
import { getAllChargingPost } from "../../API/ChargingPost";
import { getMyAccountStaffById } from "../../API/Staff";

const ReportPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [staffLoaded, setStaffLoaded] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    reportType: "",
    severity: "",
    description: "",
    reportedById: "",
    stationId: "",
    postId: "",
  });

  const [stations, setStations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stationSearch, setStationSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [showStationList, setShowStationList] = useState(false);
  const [showPostList, setShowPostList] = useState(false);

  // --------------------------
  // Lấy staff hiện tại theo user_id trong localStorage
  // --------------------------
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const userId = localStorage.getItem("user_id"); // lấy ID user hiện tại
        if (!userId) throw new Error("Không tìm thấy user_id trong localStorage");

        const staff = await getMyAccountStaffById(userId); // API mới
        const staffData = staff?.data || staff;

        if (staffData?.id) {
          setFormData(prev => ({ ...prev, reportedById: staffData.id }));
          console.log("🔹 Staff hiện tại:", staffData);
        } else {
          alert("Không tìm thấy thông tin người báo cáo, hãy thử reload trang!");
        }
      } catch (err) {
        console.error("Lỗi lấy staff hiện tại:", err);
        alert("Không thể lấy thông tin staff hiện tại, hãy thử reload trang!");
      } finally {
        setStaffLoaded(true);
      }
    };

    fetchStaff();
  }, []);

  // --------------------------
  // Lấy danh sách trạm
  // --------------------------
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

  // --------------------------
  // Lấy danh sách cột sạc theo trạm
  // --------------------------
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

  // --------------------------
  // Submit form
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reportedById) {
      alert("Không tìm thấy thông tin người báo cáo, hãy thử reload trang!");
      return;
    }

    const payload = {
      title: formData.title?.trim(),
      reportType: formData.reportType,
      severity: formData.severity,
      description: formData.description?.trim() || null,
      reportedById: formData.reportedById,
      stationId: formData.stationId || null,
      postId: formData.postId || null,
    };

    console.log("📤 Payload gửi lên:", payload);

    try {
      setLoading(true);
      await addReport(payload);
      setMessage("✅ Báo cáo đã gửi thành công!");
      // Reset form nhưng giữ reportedById
      setFormData(prev => ({
        title: "",
        reportType: "",
        severity: "",
        description: "",
        reportedById: prev.reportedById,
        stationId: "",
        postId: "",
      }));
      setStationSearch("");
      setPostSearch("");
      setShowStationList(false);
      setShowPostList(false);
      setTimeout(() => navigate("/profile-page"), 1500);
    } catch (err) {
      console.error("❌ Lỗi gửi báo cáo:", err);
      if (err.response?.data?.errors) {
        console.table(err.response.data.errors);
        alert(JSON.stringify(err.response.data.errors, null, 2));
      }
      setMessage("❌ Gửi báo cáo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Filter danh sách trạm & cột
  // --------------------------
  const filteredStations = Array.isArray(stations)
    ? stations.filter(s => s.stationName?.toLowerCase().includes(stationSearch.toLowerCase()))
    : [];

  const filteredPosts = Array.isArray(posts)
    ? posts.filter(p => (p.postCode || p.id)?.toString().toLowerCase().includes(postSearch.toLowerCase()))
    : [];

  // --------------------------
  // JSX render
  // --------------------------
  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Gửi báo cáo</h1>
        <p>Hãy mô tả vấn đề hoặc góp ý bạn muốn gửi cho hệ thống</p>
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
                  filteredStations.map(s => (
                    <li key={s.id} onClick={() => {
                      setFormData(prev => ({ ...prev, stationId: s.id, postId: "" }));
                      setStationSearch(s.stationName);
                      setShowStationList(false);
                      setPostSearch("");
                    }}>
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
            <label>Cột sạc</label>
            <input
              type="text"
              placeholder={formData.stationId ? "Tìm cột sạc..." : "Hãy chọn trạm sạc trước"}
              value={postSearch}
              disabled={!formData.stationId}
              onFocus={() => setShowPostList(true)}
              onChange={(e) => {
                setPostSearch(e.target.value);
                setShowPostList(true);
              }}
            />
            {showPostList && postSearch && (
              <ul className="dropdown-list">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(p => (
                    <li key={p.id} onClick={() => {
                      setFormData(prev => ({ ...prev, postId: p.id }));
                      setPostSearch(p.postCode || `Cột #${p.id}`);
                      setShowPostList(false);
                    }}>
                      {p.postCode || `Cột #${p.id}`}
                    </li>
                  ))
                ) : (
                  <li className="no-result">Không tìm thấy cột phù hợp</li>
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
          <button type="submit" className="submit-btn" disabled={loading || !staffLoaded}>
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>

          <button
            type="button"
            className="nav-buttonrollbackRP"
            onClick={() => navigate("/profile-page")}
          >
            <ArrowLeft className="icon" /> Quay lại
          </button>
        </form>

        {message && (
          <div
            className="notify"
            style={{ marginTop: "10px", color: message.includes("✅") ? "green" : "red" }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
