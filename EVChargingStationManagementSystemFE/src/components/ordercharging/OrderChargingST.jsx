
import React, { useEffect, useState } from "react";
import "./OrderChargingST.css"; 
import { getAuthStatus } from "../../API/Auth";

const OrderChargingST = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  });
  useEffect(()=>{
    const fetchUser = async()=>{
        try {
            
            const authStatus = await getAuthStatus();
            if(authStatus.isAuthenticated && authStatus.user){
                const userData={
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
            }else{
                setUser(null);
            }
            
        } catch (err) {
            console.err("lỗi khi lấy thông tin",err);
            setUser(null);
        }finally{
            setLoading(false);
        }
    };
    fetchUser();
  },[]);
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const newServices = checked
          ? [...prev.service, value]
          : prev.service.filter((s) => s !== value);
        return { ...prev, service: newServices };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn phải đăng nhập để đặt lịch!");
      return;
    }
    console.log("Thông tin đặt lịch:", formData);
    alert("Đặt lịch thành công!");
  };

  if (loading) return <p>Đang tải...</p>;

  if (!user) {
    return (
      <div className="order-wrapper">
      <h2>Đặt lịch trạm sạc</h2>
      <p className="must-login">⚠️ Bạn phải đăng nhập để đặt lịch.</p>
    </div>
    );
  }

  return (
    <div className="order-wrapper">
      <h2>Đặt lịch trạm sạc</h2>
      <form onSubmit={handleSubmit} className="order-form">
        {/* Thông tin khách hàng */}
        <div className="form-section">
          <h3>1. Thông tin khách hàng</h3>
          <label>
            Họ tên *
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              required
            />
          </label>
          <label>
            Số điện thoại *
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Tối thiểu 10 chữ số"
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </label>
        </div>

        {/* Thông tin xe */}
        <div className="form-section">
          <h3>2. Thông tin xe</h3>
          <label>
            Mẫu xe *
            <select
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              required
            >
              <option value="">Lựa chọn</option>
              <option value="VF3">VF3</option>
              <option value="VF5">VF5</option>
              <option value="VF7">VF7</option>
            </select>
          </label>
          <label>
            Số Km
            <input
              type="number"
              name="km"
              value={formData.km}
              onChange={handleChange}
              placeholder="Nhập số km"
            />
          </label>
          <label>
            Biển số xe *
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="Nhập biển số xe"
              required
            />
          </label>
        </div>

        {/* Dịch vụ */}
        <div className="form-section">
          <h3>3. Dịch vụ</h3>
          <label>
            <input
              type="checkbox"
              value="Sạc pin nhanh"
              checked={formData.service.includes("Sạc pin nhanh")}
              onChange={handleChange}
            />
            Sạc pin nhanh
          </label>
          <label>
            <input
              type="checkbox"
              value="Sạc pin thường"
              checked={formData.service.includes("Sạc pin thường")}
              onChange={handleChange}
            />
            Sạc pin thường
          </label>
          <label>
            <input
              type="checkbox"
              value="Kiểm tra pin"
              checked={formData.service.includes("Kiểm tra pin")}
              onChange={handleChange}
            />
            Kiểm tra pin
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Ghi chú thêm"
          ></textarea>
        </div>

        {/* Địa điểm & thời gian */}
        <div className="form-section">
          <h3>4. Địa điểm & Thời gian</h3>
          <label>
            Tỉnh/Thành phố *
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Quận/Huyện *
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </label>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="locationType"
                value="station"
                checked={formData.locationType === "station"}
                onChange={handleChange}
              />
              Trạm sạc
            </label>
            <label>
              <input
                type="radio"
                name="locationType"
                value="mobile"
                checked={formData.locationType === "mobile"}
                onChange={handleChange}
              />
              Dịch vụ lưu động
            </label>
          </div>

          <label>
            Ngày *
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Giờ *
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Đặt lịch
        </button>
      </form>
    </div>
  );
};

export default OrderChargingST;