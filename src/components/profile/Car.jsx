// MyVehicles.jsx
import React, { useState, useEffect } from "react";
import "./Car.css"

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]); // dữ liệu xe từ API
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ===== CHỖ NÀY ĐỂ BẠN GỌI API LẤY DANH SÁCH XE =====
    const fetchVehicles = async () => {
      try {
        // ví dụ API: GET /api/my-vehicles
        // const res = await fetch("/api/my-vehicles");
        // const data = await res.json();

        // Dữ liệu dummy tạm thời
        const data = [
          { id: "vf8", name: "VF 8", image: "https://via.placeholder.com/600x300?text=VF+8" },
          { id: "vf9", name: "VF 9", image: "https://via.placeholder.com/600x300?text=VF+9" },
          { id: "vfe34", name: "VF e34", image: "https://via.placeholder.com/600x300?text=VF+e34" },
        ];

        setVehicles(data);
        if (data.length > 0) setSelectedVehicle(data[0].id); // chọn mặc định xe đầu tiên
      } catch (err) {
        console.error("Lỗi khi lấy danh sách xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  if (loading) return <p>Đang tải xe của bạn...</p>;
  if (!vehicles.length) return <p>Bạn chưa có xe nào</p>;

  const currentVehicle = vehicles.find(v => v.id === selectedVehicle);

  return (
    <div className="my-vehicles-container">
      <h2>Xe của tôi</h2>
      <div className="vehicle-card">
        {currentVehicle && (
          <img
            src={currentVehicle.image}
            alt={currentVehicle.name}
            className="vehicle-image"
          />
        )}
        <div className="vehicle-info">
          <label htmlFor="vehicle-select">Chọn xe:</label>
          <select
            id="vehicle-select"
            value={selectedVehicle}
            onChange={handleChange}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MyVehicles;
