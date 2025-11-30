import { useEffect, useState } from "react";
import api from "../utils/api";

function CustomerCountReport() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/customer-count");
        if (!isMounted) return;

        // backend returns { customer_count: number | string | null }
        const value = res.data?.customer_count ?? null;
        setCount(value);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.error || "Failed to load customer count"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayValue =
    count == null || isNaN(Number(count))
      ? "—"
      : Number(count).toLocaleString('en-US');

  return (
    <div className="kpi-card">
      <h2 className="kpi-title">Total Customer Count</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "#c62828", fontSize: "0.9rem" }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-value">{displayValue}</div>
          <div className="kpi-subtitle">unique customers · all time</div>
        </>
      )}
    </div>
  );
}

export default CustomerCountReport;