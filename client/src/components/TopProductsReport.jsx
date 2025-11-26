import { useEffect, useState } from "react";
import api from "../utils/api";

function TopProductsReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/top-products");
        if (!isMounted) return;
        setData(res.data || []);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(err.response?.data?.error || "Failed to load top products");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const maxQty = data.reduce(
    (max, row) => Math.max(max, Number(row.total_qty || 0)),
    0
  );

  return (
    <div className="report-card">
      <h2 className="report-card-title">Top Products by Quantity Sold</h2>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#c62828", fontSize: "0.9rem" }}>{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p style={{ fontSize: "0.9rem", color: "#7b4b32" }}>
          No sales data available yet.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <ul className="top-products-list">
          {data.map((row) => {
            const qty = Number(row.total_qty || 0);
            const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;

            return (
              <li key={row.id} className="top-product-row">
                <span className="top-product-label">{row.name}</span>
                <div className="top-product-bar-wrapper">
                  <div
                    className="top-product-bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="top-product-value">{qty}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TopProductsReport;
