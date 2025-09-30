import React, { useState } from "react";
import "./Home.css";
//xin chao

const Home = () => {
    const [location, setLocation] = useState("");
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [bookingTime, setBookingTime] = useState("");

    // Giả lập API tìm kiếm trạm sạc
    const handleSearch = () => {
        const mockStations = [
            { id: 1, name: "Station A", address: "123 Main St", slots: 5 },
            { id: 2, name: "Station B", address: "456 Elm St", slots: 3 },
            { id: 3, name: "Station C", address: "789 Oak St", slots: 0 },
        ];
        setStations(mockStations);
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
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Nhập địa điểm, quận, tỉnh..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>Tìm kiếm</button>
                    </div>
                    <div className="station-list">
                        {stations.map((station) => (
                            <div
                                key={station.id}
                                className={`station ${station.slots > 0 ? "available" : "unavailable"}`}
                                onClick={() => setSelectedStation(station)}
                            >
                                <div className="station-header">
                                    <h3>{station.name}</h3>
                                    <span className={`badge ${station.slots > 0 ? 'ok' : 'bad'}`}>{station.slots > 0 ? 'Còn chỗ' : 'Hết chỗ'}</span>
                                </div>
                                <p>{station.address}</p>
                                <div className="station-meta">
                                    <span>Slots: {station.slots}</span>
                                    <button className="btn btn-ghost sm">Chi tiết</button>
                                </div>
                            </div>
                        ))}
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