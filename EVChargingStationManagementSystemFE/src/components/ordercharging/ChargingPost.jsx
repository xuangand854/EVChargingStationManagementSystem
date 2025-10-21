import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  getAllChargingPost,
  addChargingPost,
  updateChargingPost,
  deleteChargingPost,
  updateChargingPostStatus,
} from "../../API/ChargingPost";
import "./ChargingPost.css";

const ChargingPost = ({ stationId, onClose,onUpdated,onReloadPosts }) => {
  const [posts, setPosts] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [formData, setFormData] = useState({
    postName: "",
    chargerType: "",
    stationId: stationId || "",
  });
  const [editingPost, setEditingPost] = useState(null);

const loadPosts = async () => {
  try {
    const res = await getAllChargingPost(stationId);
    console.log("Dữ liệu trả về:", res);
    setPosts(res || []); // ✅ lấy đúng mảng data bên trong
  } catch (err) {
    console.error("Lỗi load post:", err);
  }
};

  useEffect(() => {
    loadPosts();
  }, [stationId]); // ✅ chỉ load 1 lần

  // Submit (Add / Update) 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await updateChargingPost(editingPost.id, formData);
        alert(" Cập nhật thành công!");
        if (onUpdated) onUpdated();
      } else {
        await addChargingPost(formData);
        alert(" Thêm mới thành công!");
        
      }
      setFormData({ postName: "", chargerType: "", stationId: stationId || "" });
      setEditingPost(null);
      loadPosts();
    } catch (err) {
      console.error("Lỗi submit:", err);
      alert("❌ Thao tác thất bại!");
    }
  };

  //  Xóa 
  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa trụ này?")) {
      try {
        await deleteChargingPost(id);
        alert("🗑️ Xóa thành công!");
        toast.success("Cập nhật thành công!");
        if (onUpdated) onUpdated();
        loadPosts();
      } catch (err) {
        console.error("Lỗi xóa:", err);
      }
    }
  };

  // Chọn để sửa
  const handleEditClick = (post) => {
    setEditingPost(post);
    setFormData({
      postName: post.postName,
      chargerType: post.chargerType,
      stationId: post.stationId,
    });
    setSelectedAction("update");
  };

  //  Đổi trạng thái 
const handleChangeStatus = async (post, newStatusString) => {
  try {
    const numericStatus = statusMap[newStatusString]; // map string → number
    await updateChargingPostStatus(post.id, numericStatus);
    alert("⚙️ Đổi trạng thái thành công!");
    toast.success("Cập nhật trạng thái thành công!");
    console.log("Gửi update:", { id: post.id, numericStatus });


    // Cập nhật FE ngay
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, status: newStatusString} : p
      )
    );
    onReloadPosts?.();
    
    
  } catch (err) {
    console.error("Lỗi đổi trạng thái:", err);
    
  }
};


const statusMap = {
  InActive: 0,
  Active: 1,
  Busy: 2,
  Maintained: 3,
  
};
  return (
    <div className="post-popup-overlay">
      <div className="post-popup-box">
        <div className="post-popup-sidebar">
          <button onClick={() => setSelectedAction("add")}> Thêm trụ</button>
          <button onClick={() => setSelectedAction("update")}> Cập nhật</button>
          <button onClick={() => setSelectedAction("delete")}>Xóa</button>
          <button onClick={() => setSelectedAction("status")}> Trạng thái</button>
          <button className="close-btn" onClick={onClose}> Đóng</button>
          
        </div>

        <div className="post-popup-content">
          {!selectedAction && <p>👉 Hãy chọn thao tác bên trái.</p>}

          {/* ADD / UPDATE FORM  */}
          {(selectedAction === "add" || (selectedAction === "update" && editingPost)) && (
            <form onSubmit={handleSubmit} className="post-popup-form">
              <label>
                ID Trạm:
                <input
                  type="text"
                  placeholder="Nhập Station ID"
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  disabled={selectedAction === "update"} 
                />
              </label>

              <label>
                Tên trụ:
                <input
                  type="text"
                  value={formData.postName}
                  onChange={(e) => setFormData({ ...formData, postName: e.target.value })}
                  required
                />
              </label>

              <label>
                Loại sạc:
                <input
                  type="text"
                  value={formData.chargerType}
                  onChange={(e) => setFormData({ ...formData, chargerType: e.target.value })}
                  required
                />
              </label>

              <button type="submit">
                {editingPost ? "💾 Lưu cập nhật" : "➕ Thêm mới"}
              </button>
            </form>
          )}

          {/*  UPDATE LIST  */}
          {selectedAction === "update" && (
            <div className="post-popup-list">
              <h4>Danh sách trụ sạc</h4>
              {posts.map((p) => (
                <div key={p.id} className="post-popup-item">
                  <span>{p.postName} ({p.chargerType})</span>
                  <button onClick={() => handleEditClick(p)}>✏️ Chọn sửa</button>
                </div>
              ))}
            </div>
          )}

          {/*  DELETE LIST  */}
          {selectedAction === "delete" && (
            <div className="post-popup-list">
              <h4>Danh sách trụ đã thêm</h4>
              {posts.map((p) => (
                <div key={p.id} className="post-popup-item">
                  <span>{p.postName} ({p.chargerType})</span>
                  <button onClick={() => handleDelete(p.id)}>🗑️ Xóa</button>
                </div>
              ))}
            </div>
          )}

          {/*  STATUS LIST  */}
            {selectedAction === "status" && (
              <div className="post-popup-list">
                <h4>Trạng thái các trụ sạc</h4>
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


        </div>
      </div>
    </div>
  );
};

export default ChargingPost;
