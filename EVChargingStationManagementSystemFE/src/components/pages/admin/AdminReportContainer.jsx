import React, { useEffect, useState } from "react";
import { getReport } from "../../../API/Report"; 
import "./AdminReportContainer.css";

const ReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | staff | evdriver

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReport();
        console.log("API response:", response); 
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

  // Xử lý filter
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    if (value === "all") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(r => r.reportBy === value);
      setFilteredReports(filtered);
    }
  };

  if (loading) return <p>Đang tải danh sách...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="booking-container">
      <h1 className="booking-title">Danh sách Reports</h1>

      <div className="filter-container">
        <label>Lọc theo loại:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">Tất cả</option>
          <option value="staff">Staff</option>
          <option value="evdriver">EV Driver</option>
        </select>
      </div>

      <div className="booking-card">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Station</th>
              <th>Post Name/ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <tr key={report.id || index}>
                  <td>{report.title || "-"}</td>
                  <td>{report.reportType || "-"}</td>
                  <td>{report.severity || "-"}</td>
                  <td>{report.description || "-"}</td>
                  <td>{report.stationName || "-"}</td>
                  <td>
                    {report.postName || report.postId
                      ? `${report.postName || "-"} (${report.postId || "-"})`
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-booking">
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
