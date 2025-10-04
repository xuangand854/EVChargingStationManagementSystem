import React, { useState } from "react";
import "./Home.css";
import { MapContainer, TileLayer, Marker, Popup ,useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// Component để zoom tới station khi chọn
const FlyToStation = ({ station }) => {
  const map = useMap();
  if (station?.coords) {
    map.flyTo(station.coords, 15); // CHỈNH Ở ĐÂY: bay tới vị trí station
  }
  return null;
};


const Home = () => {
    
    const [stations] = useState([
        { id: 1, name: "Station A", address: "123 Main St, HCM", slots: 5, coords: [10.78, 106.70]},
        { id: 2, name: "Station B", address: "456 Elm St, HCM", slots: 3 , coords: [10.775, 106.705]},
        { id: 3, name: "Station C", address: "789 Oak St, HCM", slots: 0 , coords: [10.77, 106.695]},
    ]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [bookingTime, setBookingTime] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Giả lập API tìm kiếm trạm sạc
    // const handleSearch = (value) => {
    //     setLocation(value);
    //     const mockStations = [
    //         { id: 1, name: "Station A", address: "123 Main St, HCM", slots: 5, coords: [10.78, 106.70]},
    //         { id: 2, name: "Station B", address: "456 Elm St, HCM", slots: 3 , coords: [10.775, 106.705]},
    //         { id: 3, name: "Station C", address: "789 Oak St, HCM", slots: 0 , coords: [10.77, 106.695]},
    //     ];
        
    //     if (value) {
    //         const filtered = mockStations.filter(
    //             (s) =>
    //                 s.name.toLowerCase().includes(value.toLowerCase()) ||
    //                 s.address.toLowerCase().includes(value.toLowerCase())
    //         );
    //         setStations(filtered);
    //         setSuggestions(filtered);
    //     } else {
    //         setStations(mockStations);
    //         setSuggestions([]);
    //     }
    // };
    // Khi chọn station
        const handleSelectStation = (station) => {
            setSelectedStation(station);
            
            setSuggestions([]);
        };



    // Xử lý đặt slot sạc
    const handleBooking = () => {
        if (!selectedStation || !bookingTime) {
            alert("Please select a station and time to book.");
            return;
        }
        alert(`Slot booked at ${selectedStation.name} for ${bookingTime}`);
    };

    return (
        <div className="fullpage-container">
            {/* Hero Section */}
            <section className="section section-hero" id="hero">
                <header className="home-hero">
                    <div className="hero-content">
                        <h1>
                            <span className="brand-orange">Sạc xe điện thông minh</span>
                            <span className="brand-gradient"> EVOne</span>
                        </h1>
                        <p>Tìm, đặt chỗ và sạc nhanh ở mọi nơi bạn đến.</p>
                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={() => document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth' })}>Khám phá ngay</button>
                            <button className="btn btn-ghost" onClick={() => document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' })}>Tìm trạm sạc</button>
                        </div>
                    </div>
                    <div className="hero-visual" aria-hidden>
                        <div className="glow"></div>
                        <svg className="hero-illustration" viewBox="0 0 520 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Nền mờ */}
                            <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#ff7e5f" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="#feb47b" stopOpacity="0.6" />
                                </linearGradient>
                                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ffac81" />
                                    <stop offset="100%" stopColor="#ff8a5c" />
                                </linearGradient>
                            </defs>
                            <g filter="url(#f)" opacity="0.15">
                                <ellipse cx="360" cy="240" rx="150" ry="90" fill="url(#g1)" />
                            </g>
                            {/* Trụ sạc */}
                            <rect x="320" y="90" width="70" height="170" rx="10" fill="rgba(255,255,255,0.9)" stroke="#ff9a5f" strokeWidth="2" />
                            <rect x="335" y="110" width="40" height="40" rx="6" fill="#fff1e8" stroke="#ff9a5f" />
                            <circle cx="355" cy="130" r="8" fill="#ff9a5f" />
                            <rect x="345" y="165" width="20" height="60" rx="4" fill="url(#g2)" />
                            {/* Dây sạc */}
                            <path d="M340 200 C 300 210, 280 230, 260 245" stroke="#ff9a5f" strokeWidth="4" fill="none" strokeLinecap="round" />
                            {/* Xe điện tối giản */}
                            <g transform="translate(170,230)">
                                <rect x="0" y="20" width="130" height="40" rx="10" fill="#ffffff" stroke="#ff9a5f" strokeWidth="2" />
                                <rect x="20" y="0" width="90" height="30" rx="10" fill="#fff6ef" stroke="#ff9a5f" strokeWidth="2" />
                                <circle cx="30" cy="70" r="12" fill="#1f2937" stroke="#ff9a5f" strokeWidth="2" />
                                <circle cx="110" cy="70" r="12" fill="#1f2937" stroke="#ff9a5f" strokeWidth="2" />
                                <rect x="118" y="32" width="12" height="8" fill="#ff9a5f" />
                            </g>
                            {/* Filter nhẹ */}
                            <filter id="f">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                            </filter>
                        </svg>
                    </div>
                </header>

                {/* Navigation Dots */}
                <ul className="nav-dots">
                    <li><button type="button" aria-label="Hero" onClick={() => document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' })}></button></li>
                    <li><button type="button" aria-label="Tính năng" onClick={() => document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth' })}></button></li>
                    <li><button type="button" aria-label="Tìm kiếm" onClick={() => document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' })}></button></li>
                    {selectedStation && <li><button type="button" aria-label="Đặt chỗ" onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}></button></li>}
                </ul>
            </section>

            {/* Features Section */}
            <section className="section section-features" id="discover">
                <section className="home-features">
                    <h2 className="section-title">Vì sao chọn <span className="brand-gradient">EVOne</span>?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="icon">🔍</div>
                            <h3>Tìm trạm sạc</h3>
                            <p>Tìm trạm sạc gần bạn theo vị trí hoặc điểm đến, cập nhật theo thời gian thực.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">📅</div>
                            <h3>Đặt lịch trước</h3>
                            <p>Đặt chỗ nhanh chóng để đảm bảo có trạm sạc khi bạn đến nơi.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">⚡</div>
                            <h3>Sạc nhanh</h3>
                            <p>Hỗ trợ nhiều chuẩn sạc nhanh với trải nghiệm mượt mà và an toàn.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">📊</div>
                            <h3>Realtime</h3>
                            <p>Trạng thái trạm sạc, công suất và chi phí hiển thị theo thời gian thực.</p>
                        </div>
                    </div>
                </section>
            </section>

                    {/* Search Section */}
                    <section className="section section-search" id="search">
                    <section className="home-search">
                        <h2 className="section-title">Tìm trạm sạc gần bạn</h2>

                        {/* Nút mở popup chọn trạm */}
                        <div className="search-bar">
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setSuggestions(stations)} // mở danh sách trong popup
                        >
                            Chọn trạm sạc
                        </button>
                        </div>

                        {/* Popup danh sách trạm */}
                        {suggestions.length > 0 && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                            <h3>Danh sách trạm</h3>
                            <ul className="station-select-list">
                                {suggestions.map((station) => (
                                <li 
                                    key={station.id} 
                                    onClick={() => {
                                    handleSelectStation(station);
                                    setSuggestions([]); // đóng popup
                                    }}
                                >
                                    <b>{station.name}</b> - {station.address}
                                </li>
                                ))}
                            </ul>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setSuggestions([])} // đóng popup khi bấm hủy
                            >
                                Đóng
                            </button>
                            </div>
                        </div>
                        )}

                        {/* OpenStreetMap Integration */}
                        <div className="map-container">
                        <MapContainer 
                            center={[10.7769, 106.7009]} // Default Hồ Chí Minh
                            zoom={13} 
                            style={{ height: "400px", width: "100%", marginTop: "20px", borderRadius: "12px" }}
                        >
                            <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Hiển thị tất cả marker */}
                            {stations.map((station) => (
                            <Marker 
                                key={station.id} 
                                position={station.coords}
                                eventHandlers={{
                                click: () => handleSelectStation(station), // Click vào marker -> chọn
                                }}
                            >
                                <Popup>
                                <b>{station.name}</b><br />
                                {station.address}<br />
                                Slots: {station.slots}
                                </Popup>
                            </Marker>
                            ))}

                            {/* Khi có station được chọn thì bay đến */}
                            {selectedStation && <FlyToStation station={selectedStation} />}
                        </MapContainer>
                        </div>
                    </section>
                    </section>



            {/* Booking Section (conditional) */}
            {selectedStation && (
                <section className="section section-booking" id="booking">
                    <section className="home-booking">
                        <h2 className="section-title">Đặt lịch sạc</h2>
                        <div className="booking-card">
                            <div className="booking-info">
                                <h3>{selectedStation.name}</h3>
                                <p>{selectedStation.address}</p>
                            </div>
                            <div className="booking-action">
                                <input
                                    type="datetime-local"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={handleBooking}>Đặt chỗ</button>
                            </div>
                        </div>
                    </section>
                </section>
            )}
        </div>
    );
};

export default Home;