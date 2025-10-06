import React, { useEffect, useState } from "react";
import "./OrderChargingST.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🧭 Icon marker
const markerIcon = new L.Icon({
  iconUrl: "/img/9138039.png", // icon trạm sạc
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// 📍 Component giúp map bay đến trạm được chọn
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

  // 🧩 thêm state popup đặt lịch
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  // TODO: Gọi API danh sách trạm sạc sau này
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
            onClick={() => setShowBookingPopup(true)}
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

          {/* ⚡ Popup có ảnh và thông tin */}
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
                    onClick={() => setShowBookingPopup(true)}
                  >
                    🔋 Đặt lịch sạc
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 👇 Khi chọn trạm thì tự động bay đến đó */}
          {selectedStation && <FlyToStation station={selectedStation} />}
        </MapContainer>
      </div>

      {/* Popup đặt lịch */}
      {showBookingPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Đặt lịch sạc</h3>
            <form className="booking-form">
              <label>Tên trạm:</label>
              <input type="text" value={selectedStation?.name || ""} readOnly />

              <label>Thời gian bắt đầu:</label>
              <input type="datetime-local" />

              <label>Loại xe</label>
              <input list="carTypes" name="carType" placeholder="Chọn loại xe..." />
              <datalist id="carTypes">
                <option value="Xe máy điện" />
                <option value="Ô tô điện" />
                <option value="Xe bus điện" />
              </datalist>

              <label>Loại sạc</label>
              <input list="chargerTypes" name="chargerType" placeholder="Chọn loại sạc..." />
              <datalist id="chargerTypes">
                <option value="AC Normal" />
                <option value="DC Fast" />
                <option value="Super Fast" />
              </datalist>


              <button type="submit">Xác nhận đặt</button>
              <button
                type="button"
                onClick={() => setShowBookingPopup(false)}
              >
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderChargingST;
