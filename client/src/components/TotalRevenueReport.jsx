import { useEffect, useState } from "react";
import api from "../utils/api";

function TotalRevenueReport() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/total-revenue");
        if (!isMounted) return;

        // backend returns { total_revenue: number | string | null }
        const value = res.data?.total_revenue ?? null;
        setRevenue(value);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.error || "Failed to load total revenue"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRevenue();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayValue =
    revenue == null || isNaN(Number(revenue))
      ? "—"
      : `$${Number(revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="kpi-card">
      <h2 className="kpi-title">Total Revenue Generated</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "#c62828", fontSize: "0.9rem" }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-value">{displayValue}</div>
          <div className="kpi-subtitle">gross income · all time</div>
        </>
      )}
    </div>
  );
}

export default TotalRevenueReport;