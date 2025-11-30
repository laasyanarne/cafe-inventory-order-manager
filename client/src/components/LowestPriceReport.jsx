import { useEffect, useState } from "react";
import api from "../utils/api";

function LowestPriceReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLowestPrice = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/lowest-price");
        if (!isMounted) return;

        // backend returns { lowest_price: number, product_name: string }
        setData(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.error || "Failed to load lowest price"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLowestPrice();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayPrice =
    data?.lowest_price == null || isNaN(Number(data.lowest_price))
      ? "—"
      : `$${Number(data.lowest_price).toFixed(2)}`;

  return (
    <div className="kpi-card">
      <h2 className="kpi-title">Lowest Menu Price Point</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "#c62828", fontSize: "0.9rem" }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-value">{displayPrice}</div>
          <div className="kpi-subtitle">
            {data?.product_name || "entry-level pricing"}
          </div>
        </>
      )}
    </div>
  );
}

export default LowestPriceReport;