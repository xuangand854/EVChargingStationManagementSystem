import React, { useEffect, useState } from "react";
import { getReport } from "../../../API/Report"; 
import "./AdminReportContainer.css";

const PAGE_SIZE = 10; // Số item mỗi trang

const ReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await getReport();
        const data = response?.data?.data || response?.data || [];
        setReports(data);
        setFilteredReports(data);
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
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const applyFilters = (reportsList, roleFilter, searchTerm) => {
    let result = [...reportsList];

    if (roleFilter !== "all") {
      result = result.filter(
        (r) => removeVietnameseTones(r.roleName) === removeVietnameseTones(roleFilter)
      );
    }

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

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    const newFiltered = applyFilters(reports, value, search);
    setFilteredReports(newFiltered);
    setCurrentPage(1); // reset page
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const newFiltered = applyFilters(reports, filter, value);
    setFilteredReports(newFiltered);
    setCurrentPage(1); // reset page
  };

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);
  const currentData = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <p>Đang tải danh sách...</p>;

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
            {currentData.length > 0 ? (
              currentData.map((report, index) => (
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
                <td colSpan="7" style={{ textAlign: "center", padding: "16px" }}>
                  Không có report nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
      {totalPages > 1 && (
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "8px" }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              style={{ fontWeight: currentPage === i + 1 ? "bold" : "normal" }}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReportAdmin;
