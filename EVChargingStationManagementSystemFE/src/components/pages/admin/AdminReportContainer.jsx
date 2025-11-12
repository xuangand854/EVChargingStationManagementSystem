import React, { useEffect, useState } from "react";
import { getReport } from "../../../API/Report"; 
import "./AdminReportContainer.css";

const ReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReport();
        console.log("API response:", response); 

        // Fallback nếu API trả mảng trực tiếp hoặc có .data
        const data = response?.data?.data || [];
        setReports(data);

        
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách report");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Đang tải danh sách...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="booking-container">
      <h1 className="booking-title">Danh sách Reports</h1>
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
            {reports.length > 0 ? (
              reports.map((report, index) => (
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
