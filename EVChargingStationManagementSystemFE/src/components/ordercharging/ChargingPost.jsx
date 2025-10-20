import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  addChargingPost,
  updateChargingPost,
  deleteChargingPost,
  updateChargingPostStatus,
} from "../../API/ChargingPost";
import { getChargingStation,getChargingStationId } from "../../API/Station"; 
import "./ChargingPost.css";

const ChargingPost = ({ onClose, onUpdated }) => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [posts, setPosts] = useState([]);
  const [mode, setMode] = useState(""); // add | edit | delete | status
  const [formData, setFormData] = useState({ postName: "", chargerType: "" });
  const [selectedPost, setSelectedPost] = useState(null);

  const statusMap = {
    InActive: 0,
    Active: 1,
    Busy: 2,
    Maintained: 3,
  };

  // Load danh sách trạm
    useEffect(() => {
      const fetchStations = async () => {
        try {
          const res = await getChargingStation();
          console.log(" Danh sách trạm load thành công:", res);
          
          
          const stationList = Array.isArray(res.data) ? res.data : [];
          setStations(stationList);
          
          console.log(" Stations set:", stationList);
        } catch (err) {
          console.error(" Lỗi load danh sách trạm:", err);
          setStations([]);
        }
      };
      fetchStations();
    }, []);


  //  Load trụ theo stationId

    const loadPosts = async (stationId) => {
      if (!stationId) return setPosts([]);
      try {
        console.log("🔄 Đang load trụ theo stationId:", stationId);
        const res = await getChargingStationId(stationId);
        const posts = res?.data?.chargingPosts || [];
        console.log(" Danh sách trụ lấy từ Station API:", posts);
        setPosts(posts);
      } catch (err) {
        console.error(" Lỗi load trụ:", err);
        setPosts([]);
      }
    };


  // Khi chọn trạm
  const handleSelectStation = (id) => {
    const found = stations.find((s) => s.id === id);
    console.log(" Chọn trạm:", found);
    setSelectedStation(found || null);
    setSelectedPost(null);
    loadPosts(id);
  };

  // Chọn trụ để sửa
  const handleSelectPost = (post) => {
    console.log("Chọn trụ để sửa:", post);
    setSelectedPost(post);
    setFormData({ postName: post.postName, chargerType: post.chargerType });
    setMode("edit");
  };

  // Submit thêm/cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStation) return toast.warn(" Vui lòng chọn trạm trước!");

    try {
      if (selectedPost) {
        console.log(" Cập nhật trụ:", selectedPost.id, formData);
        await updateChargingPost(selectedPost.id, {
          ...formData,
          stationId: selectedStation.id,
        });
        toast.success(" Cập nhật trụ thành công!");
      } else {
        console.log("Thêm trụ mới:", formData);
        await addChargingPost({
          ...formData,
          stationId: selectedStation.id,
        });
        toast.success(" Thêm trụ mới thành công!");
      }

      setFormData({ postName: "", chargerType: "" });
      setSelectedPost(null);
      loadPosts(selectedStation.id);
      onUpdated?.();
    } catch (err) {
      console.error(" Lỗi submit:", err);
      toast.error(" Thao tác thất bại!");
    }
  };

  //  Xóa trụ
  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa trụ này?")) {
      try {
        console.log(" Xóa trụ ID:", id);
        await deleteChargingPost(id);
        toast.success("Xóa trụ thành công!");
        loadPosts(selectedStation?.id);
        onUpdated?.();
      } catch (err) {
        console.error(" Lỗi xóa:", err);
      }
    }
  };

  //  Đổi trạng thái
  const handleChangeStatus = async (post, newStatusString) => {
    try {
      const numericStatus = statusMap[newStatusString];
      console.log("⚙️ Đổi trạng thái trụ:", post.id, "→", newStatusString);
      await updateChargingPostStatus(post.id, numericStatus);
      toast.success("⚙️ Cập nhật trạng thái thành công!");
      loadPosts(selectedStation?.id);
      onUpdated?.();
    } catch (err) {
      console.error(" Lỗi đổi trạng thái:", err);
    }
  };

  return (
    <div className="post-popup-overlay">
      <div className="post-popup-box">
        {/* Sidebar */}
        <div className="post-popup-sidebar">
          <button onClick={() => setMode("add")}> Thêm trụ</button>
          <button onClick={() => setMode("edit")}> Cập nhật</button>
          <button onClick={() => setMode("delete")}> Xóa</button>
          <button onClick={() => setMode("status")}> Trạng thái</button>
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>

        {/* Content */}
        <div className="post-popup-content">
          <h3> Quản lý trụ sạc</h3>

          {/* Dropdown chọn trạm */}
          <label>Chọn trạm:</label>
          <select
            value={selectedStation?.id || ""}
            onChange={(e) => handleSelectStation(e.target.value)}
          >
            <option value="">-- Chọn trạm --</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.stationName} ({st.province})
              </option>
            ))}
          </select>

          {selectedStation && (
            <h4 style={{ marginTop: "10px" }}>
               Đang thao tác tại: <b>{selectedStation.stationName}</b> (
              {selectedStation.province})
            </h4>
          )}

          {!selectedStation && (
            <p className="warning-text">
               Vui lòng chọn trạm để hiển thị danh sách trụ!
            </p>
          )}

          {/* Khi có trạm */}
          {selectedStation && (
            <>
              {/* Thêm hoặc sửa */}
              {(mode === "add" || (mode === "edit" && selectedPost)) && (
                <form onSubmit={handleSubmit} className="post-popup-form">
                  <label>
                    Tên trụ:
                    <input
                      type="text"
                      value={formData.postName}
                      onChange={(e) =>
                        setFormData({ ...formData, postName: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Loại sạc:
                    <input
                      type="text"
                      value={formData.chargerType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chargerType: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <button type="submit">
                    {selectedPost ? " Lưu cập nhật" : " Thêm mới"}
                  </button>
                </form>
              )}

              {/* Danh sách update */}
              {mode === "edit" && !selectedPost && (
                <div className="post-popup-list">
                  <h4> Danh sách trụ thuộc trạm này</h4>
                  {posts.length === 0 && <p>Không có trụ nào.</p>}
                  {posts.map((p) => (
                    <div key={p.id} className="post-popup-item">
                      <span>
                        {p.postName} ({p.chargerType})
                      </span>
                      <button onClick={() => handleSelectPost(p)}>
                         Chọn sửa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Xóa */}
              {mode === "delete" && (
                <div className="post-popup-list">
                  <h4> Danh sách trụ để xóa</h4>
                  {posts.length === 0 && <p>Không có trụ nào.</p>}
                  {posts.map((p) => (
                    <div key={p.id} className="post-popup-item">
                      <span>
                        {p.postName} ({p.chargerType})
                      </span>
                      <button onClick={() => handleDelete(p.id)}>Xóa</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Trạng thái */}
              {mode === "status" && (
                <div className="post-popup-list">
                  <h4> Trạng thái các trụ sạc</h4>
                  {posts.length === 0 && <p>Không có trụ nào.</p>}
                  {posts.map((p) => (
                    <div key={p.id} className="post-popup-item">
                      <span>{p.postName}</span>
                      <select
                        value={p.status || "InActive"}
                        onChange={(e) => handleChangeStatus(p, e.target.value)}
                      >
                        <option value="InActive">Inactive</option>
                        <option value="Active">Active</option>
                        <option value="Busy">Busy</option>
                        <option value="Maintained">Maintained</option>
                      </select>
                      <span className="status-label">
                        {p.status || "InActive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChargingPost;
