import React, { useEffect, useState } from "react";
import "./OrderChargingST.css";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAuthStatus } from "../../API/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminStationPanel from "./AdminStationPannel";
import ChargingPost from "../ordercharging/ChargingPost"; 
import BookingPopup from "../ordercharging/Booking"; 
import { getAllChargingPost } from "../../API/ChargingPost";
import { getChargingStation, getChargingStationId } from "../../API/Station";

// MAP

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
  const [searchTerm, setSearchTerm] = useState(""); //lọc
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [showPostPopup, setShowPostPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [stationPosts, setStationPosts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Nếu click không nằm trong station-item và cũng không nằm trong các popup
      if (
        !e.target.closest(".station-item") &&
        !e.target.closest(".popup-content") &&
        !e.target.closest(".leaflet-container") &&
        !e.target.closest("button")
      ) {
        setSelectedStation(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // Kiểm tra đăng nhập (chỉ lưu user)
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
        } else setUser(null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Hàm chọn trạm và load trụ
  const handleSelectStation = async (station) => {
    try {
      const stationDetail = await getChargingStationId(station.id);
      setSelectedStation(stationDetail);
      setStationPosts((prev) => ({
        ...prev,
        [station.id]: stationDetail.chargingPosts || [],
      }));
    } catch (err) {
      console.error("Lỗi load trụ sạc:", err);
      setStationPosts((prev) => ({ ...prev, [station.id]: [] }));
    }
  };

  const handleReloadPosts = async (stationId) => {
    try {
      const updatedPosts = await getAllChargingPost(stationId);
      setStationPosts((prev) => ({
        ...prev,
        [stationId]: updatedPosts || [].sort((a, b) => a.id - b.id),
      }));
    } catch (err) {
      console.error("Lỗi reload posts:", err);
    }
  };

  // Lấy danh sách trạm từ API
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await getChargingStation();
      const stationsData = (res.data || [])
        .filter((st) => st.latitude && st.longitude)
        .map((st) => ({ ...st, slots: st.slots ?? 0 }));

      const postsByStation = {};
      for (const st of stationsData) {
        try {
          const detailRes = await getChargingStationId(st.id);
          postsByStation[st.id] = detailRes.chargingPosts || []
            .sort((a, b) => a.id - b.id);
        } catch (err) {
          postsByStation[st.id] = [];
          throw err
        }
      }

      setStations(stationsData.sort((a, b) => a.stationName.localeCompare(b.stationName)));
      setStationPosts(postsByStation);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trạm:", error);
      toast.error(" Lấy danh sách trạm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);
//lọc tên
  const filteredStations = stations.filter((st) => {
    const term = searchTerm.toLowerCase();
    return (
      st.stationName.toLowerCase().includes(term) ||
      st.location.toLowerCase().includes(term) ||
      st.province.toLowerCase().includes(term)
    );
  });

  if (!user)
    return (
      <div className="login-required">
        <h3> Bạn phải đăng nhập để đặt lịch sạc</h3>
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
        {/* 🔍 Thanh tìm kiếm trạm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, địa chỉ hoặc tỉnh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="btn-admin"
            onClick={() => {
              if (selectedStation?.latitude && selectedStation?.longitude) {
                window.open(
                  `https://www.google.com/maps?q=${selectedStation.latitude},${selectedStation.longitude}`,
                  "_blank"
                );
              } else {
                toast.warn(" Vui lòng chọn trạm trước khi mở Google Map!");
              }
            }}
          >
            Google Map
          </button>
        </div>

        <div className="station-list">
          {filteredStations.map((st) => (
            <div
              key={st.id}
              className={`station-item ${selectedStation?.id === st.id ? "active" : ""}`}
              onClick={() => handleSelectStation(st)}
            >
              <h4> {st.stationName}</h4>
              <p> {st.location}, {st.province}</p>

              {/*  Chỉ hiện danh sách trụ khi trạm này được chọn */}
              {selectedStation?.id === st.id && (
                <div className="station-posts">
                  {stationPosts[st.id]?.length > 0 ? (
                    stationPosts[st.id].map((post, index) => (
                      <div key={post.id} className={`post-item status-${post.status}`}>
                        <h5>Trụ {index + 1}</h5>
                        <p><b>Tên trụ:</b> {post.postName}</p>
                        <p><b>Cổng sạc:</b> {post.connectorType}</p>
                        <p><b>Loại xe hổ trợ</b> {post.vehicleTypeSupported}</p>
                        <p><b>Số Cổng Sạc</b> {post.totalConnectors}</p>
                        <p>
                          <b>Trạng thái:</b>{" "}
                          {post.status === "InActive" && <span className="inactive">🟥 Inactive</span>}
                          {post.status === "Available" && <span className="active">🟩 Active</span>}
                          {post.status === "Busy" && <span className="busy">🟨 Busy</span>}
                          {post.status === "Maintained" && <span className="maintained">🟧 Maintained</span>}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="no-post">Chưa có trụ sạc</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button className="btn-book" onClick={() => setShowBookingPopup(true)}> Đặt lịch sạc</button>
          <button className="btn-admin" onClick={() => setShowAdminPopup(true)}> Admin Panel</button>
          <button className="btn-admin" onClick={() => setShowPostPopup(true)}> Quản lý trụ sạc </button>
        </div>
      </div>

      {/* Cột phải: bản đồ */}
      <div className="right-panel">
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={13}
          style={{ height: "100%", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredStations.map((station) => {
            const lat = parseFloat(station.latitude);
            const lng = parseFloat(station.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker
                key={station.id}
                position={[lat, lng]}
                icon={markerIcon}
                eventHandlers={{ click: () => handleSelectStation(station) }}
              >
                <Popup closeButton={true} closeOnClick={false} className="leaflet-popup-station">
                  <div className="popup-station">
                    {/* Ảnh trạm */}
                    <img
                      src={station.imageUrl || "/img/default-station.jpg"}
                      alt={station.stationName}
                      className="popup-image"
                    />

                    {/* Thông tin trạm */}
                    <div className="station-info">
                      <h3>{station.stationName}</h3>
                      <p className="station-address">{station.location}, {station.province}</p>
                      <p>Slots: {station.slots}</p>
                    </div>

                    {/* Danh sách trụ sạc */}
                    <div className="charging-posts">
                      {stationPosts[station.id]?.length > 0 ? (
                        stationPosts[station.id].map((post, index) => (
                          <div key={post.id} className={`charging-post-card status-${post.status}`}>
                            <div className="post-header">
                              <span className="post-name">Trụ {index + 1}: {post.postName}</span>
                              <span className="post-type">{post.connectorType} | {post.vehicleTypeSupported}</span>
                            </div>
                            <div className="post-status">
                              <span className={post.status.toLowerCase()}>{post.status}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>Chưa có trụ sạc</p>
                      )}
                    </div>

                    {/* Nút đặt lịch */}
                    <button className="btn-popup-book" onClick={() => setShowBookingPopup(true)}>
                      Đặt lịch sạc
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {selectedStation && <FlyToStation station={selectedStation} />}
        </MapContainer>
      </div>

      {/*postpopup */}
      {showPostPopup && (
        <div className="popup-overlay">
          <div className="popup-content large-popup">
            <ChargingPost
              stationId={selectedStation?.id}
              onClose={() => setShowPostPopup(false)}
              onUpdated={() => handleReloadPosts(selectedStation?.id)}
              onReloadPosts={() => handleReloadPosts(selectedStation?.id)}
            />
          </div>
        </div>
      )}

      {/* BookingPopup mới */}
      {showBookingPopup && (
        <BookingPopup
          stations={stations}
          stationId={selectedStation?.id}
          onClose={() => setShowBookingPopup(false)}
          onAdded={fetchStations} // reload danh sách booking/trạm sau khi thêm
        />
      )}

      {/* Popup AdminPanel */}
      {showAdminPopup && (
        <div className="popup-overlay">
          <div className="popup-content large-popup">
            <AdminStationPanel
              onClose={() => setShowAdminPopup(false)}
              onUpdated={fetchStations}
              onReloadAdminPannel={() => handleSelectStation(selectedStation?.id)}
            />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default OrderChargingST;
