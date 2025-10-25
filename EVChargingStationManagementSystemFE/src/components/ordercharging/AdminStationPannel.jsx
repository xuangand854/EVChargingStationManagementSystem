import React, { useEffect, useState } from "react";
import {
  getChargingStation,
  addChargingStation,
  updateChargingStation,
  deleteChargingStation,
  updateChargingStationStatus,
} from "../../API/Station";
import { toast } from "react-toastify";
import "./ChargingPost.css"; 
import onReloadAdminPanel from "./OrderChargingST";

const AdminStationPanel = ({ onClose, onUpdated }) => {
  const [stations, setStations] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [editingStation, setEditingStation] = useState(null);
  
  const [formData, setFormData] = useState({
    stationName: "",
    location: "",
    province: "",
    latitude: "",
    longitude: "",
    // operatorId: "",
  });

  const loadStations = async () => {
    try {
      const res = await getChargingStation();
      setStations(res.data || []);
    } catch (err) {
      console.error("Lỗi load trạm:", err);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStation) {
        await updateChargingStation(editingStation.id, formData);
        toast.success("Cập nhật trạm thành công!");
      } else {
        await addChargingStation(
          formData.stationName,
          formData.location,
          formData.province,
          formData.latitude,
          formData.longitude,
          formData.operatorId
        );
        toast.success("Thêm trạm mới thành công!");
      }
      setEditingStation(null);
      setFormData({
        stationName: "",
        location: "",
        province: "",
        latitude: "",
        longitude: "",
        // operatorId: "",
      });
      loadStations();
      onUpdated?.();
      onReloadAdminPanel?.();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thêm/cập nhật trạm!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa trạm này?")) {
      try {
        await deleteChargingStation(id);
        toast.success("Xóa trạm thành công!");
        loadStations();
        onUpdated?.();
        onReloadAdminPanel?.();
      } catch (err) {
        console.error("Lỗi xóa:", err);
      }
    }
  };

  const handleEditClick = (st) => {
    setEditingStation(st);
    setFormData({
      stationName: st.stationName,
      location: st.location,
      province: st.province,
      latitude: st.latitude,
      longitude: st.longitude,
      // operatorId: st.operatorId,
    });
    setSelectedAction("update");
  };

  const handleChangeStatus = async (st, newStatus) => {
    try {
      await updateChargingStationStatus(st.id, newStatus);
      toast.success(" Cập nhật trạng thái thành công!");
      loadStations();
      onUpdated?.();
      onReloadAdminPanel?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-popup-overlay">
      <div className="post-popup-box">
        <div className="post-popup-sidebar">
          <button onClick={() => setSelectedAction("add")}>Thêm trạm</button>
          <button onClick={() => setSelectedAction("update")}>Cập nhật</button>
          <button onClick={() => setSelectedAction("delete")}>Xóa</button>
          <button onClick={() => setSelectedAction("status")}>Trạng thái</button>
          <button className="close-btn" onClick={onClose}>Đóng</button>
        </div>

        <div className="post-popup-content">
          {!selectedAction && <p> Hãy chọn thao tác bên trái.</p>}

          {(selectedAction === "add" || (selectedAction === "update" && editingStation)) && (
            <form onSubmit={handleSubmit} className="post-popup-form">
              <label>Tên trạm:<input type="text" value={formData.stationName} onChange={(e) => setFormData({ ...formData, stationName: e.target.value })} required /></label>
              <label>Địa chỉ:<input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></label>
              <label>Tỉnh/Thành:<input type="text" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} required /></label>
              <label>Latitude:<input type="text" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} required /></label>
              <label>Longitude:<input type="text" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} required /></label>
              {/* <label>Operator ID:<input type="text" value={formData.operatorId} onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })} /></label> */}

              <button type="submit">{editingStation ? "Lưu cập nhật" : "Thêm trạm"}</button>
            </form>
          )}

          {selectedAction === "update" && (
            <div className="post-popup-list">
              <h4>Danh sách trạm</h4>
              {stations.map((st) => (
                <div key={st.id} className="post-popup-item">
                  <span>{st.stationName} ({st.location})</span>
                  <button onClick={() => handleEditClick(st)}> Sửa</button>
                </div>
              ))}
            </div>
          )}

          {selectedAction === "delete" && (
            <div className="post-popup-list">
              <h4>Danh sách trạm</h4>
              {stations.map((st) => (
                <div key={st.id} className="post-popup-item">
                  <span>{st.stationName} ({st.location})</span>
                  <button onClick={() => handleDelete(st.id)}>🗑️ Xóa</button>
                </div>
              ))}
            </div>
          )}

          {selectedAction === "status" && (
            <div className="post-popup-list">
              <h4>Trạng thái trạm</h4>
              {stations.map((st) => (
                <div key={st.id} className="post-popup-item">
                  <span>{st.stationName}</span>
                  <select
                    onChange={(e) => handleChangeStatus(st, e.target.value)}
                    defaultValue={st.status || "Inactive"}
                  >
                    <option value="Inactive">Inactive</option>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStationPanel;
