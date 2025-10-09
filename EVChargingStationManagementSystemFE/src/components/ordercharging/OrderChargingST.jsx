import React, { useEffect, useState } from "react";
import "./OrderChargingST.css";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAuthStatus } from "../../API/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getChargingStation,
  addChargingStation,
  updateChargingStation,
  deleteChargingStation,
  updateChargingStationStatus,
} from "../../API/Station";

// Icon marker
const markerIcon = new L.Icon({
  iconUrl: "/img/9138039.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Fly to selected station
const FlyToStation = ({ station }) => {
  const map = useMap();
  useEffect(() => {
    if (station?.latitude && station?.longitude) {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15, { duration: 1.5 });
      }
    }
  }, [station, map]);
  return null;
};

const OrderChargingST = () => {
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    carModel: "",
    vehicleType: "",
    chargingPower: "",
    chargingHint: "",
  });

  const [adminForm, setAdminForm] = useState({
    id: null,
    stationName: "",
    location: "",
    province: "",
    latitude: "",
    longitude: "",
    operatorId: "",
  });
  

  // Kiểm tra đăng nhập
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authStatus = await getAuthStatus();
        if (authStatus.isAuthenticated && authStatus.user) {
          const userData = {
            fullName: authStatus.user.name || "",
            phone: authStatus.user.phone || "",
            email: authStatus.user.email || "",
            carModel: authStatus.user.car || "",
          };
          setUser(userData);
          setFormData((prev) => ({
            ...prev,
            fullName: userData.fullName,
            phone: userData.phone,
            email: userData.email,
            carModel: userData.carModel,
          }));
        } else setUser(null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Auto-fill xe khi mở popup
  useEffect(() => {
    if (showBookingPopup) {
      const savedVehicleId = localStorage.getItem("selectedVehicleId");
      const allVehicles = JSON.parse(localStorage.getItem("vehicleList") || "[]");
      if (savedVehicleId && allVehicles.length > 0) {
        const chosen = allVehicles.find(
          (v) => v.id === savedVehicleId || v.id === parseInt(savedVehicleId)
        );
        if (chosen) {
          setFormData((prev) => ({
            ...prev,
            carModel: chosen.modelName || chosen.modelname || "",
            vehicleType: chosen.vehicleType === 1 ? "Xe Hơi" : "Xe Máy",
          }));
        }
      }
    }
  }, [showBookingPopup]);

  // Lấy danh sách trạm từ API
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await getChargingStation();
      const stationsData = (res.data || [])
        .map((st) => ({
          ...st,
          slots: st.slots ?? 0,
        }))
        .filter((st) => st.latitude && st.longitude);
      setStations(stationsData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trạm:", error);
      toast.error("❌ Lấy danh sách trạm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Xử lý đặt lịch
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warn("⚠️ Bạn phải đăng nhập để đặt lịch!");
      return;
    }
    const bookingData = {
      ...formData,
      station: selectedStation?.stationName,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("lastBooking", JSON.stringify(bookingData));
    toast.success("✅ Đặt lịch thành công! Đã lưu thông tin.");
    setShowBookingPopup(false);
  };

  // Admin: thêm trạm
     const handleAddStation = async (e) => {
        e.preventDefault();

        const payload = {
          stationName: adminForm.stationName.trim(),
          location: adminForm.location.trim(),
          province: adminForm.province.trim(),
          latitude: adminForm.latitude.trim(),    // gửi string
          longitude: adminForm.longitude.trim(),  // gửi string
          operatorId: adminForm.operatorId.trim() // gửi string UUID
        };

        console.log("=== DEBUG Payload ===");
        console.log(payload);

        // Validate cơ bản: tất cả phải có giá trị
        if (
          !payload.stationName ||
          !payload.location ||
          !payload.province ||
          !payload.latitude ||
          !payload.longitude ||
          !payload.operatorId
        ) {
          toast.error("❌ Vui lòng điền đầy đủ thông tin hợp lệ!");
          return;
        }

        try {
          const res = await addChargingStation(
            payload.stationName,
            payload.location,
            payload.province,
            payload.latitude,
            payload.longitude,
            payload.operatorId
          );
          console.log("API response:", res);
          toast.success("✅ Thêm trạm thành công!");
          fetchStations();
          setShowAdminPopup(false);
          setAdminForm({
            id: null,
            stationName: "",
            location: "",
            province: "",
            latitude: "",
            longitude: "",
            operatorId: "",
          });
        } catch (err) {
          console.error("Add station error full:", err.response || err);
          toast.error("❌ Thêm trạm thất bại! Kiểm tra console log.");
        }
      };



  

  // Admin: update trạm
    const handleUpdateStation = async (e) => {
      e.preventDefault();
      if (!adminForm.id) {
        toast.warn("⚠️ Không có trạm để cập nhật!");
        return;
      }

      try {
        const payload = {
          stationName: adminForm.stationName || "",
          location: adminForm.location || "",
          province: adminForm.province || "",
          latitude: adminForm.latitude || "",
          longitude: adminForm.longitude || "",
          operatorId: adminForm.operatorId || "",
        };

        // Gọi API với stationId là query param
        await updateChargingStation(adminForm.id, payload);

        toast.success("✅ Cập nhật trạm thành công!");
        fetchStations();
        setShowAdminPopup(false);
      } catch (err) {
        console.error("Update station error:", err);
        toast.error("❌ Cập nhật trạm thất bại!");
      }
    };


    const handleDeleteStation = async (stationId) => {
      const idToDelete = stationId || adminForm.id;
      if (!idToDelete) {
        toast.warn("⚠️ Không có trạm để xóa!");
        return;
      }
      try {
        await deleteChargingStation(idToDelete);
        toast.success("✅ Xóa trạm thành công!");
        fetchStations();
        setShowAdminPopup(false);
      } catch (err) {
        console.error("Delete station error:", err);
        toast.error("❌ Xóa trạm thất bại!");
      }
    };

  const handleUpdateStatus = async (station) => {
    try {
      await updateChargingStationStatus(station.id, station.slots > 0 ? 0 : 5);
      toast.success("✅ Cập nhật trạng thái thành công!");
      fetchStations();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi cập nhật trạng thái!");
    }
  };

  if (!user)
    return (
      <div className="login-required">
        <h3>⚠️ Bạn phải đăng nhập để đặt lịch sạc</h3>
        <p>Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.</p>
        <button className="btn-login" onClick={() => navigate("/login")}>
          Đăng nhập ngay
        </button>
      </div>
    );

  if (loading) return <p>Đang tải dữ liệu trạm sạc...</p>;

  return (
    <div className="order-container">
      {/* Cột trái */}
      <div className="left-panel">
        <h2>Trạng thái các trạm sạc</h2>
        <div className="station-list">
          {stations.map((st) => (
            <div
              key={st.id}
              className={`station-item ${selectedStation?.id === st.id ? "active" : ""}`}
              onClick={() => setSelectedStation(st)}
            >
              <h4>🏙️ {st.stationName}</h4>
              <p>📍 {st.location}, {st.province}</p>
              <p>Slots: {st.slots}</p>
            </div>
          ))}
        </div>
        <div className="action-buttons">
          <button className="btn-book" onClick={() => setShowBookingPopup(true)}>🔋 Đặt lịch sạc</button>
          <button className="btn-admin" onClick={() => setShowAdminPopup(true)}>🛠️ Admin Panel</button>
        </div>

        {selectedStation && (
          <div className="station-actions">
            <button onClick={() => {
              setAdminForm({
                id: selectedStation.id || null,
                stationName: selectedStation.stationName || "",
                location: selectedStation.location || "",
                province: selectedStation.province || "",
                latitude: selectedStation.latitude?.toString() || "",
                longitude: selectedStation.longitude?.toString() || "",
                operatorId: selectedStation.operatorId?.toString() || "",
              });
              setShowAdminPopup(true);
            }}>✏️ Update trạm</button>
            <button onClick={() => handleDeleteStation(selectedStation.id)}>🗑️ Delete trạm</button>

            <button onClick={() => handleUpdateStatus(selectedStation)}>🔄 Toggle slots</button>
          </div>
        )}
      </div>

      {/* Cột phải: bản đồ */}
      <div className="right-panel">
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={13}
          style={{ height: "600px", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((station) => {
            const lat = parseFloat(station.latitude);
            const lng = parseFloat(station.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker
                key={station.id}
                position={[lat, lng]}
                icon={markerIcon}
                eventHandlers={{ click: () => setSelectedStation(station) }}
              >
                <Popup>
                  <div className="popup-station">
                    <b>{station.stationName}</b>
                    <p>📍 {station.location}, {station.province}</p>
                    <p>Slots: {station.slots}</p>
                    <button className="btn-popup-book" onClick={() => setShowBookingPopup(true)}>
                      🔋 Đặt lịch sạc
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {selectedStation && <FlyToStation station={selectedStation} />}
        </MapContainer>
      </div>

      
      {/* Popup đặt lịch */}
      {/* Popup đặt lịch */}
      {showBookingPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Đặt lịch sạc</h3>
            <form className="booking-form" onSubmit={handleSubmit}>
              <label>
                Họ và tên:
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </label>
              <label>
                Số điện thoại:
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </label>
              <label>
                Xe:
                <input
                  type="text"
                  value={formData.carModel}
                  onChange={(e) =>
                    setFormData({ ...formData, carModel: e.target.value })
                  }
                />
              </label>
              <label>
                Loại xe:
                <input
                  type="text"
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                />
              </label>
              <label>
                Công suất sạc (kW):
                <input
                  type="number"
                  value={formData.chargingPower}
                  onChange={(e) =>
                    setFormData({ ...formData, chargingPower: e.target.value })
                  }
                />
              </label>

              <div className="booking-buttons">
                <button type="submit">Xác nhận đặt</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingPopup(false);
                    // reset formData nếu muốn
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      
      {/* Popup AdminPanel */}
      {showAdminPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{adminForm.id ? `Cập nhật / Xóa trạm: ${adminForm.stationName}` : "Thêm trạm mới"}</h3>
            <form
              onSubmit={adminForm.id ? handleUpdateStation : handleAddStation}
            >
              <label>
                Tên trạm:
                <input
                  type="text"
                  value={adminForm.stationName}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, stationName: e.target.value })
                  }
                />
              </label>
              <label>
                Địa chỉ:
                <input
                  type="text"
                  value={adminForm.location}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, location: e.target.value })
                  }
                />
              </label>
              <label>
                Tỉnh/Thành phố:
                <input
                  type="text"
                  value={adminForm.province}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, province: e.target.value })
                  }
                />
              </label>
              <label>
                Latitude:
                <input
                  type="text"
                  value={adminForm.latitude}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, latitude: e.target.value })
                  }
                />
              </label>
              <label>
                Longitude:
                <input
                  type="text"
                  value={adminForm.longitude}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, longitude: e.target.value })
                  }
                />
              </label>
              <label>
                OperatorId:
                <input
                  type="text"
                  value={adminForm.operatorId}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, operatorId: e.target.value })
                  }
                />
              </label>

              <div className="admin-buttons">
                <button type="submit">
                  {adminForm.id ? "Lưu cập nhật" : "Thêm trạm"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPopup(false);
                    // Reset form khi đóng popup
                    setAdminForm({
                      id: null,
                      stationName: "",
                      location: "",
                      province: "",
                      latitude: "",
                      longitude: "",
                      operatorId: "",
                    });
                  }}
                >
                  Hủy
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      <ToastContainer />
    </div>
  );
};

export default OrderChargingST;
