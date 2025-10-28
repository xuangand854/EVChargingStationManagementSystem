/* eslint-disable react-refresh/only-export-components */
import React, { useState,useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { addBooking } from "../../API/Booking.js";
import {getVehicleModels} from "../../API/Admin"
import "react-toastify/dist/ReactToastify.css";
import "./Booking.css";

export default function BookingPopup({ stations = [], stationId, onClose, onAdded }) {
  const [term, setTerm] = useState("");
  const [termVehicle,setTermVehicle] = useState("");
  const [showDropdownVehicle,setShowDropdownVehicle] = useState (false);
  const [VehicleModels,setVehicleModels] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // state hiển thị dropdown
  const [bookingData, setBookingData] = useState({
    stationId: stationId || "",
    vehicleId: "",
    startTime: "",
    currentBattery: 0,
    targetBattery: 0,
  });
  //lấy api xe 
  useEffect(()=>{
    const fetchVehicleModels = async ()=>{
      try {
        const res = await getVehicleModels();
        setVehicleModels(res.data);
      } catch (error) {
        console.log('không thể lấy danh sách xe',error);
        toast.error("Không thể tải danh sách xe!");
      }
    };
    fetchVehicleModels();
  },[]);

  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filteredStations = term
    ? stations.filter((st) =>
      normalize(st.stationName).includes(normalize(term)) ||
      normalize(st.location).includes(normalize(term)) ||
      normalize(st.province).includes(normalize(term))
    )
    : stations; // show all if empty

  const filteredVehicles = termVehicle
    ? VehicleModels.filter((v) =>
        normalize(v.modelName).includes(normalize(termVehicle)) ||
        normalize(v.vehicleType).includes(normalize(termVehicle))
      )
    : VehicleModels;

  const handleSelectVehicle = (v) => {
    setTermVehicle(`${v.vehicleType} ${v.modelName}`);
    setBookingData({ ...bookingData, vehicleId: v.id });
    setShowDropdownVehicle(false);
  };

  const handleSelect = (st) => {
    setTerm(st.stationName);
    setBookingData({ ...bookingData, stationId: st.id });
    setShowDropdown(false); // ẩn dropdown khi chọn
  };

  const handleAddBooking = async () => {
    if (!bookingData.stationId || !bookingData.vehicleId || !bookingData.startTime) {
      toast.warning("Vui lòng nhập đủ thông tin!");
      return;
    }

    try {
      await addBooking(
        bookingData.stationId,
        bookingData.vehicleId,
        bookingData.startTime,
        parseInt(bookingData.currentBattery),
        parseInt(bookingData.targetBattery)
      );
      toast.success(" Thêm booking thành công!");
      if (onAdded) onAdded();
      onClose();
      setBookingData({
        stationId: "",
        vehicleId: "",
        startTime: "",
        currentBattery: 0,
        targetBattery: 0,
      });
      setTerm("");
      setShowDropdown(false);
    } catch (error) {
      console.error(error);
      toast.error(" Lỗi khi thêm booking!");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <h3> Thêm Booking Mới</h3>

        <label>Chọn trạm:</label>
        <div className="autocomplete-container">
          <input
            type="text"
            placeholder="Nhập tên trạm, tỉnh hoặc địa chỉ"
            value={term}
            onFocus={() => setShowDropdown(true)} // hiện dropdown khi focus
            onChange={(e) => {
              setTerm(e.target.value);
              setShowDropdown(true); // vẫn hiện khi gõ
            }}
            className="autocomplete-input"
          />
          {showDropdown && filteredStations.length > 0 && (
            <div className="autocomplete-list">
              {filteredStations.map((st) => {
                const regex = new RegExp(`(${escapeRegex(term)})`, "i");
                const parts = st.stationName.split(regex);
                return (
                  <div
                    key={st.id}
                    className="autocomplete-item"
                    onClick={() => handleSelect(st)}
                  >
                    {parts.map((part, i) =>
                      regex.test(part) ? (
                        <span key={i} className="highlight">{part}</span>
                      ) : (
                        part
                      )
                    )} ({st.location}, {st.province})
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <label>Chọn xe:</label>
        <div className="autocomplete-container">
          <input
            type="text"
            placeholder="Nhập tên hoặc hãng xe"
            value={termVehicle}
            onFocus={() => setShowDropdownVehicle(true)}
            onChange={(e) => {
              setTermVehicle(e.target.value);
              setShowDropdownVehicle(true);
            }}
            className="autocomplete-input"
          />
          {showDropdownVehicle && filteredVehicles.length > 0 && (
            <div className="autocomplete-list">
              {filteredVehicles.map((v) => {
                const regex = new RegExp(`(${escapeRegex(termVehicle)})`, "i");
                const parts = `${v.vehicleType} ${v.modelName}`.split(regex);
                return (
                  <div
                    key={v.id}
                    className="autocomplete-item"
                    onClick={() => handleSelectVehicle(v)}
                  >
                    {parts.map((part, i) =>
                      regex.test(part) ? (
                        <span key={i} className="highlight">{part}</span>
                      ) : (
                        part
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <label>Thời Gian Bắt Đầu</label>
        <input
          type="datetime-local"
          value={bookingData.startTime}
          onChange={(e) =>
            setBookingData({ ...bookingData, startTime: e.target.value })
          }
        />

        <div className="popup-buttons">
          <button className="add-btn" onClick={handleAddBooking}>
            Xác nhận
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

