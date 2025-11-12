import React, { useEffect, useState } from "react";
import { getReport } from "../../../API/Report"; 
import "./AdminReportContainer.css";

const ReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | staff | evdriver | admin
  const [search, setSearch] = useState(""); // input tìm kiếm

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReport();
        const data = response?.data?.data || [];
        setReports(data);
        setFilteredReports(data); // mặc định show tất cả
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách report");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  const removeVietnameseTones = (str) => {
  if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // loại bỏ dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  // Hàm lọc kết hợp filter + search
  const applyFilters = (reportsList, roleFilter, searchTerm) => {
    let result = [...reportsList];

    // Lọc theo role
    if (roleFilter !== "all") {
      result = result.filter(
        (r) => removeVietnameseTones(r.roleName) === removeVietnameseTones(roleFilter)
      );
    }

    // Lọc theo search term
    if (searchTerm.trim() !== "") {
      const term = removeVietnameseTones(searchTerm);
      result = result.filter((r) =>
        removeVietnameseTones(r.title).includes(term) ||
        removeVietnameseTones(r.reportType).includes(term) ||
        removeVietnameseTones(r.severity).includes(term) ||
        removeVietnameseTones(r.roleName).includes(term) ||
        removeVietnameseTones(r.stationName).includes(term) ||
        removeVietnameseTones(r.postName).includes(term) ||
        removeVietnameseTones(r.postId?.toString()).includes(term) ||
        removeVietnameseTones(r.description).includes(term)
      );
    }

    return result;
  };

  // Khi thay đổi filter
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    const newFiltered = applyFilters(reports, value, search);
    setFilteredReports(newFiltered);
  };

  // Khi thay đổi search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const newFiltered = applyFilters(reports, filter, value);
    setFilteredReports(newFiltered);
  };

  if (loading) return <p>Đang tải danh sách...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="booking-container">
      <h1 className="booking-title">Danh sách Reports</h1>

      <div className="filter-container" style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label>Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Tìm kiếm theo title, mô tả, trạm..."
            value={search}
            onChange={handleSearchChange}
            style={{ padding: "4px 8px" }}
          />
        </div>

        <div>
          <label>Lọc Theo Vai Trò:</label>
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Tất cả</option>
            <option value="staff">Staff</option>
            <option value="evdriver">EVDriver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        
      </div>

      <div className="booking-card">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Role Name</th>
              <th>Station</th>
              <th>Post Name/ID</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <tr key={report.id || index}>
                  <td>{report.title || "-"}</td>
                  <td>{report.reportType || "-"}</td>
                  <td>{report.severity || "-"}</td>
                  <td>{report.roleName || "-"}</td>
                  <td>{report.stationName || "-"}</td>
                  <td>
                    {report.postName || report.postId
                      ? `${report.postName || "-"} (${report.postId || "-"})`
                      : "-"}
                  </td>
                  <td>{report.description || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-booking">
                  Không có report nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportAdmin;
