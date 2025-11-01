import React, { useEffect, useState } from "react";
import "./OrderChargingST.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAuthStatus } from "../../API/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingPopup from "../ordercharging/Booking";
import { getChargingStation, getChargingStationId } from "../../API/Station";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [stationPosts, setStationPosts] = useState({});
 

  // 🔹 Tự động lấy vị trí hiện tại
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Không lấy được vị trí:", err);
        toast.warn("Không thể lấy vị trí hiện tại!");
      }
    );
  }, []);

  // 🔹 Tính khoảng cách giữa 2 điểm (Haversine)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 🔹 Xác định danh sách trạm hiển thị
  let displayedStations = [...stations];

  if (filterMode === "nearest" && userLocation) {
    displayedStations = [...stations]
      .map((st) => ({
        ...st,
        distance: getDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(st.latitude),
          parseFloat(st.longitude)
        ),
      }))
      .filter((st) => st.distance <= 5) // chỉ hiện trạm trong bán kính 5km
      .sort((a, b) => a.distance - b.distance);

    if (displayedStations.length === 0) {
      toast.info("Không có trạm nào trong bán kính 5km, hiển thị tất cả trạm.");
      displayedStations = [...stations];
    }
  }

  // 🔹 Đóng popup khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // 🔹 Lấy thông tin đăng nhập
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
            role:
              authStatus.user.role ||
              authStatus.user.user_role ||
              authStatus.user.user_role_raw ||
              authStatus.role ||
              "",
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

  // 🔹 Chọn trạm & load trụ
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

  // 🔹 Lấy danh sách trạm
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
          postsByStation[st.id] =
            detailRes.chargingPosts?.sort((a, b) => a.id - b.id) || [];
        } catch {
          postsByStation[st.id] = [];
        }
      }

      setStations(
        stationsData.sort((a, b) => a.stationName.localeCompare(b.stationName))
      );
      setStationPosts(postsByStation);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trạm:", error);
      toast.error("Lấy danh sách trạm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // 🔹 Lọc tên theo từ khóa
  const filteredStations = displayedStations.filter((st) => {
    const term = searchTerm.toLowerCase();
    return (
      st.stationName.toLowerCase().includes(term) ||
      st.location.toLowerCase().includes(term) ||
      st.province.toLowerCase().includes(term)
    );
  });

  if (loading) return <p>Đang tải dữ liệu trạm sạc...</p>;

  return (
    <div className="order-container">
      {/* Cột trái */}
      <div className="left-panel">

        <h2>Trạng thái các trạm sạc</h2>

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
                toast.warn("Vui lòng chọn trạm trước khi mở Google Map!");
              }
            }}
          >
            Google Map
          </button>
        </div>
        <div className="filter-buttons">
          <button
            className={filterMode === "all" ? "active" : ""}
            onClick={() => setFilterMode("all")}
          >
            Tất cả trạm
          </button>
          <button
            className={filterMode === "nearest" ? "active" : ""}
            onClick={() => setFilterMode("nearest")}
          >
            Trạm gần nhất
          </button>
        </div>

        <div className="station-list">
          {filteredStations.map((st) => (
            <div
              key={st.id}
              className={`station-item ${
                selectedStation?.id === st.id ? "active" : ""
              }`}
              onClick={() => handleSelectStation(st)}
            >
              <h4 className="station-header">
                {st.stationName}
                {st.status === "Inactive" && (
                  <span className="inactive"> Inactive</span>
                )}
                {st.status === "Active" && (
                  <span className="active"> Active</span>
                )}
                {st.status === "Maintenance" && (
                  <span className="maintenance"> Maintained</span>
                )}
              </h4>
              <p>
                {st.location}, {st.province}
              </p>

              {selectedStation?.id === st.id && (
                <div className="station-posts">
                  {stationPosts[st.id]?.length > 0 ? (
                    stationPosts[st.id].map((post, index) => (
                      <div
                        key={post.id}
                        className={`post-item status-${post.status}`}
                      >
                        <h5>Trụ {index + 1}</h5>
                        <p>
                          <b>Tên trụ:</b> {post.postName}
                        </p>
                        <p>
                          <b>Cổng sạc:</b> {post.connectorType}
                        </p>
                        <p>
                          <b>Loại xe hỗ trợ:</b> {post.vehicleTypeSupported}
                        </p>
                        <p>
                          <b>Số Cổng Sạc:</b> {post.totalConnectors}
                        </p>
                        <p>
                          <b>Trạng thái:</b>{" "}
                          {post.status === "InActive" && (
                            <span className="inactive"> Inactive</span>
                          )}
                          {post.status === "Available" && (
                            <span className="active"> Active</span>
                          )}
                          {post.status === "Busy" && (
                            <span className="busy"> Busy</span>
                          )}
                          {post.status === "Maintained" && (
                            <span className="maintained"> Maintained</span>
                          )}
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
          <button className="btn-book" onClick={() => setShowBookingPopup(true)}>
            Đặt lịch sạc
          </button>
        </div>
      </div>

      {/* Cột phải - bản đồ */}
      <div className="right-panel">
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={13}
          zoomControl={false}
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
                <Popup className="leaflet-popup-station">
                  <div className="popup-station">
                    <img
                      src={station.imageUrl || "/img/station.jfif"}
                      alt={station.stationName}
                      className="popup-image"
                    />
                    <div className="station-info">
                      <h3>{station.stationName}</h3>
                      <p className="station-address">
                        {station.location}, {station.province}
                      </p>
                    </div>

                    <div className="charging-posts">
                      {stationPosts[station.id]?.length > 0 ? (
                        stationPosts[station.id].map((post, index) => (
                          <div
                            key={post.id}
                            className={`charging-post-card status-${post.status}`}
                          >
                            <div className="post-header">
                              <span className="post-name">
                                Trụ {index + 1}: {post.postName}
                              </span>
                              <span className="post-type">
                                {post.connectorType} |{" "}
                                {post.vehicleTypeSupported}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>Chưa có trụ sạc</p>
                      )}
                    </div>

                    <button
                      className="btn-popup-book"
                      onClick={() => setShowBookingPopup(true)}
                    >
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

      {/* Popup đặt lịch */}
      {showBookingPopup && (
        <BookingPopup
          stations={stations}
          stationId={selectedStation?.id}
          onClose={() => setShowBookingPopup(false)}
          onAdded={fetchStations}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default OrderChargingST;
