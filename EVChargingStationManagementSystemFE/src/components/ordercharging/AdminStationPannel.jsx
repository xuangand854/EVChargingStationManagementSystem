import React, { useEffect, useState } from "react";
import {
  getChargingStation,
  addChargingStation,
  updateChargingStation,
  deleteChargingStation,
  updateChargingStationStatus,
} from "../../API/Station";
import {getMyAccountStaff} from "../../API/Staff"
import { toast } from "react-toastify";
import "./ChargingPost.css"; 
import onReloadAdminPanel from "./OrderChargingST";

const AdminStationPanel = ({ onClose, onUpdated }) => {
  const [stations, setStations] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [editingStation, setEditingStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [staff,setstaff] = useState([]);
  const [searchTermStaff,setSearchTermStaff] = useState ();
  const [showDropdownStaff, setShowDropdownStaff] = useState(false);


  
  const [formData, setFormData] = useState({
    stationName: "",
    location: "",
    province: "",
    latitude: "",
    longitude: "",
    status: "",
    operatorId: "",
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
  const fetchStaff = async () => {
    try {
      const res = await getMyAccountStaff();
      const allStaff = res.data || [];

      // Chỉ lấy những nhân viên Active
      const activeStaff = allStaff.filter((s) => s.status === "Active");
      setstaff(activeStaff);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhân viên:", err);
      toast.error("Không thể tải danh sách nhân viên!");
    }
  };
  fetchStaff();
}, []);


  useEffect(() => {
    loadStations();
  }, []);

  const normalize = (str = "") =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const escapeRegex = (s) => {
  if (typeof s !== "string") return "";
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const filteredStations = searchTerm
    ? stations.filter(
        (st) =>
          normalize(st.stationName).includes(normalize(searchTerm)) ||
          normalize(st.location).includes(normalize(searchTerm)) ||
          normalize(st.province).includes(normalize(searchTerm))
      )
    : stations;
  const filteredStaff = searchTermStaff
    ? staff.filter(
        (s) =>
          normalize(s.name).includes(normalize(searchTerm)) 
          
      )
    : staff;
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.operatorId || formData.operatorId.trim() === "") {
      toast.error("Vui lòng chọn hoặc nhập mã nhân viên Operator ID!");
      return;
    }
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
        operatorId: "",
      });
      loadStations();
      onUpdated?.();
      onReloadAdminPanel?.();
    } catch (err) {
      console.error("Error addChargingStation:", err);

      // Lấy thông điệp lỗi từ server (nếu có)
      const message = err.response?.data?.message || err.message || "";

      // Kiểm tra lỗi 500 và nội dung
      if (err.response?.status === 500) {
        if (message.includes("FOREIGN KEY") || message.includes("operator")) {
          toast.error("Operator ID không tồn tại trong hệ thống!");
        } else {
          toast.error("Máy chủ gặp lỗi khi lưu dữ liệu. Vui lòng kiểm tra lại thông tin!");
        }
      } else if (err.response?.status === 400) {
        toast.error("Dữ liệu gửi lên không hợp lệ!");
      } else {
        toast.error("Không thể thêm trạm. Vui lòng thử lại sau!");
      }
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
      operatorId: st.operatorId,
    });
    setSelectedAction("update");
  };

  const handleChangeStatus = async (st,status) => {
    try {
      await updateChargingStationStatus(st.id, status);
      toast.success(" Cập nhật trạng thái thành công!");
      loadStations();
      onUpdated?.();
      onReloadAdminPanel?.();
    } catch (err) {
         console.error("Lỗi submit:", err);
        // Nếu BE có phản hồi lỗi rõ ràng
        const beMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Đã xảy ra lỗi không xác định!";

        toast.error(beMessage);
      
    
      
    }
  };

  return (
    <div className="post-popup-overlay">
      <div className="post-popup-box">
        <div className="post-popup-sidebar">
          <button onClick={() => setSelectedAction("add")}>Thêm trạm</button>
          <button onClick={() => setSelectedAction("status")}>Trạng thái</button>
          <button onClick={() => setSelectedAction("update")}>Cập nhật</button>
          <button onClick={() => setSelectedAction("delete")}>Xóa</button>
          
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
              <label>Chọn nhân viên Operator:</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  placeholder="Nhập tên nhân viên"
                  value={searchTermStaff || ""}
                  onFocus={() => setShowDropdownStaff(true)}
                  onChange={(e) => {
                    setSearchTermStaff(e.target.value);
                    setShowDropdownStaff(true);
                  }}
                  className="autocomplete-input"
                />

                {showDropdownStaff && filteredStaff.length > 0 && (
                  <div className="autocomplete-list">
                    {filteredStaff.map((s) => {
                      const regex = new RegExp(`(${escapeRegex(searchTermStaff)})`, "i");
                      const parts = s.name.split(regex);
                      return (
                        <div
                          key={s.id}
                          className="autocomplete-item"
                          onClick={() => {
                            setSearchTermStaff(s.name);
                            setFormData({ ...formData, operatorId: s.id });
                            setShowDropdownStaff(false);
                          }}
                        >
                          {parts.map((part, i) =>
                            regex.test(part) ? (
                              <span key={i} className="highlight">{part}</span>
                            ) : (
                              part
                            )
                          )}{" "}
                          ({s.status})
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
                <button type="submit">{editingStation ? "Lưu cập nhật" : "Thêm trạm"}</button>
            </form>
          )}

          

          {selectedAction === "update" && (
            <div className="post-popup-list">
              <h4>Danh sách trạm</h4>

              <input
                type="text"
                placeholder="Tìm kiếm theo tên, địa chỉ, tỉnh..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  
                }}
                className="search-input"
              />

              <div className="dropdown-list">
                {filteredStations.map((st) => (
                  <div key={st.id} className="post-popup-item">
                    <span>{st.stationName} ({st.location})</span>
                    <button onClick={() => handleEditClick(st)}> Sửa</button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {selectedAction === "delete" && (
            <div className="post-popup-list">
              <h4>Danh sách trạm</h4>

              <input
                type="text"
                placeholder="Tìm kiếm theo tên, địa chỉ, tỉnh..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  
                }}
                className="search-input"
              />

              <div className="dropdown-list">
                {filteredStations.map((st) => (
                  <div key={st.id} className="post-popup-item">
                    <span>{st.stationName} ({st.location})</span>
                    <button onClick={() => handleDelete(st.id)}> Xóa</button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {selectedAction === "status" && (
            <div className="post-popup-list">
              <h4>Trạng thái trạm</h4>

              <input
                type="text"
                placeholder="Tìm kiếm theo tên, địa chỉ, tỉnh..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  
                }}
                className="search-input"
              />

              <div className="dropdown-list">
                {filteredStations.map((st) => (
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminStationPanel;
