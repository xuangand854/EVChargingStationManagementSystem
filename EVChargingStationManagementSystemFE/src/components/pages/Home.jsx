import React, { useState } from "react";
import "./Home.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Orb from "../../effect/Orb";

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
        { id: 1, name: "Station A", address: "123 Main St, HCM", slots: 5, coords: [10.78, 106.70] },
        { id: 2, name: "Station B", address: "456 Elm St, HCM", slots: 3, coords: [10.775, 106.705] },
        { id: 3, name: "Station C", address: "789 Oak St, HCM", slots: 0, coords: [10.77, 106.695] },
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
                <Orb hue={-20} hoverIntensity={0.25} rotateOnHover={true} />
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

            {/* About Section (moved below Search) */}
            <section className="section section-about" id="about">
                <section className="home-about">
                    <div className="about-grid">
                        <div className="about-text">
                            <h2 className="section-title">Về EVOne</h2>
                            <p>
                                EVOne là nền tảng quản lý và kết nối trạm sạc xe điện, giúp người dùng tìm kiếm, đặt lịch
                                và sạc nhanh một cách thuận tiện. Chúng tôi hướng tới việc phổ biến hoá xe điện bằng trải nghiệm
                                trực quan, minh bạch và tin cậy.
                            </p>
                            <ul className="about-highlights">
                                <li>Hệ thống bản đồ trực quan, realtime trạng thái trạm</li>
                                <li>Đặt lịch trước, giảm thời gian chờ đợi</li>
                                <li>Hỗ trợ đa chuẩn sạc và nhiều nhà cung cấp</li>
                            </ul>
                        </div>
                        <div className="about-visual" aria-hidden>
                            <div className="about-card">
                                <div className="about-stat">
                                    <span className="stat-value">500+</span>
                                    <span className="stat-label">Trạm sạc</span>
                                </div>
                                <div className="about-stat">
                                    <span className="stat-value">99.9%</span>
                                    <span className="stat-label">Uptime</span>
                                </div>
                                <div className="about-stat">
                                    <span className="stat-value">24/7</span>
                                    <span className="stat-label">Hỗ trợ</span>
                                </div>
                            </div>
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

            {/* Contact Section */}
            <section className="section section-contact" id="contact">
                <section className="home-contact">
                    <h2 className="section-title">Liên hệ</h2>
                    <div className="contact-grid">
                        <aside className="contact-card contact-info">
                            <h3>EVOne - EV Charging Platform</h3>
                            <ul className="info-list">
                                <li className="info-item">
                                    <span className="info-label">Địa chỉ</span>
                                    <span>123 Innovation St, Quận 1, TP. Hồ Chí Minh</span>
                                </li>
                                <li className="info-item">
                                    <span className="info-label">Hotline</span>
                                    <a href="tel:+84281234567">(+84) 28 1234 567</a>
                                </li>
                                <li className="info-item">
                                    <span className="info-label">Email</span>
                                    <a href="mailto:support@evone.vn">support@evone.vn</a>
                                </li>
                                <li className="info-item">
                                    <span className="info-label">Giờ làm việc</span>
                                    <span>Thứ 2 - Thứ 6: 08:30 - 18:00</span>
                                </li>
                            </ul>
                            <div className="info-note">Hỗ trợ khẩn cấp sự cố trạm 24/7 qua Hotline.</div>
                        </aside>

                        {/* <form className="contact-card contact-form" onSubmit={(e) => { e.preventDefault(); alert('Đã gửi liên hệ!'); }}>
                            <div className="form-row">
                                <div className="field-group">
                                    <label htmlFor="contactName">Họ và tên</label>
                                    <input id="contactName" type="text" name="name" placeholder="VD: Nguyễn Văn A" required />
                                </div>
                                <div className="field-group">
                                    <label htmlFor="contactEmail">Email</label>
                                    <input id="contactEmail" type="email" name="email" placeholder="you@example.com" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="field-group">
                                    <label htmlFor="contactPhone">Số điện thoại</label>
                                    <input id="contactPhone" type="tel" name="phone" placeholder="VD: 0901 234 567" pattern="[0-9\\s+()-]{8,}" />
                                </div>
                                <div className="field-group">
                                    <label htmlFor="contactSubject">Chủ đề</label>
                                    <select id="contactSubject" name="subject" defaultValue="general" required>
                                        <option value="general">Tư vấn chung</option>
                                        <option value="booking">Hỗ trợ đặt lịch</option>
                                        <option value="station">Phản hồi trạm sạc</option>
                                        <option value="technical">Hỗ trợ kỹ thuật</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-group">
                                <label htmlFor="contactMessage">Nội dung</label>
                                <textarea id="contactMessage" name="message" rows="5" placeholder="Mô tả chi tiết yêu cầu của bạn..." required />
                            </div>

                            <label className="agree-row">
                                <input type="checkbox" required />
                                <span>Tôi đồng ý với điều khoản xử lý dữ liệu cá nhân</span>
                            </label>

                            <div className="form-actions">
                                <button className="btn btn-primary" type="submit">Gửi</button>
                                <button className="btn btn-ghost" type="reset">Xoá</button>
                            </div>
                        </form> */}
                    </div>
                </section>
            </section>
            {/* Floating Social Bar */}
            <div className="floating-social" aria-label="Liên kết mạng xã hội">
                <a className="social-btn" href="https://www.facebook.com/" target="_blank" aria-label="Facebook" title="Facebook" rel="noopener noreferrer">
                    {/* Facebook SVG */}
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.01 3.66 9.17 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.91h-2.32V22c4.78-.77 8.44-4.93 8.44-9.94Z" /></svg>
                </a>
                <a className="social-btn" href="https://www.youtube.com/" target="_blank" aria-label="YouTube" title="YouTube" rel="noopener noreferrer">
                    {/* YouTube SVG */}
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2s-.23-1.65-.95-2.37c-.91-.95-1.93-.96-2.4-1.02C16.58 2.5 12 2.5 12 2.5h-.01s-4.58 0-8.14.31c-.47.06-1.49.07-2.4 1.02C.73 4.55.5 6.2.5 6.2S.27 8.14.27 10.07v1.85c0 1.93.23 3.87.23 3.87s.23 1.65.95 2.37c.91.95 2.11.92 2.64 1.02 1.92.19 8 .31 8 .31s4.58 0 8.14-.31c.47-.06 1.49-.07 2.4-1.02.72-.72.95-2.37.95-2.37s.23-1.94.23-3.87v-1.85c0-1.93-.23-3.87-.23-3.87ZM9.75 13.88V7.94l5.8 2.97-5.8 2.97Z" /></svg>
                </a>
                <a className="social-btn" href="https://www.instagram.com/" target="_blank" aria-label="Instagram" title="Instagram" rel="noopener noreferrer">
                    {/* Instagram SVG */}
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.67.52.72.28 1.33.66 1.93 1.27.6.6.98 1.21 1.27 1.93.27.7.47 1.5.52 2.67.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.52 2.67-.28.72-.66 1.33-1.27 1.93-.6.6-1.21.98-1.93 1.27-.7.27-1.5.47-2.67.52-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.67-.52a5.49 5.49 0 0 1-1.93-1.27A5.49 5.49 0 0 1 .89 20.2c-.27-.7-.47-1.5-.52-2.67C.31 16.26.3 15.88.3 12.68s.01-3.58.07-4.85c.05-1.17.24-1.97.52-2.67.28-.72.66-1.33 1.27-1.93S3.37 1.25 4.09.97c.7-.27 1.5-.47 2.67-.52C8.03.39 8.41.38 11.61.38c3.2 0 3.58.01 4.85.07Zm0 1.8c-3.15 0-3.52.01-4.76.07-.98.05-1.51.21-1.86.34-.47.18-.81.39-1.17.74-.35.36-.56.7-.74 1.17-.13.35-.29.88-.34 1.86-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05.98.21 1.51.34 1.86.18.47.39.81.74 1.17.36.35.7.56 1.17.74.35.13.88.29 1.86.34 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.98-.05 1.51-.21 1.86-.34.47-.18.81-.39 1.17-.74.35-.36.56-.7.74-1.17.13-.35.29-.88.34-1.86.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-.98-.21-1.51-.34-1.86a3.62 3.62 0 0 0-.74-1.17 3.62 3.62 0 0 0-1.17-.74c-.35-.13-.88-.29-1.86-.34-1.24-.06-1.61-.07-4.76-.07Zm0 3.13a6.91 6.91 0 1 1 0 13.82 6.91 6.91 0 0 1 0-13.82Zm0 1.8a5.11 5.11 0 1 0 0 10.22 5.11 5.11 0 0 0 0-10.22Zm6.99-2.3a1.62 1.62 0 1 1-3.24 0 1.62 1.62 0 0 1 3.24 0Z" /></svg>
                </a>
                <a className="social-btn" href="https://shopee.vn/" target="_blank" aria-label="Shopee" title="Shopee" rel="noopener noreferrer">
                    {/* Shopee SVG */}
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.7 8.5c-.33-2.74-2.9-4.85-5.7-4.85S6.63 5.76 6.3 8.5H4v10.06c0 .79.64 1.44 1.43 1.44h13.14c.79 0 1.43-.65 1.43-1.44V8.5h-2.3Zm-8.6 0c.3-1.76 1.87-3.05 3.9-3.05 2.03 0 3.6 1.29 3.9 3.05H9.1Zm1.5 9.33c-1.56 0-2.7-.83-2.7-2.05 0-.95.61-1.6 1.9-1.94l1.56-.42c.72-.19.96-.4.96-.8 0-.57-.56-.95-1.4-.95-.88 0-1.5.41-1.64 1.05H7.75c.1-1.47 1.37-2.43 3.3-2.43 1.86 0 3.2 1 3.2 2.4 0 1.02-.56 1.63-1.86 1.98l-1.5.4c-.76.2-1.06.43-1.06.86 0 .53.56.9 1.37.9.93 0 1.56-.4 1.72-1.08h1.24c-.18 1.55-1.47 2.24-3.1 2.24Z" /></svg>
                </a>
            </div>

            {/* Floating Action Button */}
            <button type="button" className="floating-action" aria-label="Hỗ trợ" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                ?
            </button>
        </div>
    );
};

export default Home;
