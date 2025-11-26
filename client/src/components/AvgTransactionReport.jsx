import { useEffect, useState } from "react";
import api from "../utils/api";

function AvgTransactionReport() {
  const [avg, setAvg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAvg = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/avg-transaction");
        if (!isMounted) return;

        // backend returns { avg_total: number | string | null }
        const value = res.data?.avg_total ?? null;
        setAvg(value);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.error || "Failed to load average transaction"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAvg();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayValue =
    avg == null || isNaN(Number(avg))
      ? "—"
      : `$${Number(avg).toFixed(2)}`;

  return (
    <div className="kpi-card">
      <h2 className="kpi-title">Average Transaction Value</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "#c62828", fontSize: "0.9rem" }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-value">{displayValue}</div>
          <div className="kpi-subtitle">per transaction · all time</div>
        </>
      )}
    </div>
  );
}

export default AvgTransactionReport;
