/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { addBooking } from "../../API/Booking";
import "react-toastify/dist/ReactToastify.css";
import "./Booking.css";

export default function BookingPopup({ stations = [], stationId, onClose, onAdded }) {
  const [term, setTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false); // state hiển thị dropdown
  const [bookingData, setBookingData] = useState({
    stationId: stationId || "",
    vehicleId: "",
    startTime: "",
    currentBattery: 0,
    targetBattery: 0,
  });

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
      toast.success("✅ Thêm booking thành công!");
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
      toast.error("❌ Lỗi khi thêm booking!");
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

        <input
          type="text"
          placeholder="Mã xe / Vehicle ID"
          value={bookingData.vehicleId}
          onChange={(e) =>
            setBookingData({ ...bookingData, vehicleId: e.target.value })
          }
        />

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
