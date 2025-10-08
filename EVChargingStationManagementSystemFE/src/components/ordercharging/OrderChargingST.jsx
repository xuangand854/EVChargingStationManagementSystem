import React, { useEffect, useState } from "react";
import "./OrderChargingST.css";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAuthStatus } from "../../API/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icon marker
const markerIcon = new L.Icon({
  iconUrl: "/img/9138039.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Bay đến trạm đã chọn
const FlyToStation = ({ station }) => {
  const map = useMap();
  useEffect(() => {
    if (station?.latitude && station?.longitude) {
      map.flyTo([station.latitude, station.longitude], 15, { duration: 1.5 });
    }
  }, [station, map]);
  return null;
};

const OrderChargingST = () => {
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const navigate = useNavigate();
  

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    carModel: "",
    km: "",
    licensePlate: "",
    service: [],
    province: "",
    district: "",
    locationType: "station",
    date: "",
    time: "",
    note: "",
    chargingPower: "",
    chargingHint: "",
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

  
  // Khi mở popup đặt trạm -> tự fill xe đã chọn
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

  //  Lấy danh sách trạm (mock)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const mockData = [
          {
            id: 1,
            name: "Trạm sạc VinFast Quận 1",
            address: "123 Nguyễn Huệ, Quận 1, HCM",
            slots: 5,
            type: "DC Fast",
            latitude: 10.7769,
            longitude: 106.7009,
            image: "/img/station.png",
          },
          {
            id: 2,
            name: "Trạm sạc Landmark 81",
            address: "720A Điện Biên Phủ, Bình Thạnh, HCM",
            slots: 3,
            type: "AC Normal",
            latitude: 10.7945,
            longitude: 106.7218,
            image: "/img/station.png",
          },
          {
            id: 3,
            name: "Trạm sạc AEON Tân Phú",
            address: "30 Bờ Bao Tân Thắng, Tân Phú, HCM",
            slots: 0,
            type: "AC Normal",
            latitude: 10.8012,
            longitude: 106.6265,
            image: "/img/station.png",
          },
        ];
        setStations(mockData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách trạm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  //  Xử lý đặt lịch
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warn("⚠️ Bạn phải đăng nhập để đặt lịch!");
      return;
    }

    const bookingData = {
      ...formData,
      station: selectedStation?.name,
      date: new Date().toLocaleString(),
    };

    localStorage.setItem("lastBooking", JSON.stringify(bookingData));
    toast.success("✅ Đặt lịch thành công! Đã lưu thông tin.", {
      position: "top-right",
      autoClose: 2500,
      theme: "colored",
    });
    setShowBookingPopup(false);
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
      {/* Cột trái: Danh sách trạm */}
      <div className="left-panel">
        <h2>Trạng thái các trạm sạc</h2>
        <div className="station-list">
          {stations.map((st) => (
            <div
              key={st.id}
              className={`station-item ${
                selectedStation?.id === st.id ? "active" : ""
              }`}
              onClick={() => setSelectedStation(st)}
            >
              <h4>🏙️ {st.name}</h4>
              <p>📍 {st.address}</p>
              <p>🔌 {st.type}</p>
              <p>
                {st.slots > 0 ? (
                  <span className="available">✅ Còn {st.slots} cổng</span>
                ) : (
                  <span className="unavailable">❌ Hết chỗ</span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Nút chức năng */}
        <div className="action-buttons">
          <button
            className="btn-book"
            onClick={() => {
              if (!user) {
                toast.warn("⚠️ Bạn phải đăng nhập để đặt lịch!");
                return;
              }
              setShowBookingPopup(true);
            }}
          >
            🔋 Đặt lịch sạc
          </button>
          <button className="btn-admin">🛠️ Admin Panel</button>
        </div>
      </div>

      {/* Cột phải: Bản đồ */}
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

          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => setSelectedStation(station),
              }}
            >
              <Popup>
                <div className="popup-station">
                  <img
                    src={station.image}
                    alt={station.name}
                    className="popup-image"
                  />
                  <b>{station.name}</b>
                  <p>📍 {station.address}</p>
                  <p>⚡ Loại: {station.type}</p>
                  <p>
                    {station.slots > 0 ? (
                      <span className="available">✅ Còn {station.slots} cổng</span>
                    ) : (
                      <span className="unavailable">❌ Hết chỗ</span>
                    )}
                  </p>
                  <button
                    className="btn-popup-book"
                    onClick={() => {
                      if (!user) {
                        toast.warn("⚠️ Bạn phải đăng nhập để đặt lịch!");
                        return;
                      }
                      setShowBookingPopup(true);
                    }}
                  >
                    🔋 Đặt lịch sạc
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedStation && <FlyToStation station={selectedStation} />}
        </MapContainer>
      </div>

      {/* Popup đặt lịch */}
      {showBookingPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Đặt lịch sạc</h3>
            <form className="booking-form" onSubmit={handleSubmit}>
              <label>Tên trạm:</label>
              <input type="text" value={selectedStation?.name || ""} readOnly />

              <label>Họ tên:</label>
              <input type="text" value={formData.fullName} readOnly />

              <label>Email:</label>
              <input type="email" value={formData.email} readOnly />

              <label>Loại xe</label>
              <input
                list="carTypes"
                name="carModel"
                value={formData.vehicleType}
                readOnly
              />
              <datalist id="carTypes">
                <option value="Xe máy điện" />
                <option value="Ô tô điện" />
                <option value="Xe bus điện" />
              </datalist>

              <label>Tên xe:</label>
              <input type="text" value={formData.carModel} readOnly />

              <label>Công suất sạc (kW):</label>
              <input
                type="number"
                value={formData.chargingPower || ""}
                onChange={(e) =>
                  setFormData({ ...formData, chargingPower: e.target.value })
                }
              />

              <label>Gợi ý sạc:</label>
              <input
                type="text"
                value={formData.chargingHint || ""}
                onChange={(e) =>
                  setFormData({ ...formData, chargingHint: e.target.value })
                }
              />

              <label>Thời gian bắt đầu:</label>
              <input type="datetime-local" required />

              <label>Loại sạc</label>
              <input
                list="chargerTypes"
                name="chargerType"
                placeholder="Chọn loại sạc..."
              />
              <datalist id="chargerTypes">
                <option value="AC Normal" />
                <option value="DC Fast" />
                <option value="Super Fast" />
              </datalist>

              <button type="submit">Xác nhận đặt</button>
              <button type="button" onClick={() => setShowBookingPopup(false)}>
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Thông báo Toast */}
      <ToastContainer />
    </div>
  );
};

export default OrderChargingST;
