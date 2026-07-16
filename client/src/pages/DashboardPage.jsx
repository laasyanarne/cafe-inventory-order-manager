import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./DashboardPage.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt$(n) {
  return `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Greeting Header ────────────────────────────────────────────────────────

function GreetingHeader({ user }) {
  const firstName = (user?.name || "").split(" ")[0] || user?.email?.split("@")[0] || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="dash-greeting-header">
      <div className="dash-greeting-left">
        <h1 className="dash-greeting-title">
          {getGreeting()}, {firstName}
        </h1>
        <p className="dash-greeting-sub">{today} · Halwa Bakery &amp; Cafe</p>
      </div>
      <Link to="/sales/transactions" className="btn btn-primary">
        + New Order
      </Link>
    </header>
  );
}

// ── KPI: Active Orders ─────────────────────────────────────────────────────

function ActiveOrdersKpi({ transactions, loading }) {
  const active = transactions.filter(
    t => t.status && t.status.toLowerCase() !== "completed"
  );
  return (
    <div className="kpi-card">
      <div className="kpi-label">Active Orders</div>
      {loading ? (
        <div className="kpi-value kpi-value--loading">—</div>
      ) : (
        <>
          <div className="kpi-value">{active.length}</div>
          <div className="kpi-meta">
            {transactions.length} total · {active.length} open
          </div>
        </>
      )}
    </div>
  );
}

// ── KPI: Inventory Health ──────────────────────────────────────────────────

function InventoryHealthKpi({ products, loading }) {
  const total    = products.length;
  const inStock  = products.filter(p => Number(p.stock) > 0).length;
  const critical = products.filter(p => Number(p.stock) === 0).length;
  const low      = products.filter(
    p => Number(p.stock) > 0 && Number(p.stock) < (Number(p.par_level) || 10)
  ).length;

  let statusClass = "kpi-value--healthy";
  if (critical > 0) statusClass = "kpi-value--critical";
  else if (low > 0) statusClass = "kpi-value--warning";

  return (
    <div className="kpi-card">
      <div className="kpi-label">Inventory</div>
      {loading ? (
        <div className="kpi-value kpi-value--loading">—</div>
      ) : (
        <>
          <div className={`kpi-value ${statusClass}`}>
            {inStock} <span className="kpi-value-denom">/ {total}</span>
          </div>
          <div className="kpi-meta">
            {critical > 0
              ? `${critical} out of stock`
              : low > 0
              ? `${low} below par`
              : "all items stocked"}
          </div>
        </>
      )}
    </div>
  );
}

// ── KPI: Revenue (manager only) ────────────────────────────────────────────

function RevenueKpi({ transactions, loading }) {
  const total = transactions.reduce((s, t) => s + Number(t.total || 0), 0);
  return (
    <div className="kpi-card">
      <div className="kpi-label">Total Revenue</div>
      {loading ? (
        <div className="kpi-value kpi-value--loading">—</div>
      ) : (
        <>
          <div className="kpi-value kpi-value--mono">{fmt$(total)}</div>
          <div className="kpi-meta">all-time gross</div>
        </>
      )}
    </div>
  );
}

// ── KPI: Avg Order (manager only) ──────────────────────────────────────────

function AvgOrderKpi({ transactions, loading }) {
  const total = transactions.reduce((s, t) => s + Number(t.total || 0), 0);
  const avg   = transactions.length > 0 ? total / transactions.length : 0;
  return (
    <div className="kpi-card">
      <div className="kpi-label">Avg Order Value</div>
      {loading ? (
        <div className="kpi-value kpi-value--loading">—</div>
      ) : (
        <>
          <div className="kpi-value kpi-value--mono">{fmt$(avg)}</div>
          <div className="kpi-meta">per transaction</div>
        </>
      )}
    </div>
  );
}

// ── Widget: Attention Feed ─────────────────────────────────────────────────

function AttentionFeedWidget({ products, loading }) {
  const outOfStock = products.filter(p => Number(p.stock) === 0);
  const runningLow = products
    .filter(p => {
      const s = Number(p.stock);
      const par = Number(p.par_level) || 10;
      return s > 0 && s < par;
    })
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  const totalAlerts = outOfStock.length + runningLow.length;
  const allClear    = totalAlerts === 0;

  const badge = allClear
    ? { cls: "dash-badge dash-badge--ok",       text: "All clear" }
    : outOfStock.length > 0
    ? { cls: "dash-badge dash-badge--critical",  text: `${totalAlerts} alert${totalAlerts !== 1 ? "s" : ""}` }
    : { cls: "dash-badge dash-badge--warn",      text: `${totalAlerts} alert${totalAlerts !== 1 ? "s" : ""}` };

  const visibleOut = outOfStock.slice(0, 4);
  const moreOut    = outOfStock.length - visibleOut.length;
  const visibleLow = runningLow.slice(0, 5);
  const moreLow    = runningLow.length - visibleLow.length;

  return (
    <div className="dash-widget-card dash-attention-card">
      <div className="dash-widget-header">
        <h2 className="dash-widget-title">Needs Attention</h2>
        <span className={badge.cls}>{badge.text}</span>
      </div>

      {loading ? (
        <p className="dash-widget-empty">Loading…</p>
      ) : allClear ? (
        <div className="dash-all-clear">
          <span className="dash-all-clear-icon">✓</span>
          <p className="dash-all-clear-text">All inventory items are well-stocked.</p>
        </div>
      ) : (
        <div className="dash-alert-body">
          {visibleOut.length > 0 && (
            <div className="dash-alert-section">
              <span className="dash-alert-label dash-alert-label--critical">Out of stock</span>
              <ul className="dash-stock-list">
                {visibleOut.map(p => (
                  <li key={p.id} className="dash-stock-row">
                    <span className="dash-stock-name">{p.name}</span>
                    <span className="dash-stock-badge dash-stock-badge--critical">0 left</span>
                  </li>
                ))}
              </ul>
              {moreOut > 0 && (
                <span className="dash-alert-overflow">+{moreOut} more</span>
              )}
            </div>
          )}

          {visibleLow.length > 0 && (
            <div className="dash-alert-section">
              <span className="dash-alert-label dash-alert-label--warn">Below par level</span>
              <ul className="dash-stock-list">
                {visibleLow.map(p => (
                  <li key={p.id} className="dash-stock-row">
                    <span className="dash-stock-name">{p.name}</span>
                    <span className={`dash-stock-badge ${
                      Number(p.stock) <= 3
                        ? "dash-stock-badge--critical"
                        : "dash-stock-badge--low"
                    }`}>
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
              {moreLow > 0 && (
                <span className="dash-alert-overflow">+{moreLow} more</span>
              )}
            </div>
          )}
        </div>
      )}

      <Link to="/inventory" className="dash-widget-action">View inventory →</Link>
    </div>
  );
}

// ── Widget: Sales Trend Sparkline ──────────────────────────────────────────

function SalesTrendWidget({ transactions, loading, isManager }) {
  const chronological = [...transactions].reverse();
  const chartData = chronological.slice(-30).map((t, i) => ({
    n: i + 1,
    revenue: Number(t.total || 0),
  }));

  const txnCount   = transactions.length;
  const totalRev   = transactions.reduce((s, t) => s + Number(t.total || 0), 0);
  const avgOrder   = txnCount > 0 ? totalRev / txnCount : 0;

  return (
    <div className="dash-widget-card dash-sparkline-card">
      <div className="dash-widget-header">
        <h2 className="dash-widget-title">Sales Trend</h2>
        <span className="dash-widget-meta">
          last {Math.min(30, txnCount)} transactions
        </span>
      </div>

      {loading ? (
        <p className="dash-widget-empty">Loading…</p>
      ) : chartData.length < 2 ? (
        <p className="dash-widget-empty">Not enough data to show a trend yet.</p>
      ) : (
        <div className="dash-sparkline-body">
          <div className="dash-sparkline-stats">
            <div className="dash-sparkline-stat">
              <span className="dash-sparkline-stat-value">{txnCount}</span>
              <span className="dash-sparkline-stat-label">transactions</span>
            </div>
            {isManager && (
              <>
                <div className="dash-sparkline-stat">
                  <span className="dash-sparkline-stat-value">{fmt$(totalRev)}</span>
                  <span className="dash-sparkline-stat-label">total revenue</span>
                </div>
                <div className="dash-sparkline-stat">
                  <span className="dash-sparkline-stat-value">{fmt$(avgOrder)}</span>
                  <span className="dash-sparkline-stat-label">avg order</span>
                </div>
              </>
            )}
          </div>

          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#A8693F" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#A8693F" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-1)",
                  boxShadow: "0 2px 8px rgba(43,32,23,0.08)",
                }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                labelFormatter={(n) => `Transaction #${n}`}
                cursor={{ stroke: "var(--border-s)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#A8693F"
                strokeWidth={1.5}
                fill="url(#spkGrad)"
                dot={false}
                activeDot={{ r: 3, fill: "#A8693F", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <Link to="/sales/transactions" className="dash-widget-action">
        View all transactions →
      </Link>
    </div>
  );
}

// ── Widget: Top Sellers ────────────────────────────────────────────────────

function TopSellersWidget() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    api.get("/reports/top-products")
      .then(res => setData(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const top5   = data.slice(0, 5);
  const maxQty = top5.reduce((max, r) => Math.max(max, Number(r.total_qty || 0)), 0);

  return (
    <div className="dash-widget-card">
      <div className="dash-widget-header">
        <h2 className="dash-widget-title">Top Sellers</h2>
        <span className="dash-widget-meta">by quantity sold</span>
      </div>

      {loading ? (
        <p className="dash-widget-empty">Loading…</p>
      ) : error ? (
        <p className="dash-widget-empty">Could not load data.</p>
      ) : data.length === 0 ? (
        <p className="dash-widget-empty">No sales data yet.</p>
      ) : (
        <ul className="dash-sellers-list">
          {top5.map((row, i) => {
            const qty = Number(row.total_qty || 0);
            const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
            return (
              <li key={row.id} className="dash-seller-row">
                <span className="dash-seller-rank">{i + 1}</span>
                <span className="dash-seller-name">{row.name}</span>
                <div className="dash-seller-bar-wrap">
                  <div className="dash-seller-bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="dash-seller-qty">{qty}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Widget: Recent Orders ──────────────────────────────────────────────────

function RecentOrdersWidget({ transactions, loading }) {
  const recent = transactions.slice(0, 6);

  const statusColor = (status) => {
    if (!status) return "dash-order-status--neutral";
    switch (status.toLowerCase()) {
      case "completed": return "dash-order-status--done";
      case "preparing": return "dash-order-status--active";
      case "ready":     return "dash-order-status--ready";
      default:          return "dash-order-status--queued";
    }
  };

  return (
    <div className="dash-widget-card">
      <div className="dash-widget-header">
        <h2 className="dash-widget-title">Recent Orders</h2>
        <Link to="/sales/transactions" className="dash-widget-link">View all</Link>
      </div>

      {loading ? (
        <p className="dash-widget-empty">Loading…</p>
      ) : recent.length === 0 ? (
        <p className="dash-widget-empty">No orders yet. Create your first one.</p>
      ) : (
        <ul className="dash-orders-list">
          {recent.map(t => (
            <li key={t.id} className="dash-order-row">
              <div className="dash-order-left">
                <span className="dash-order-id">#{t.id}</span>
                <div className="dash-order-info">
                  <span className="dash-order-customer">
                    {t.customer && t.customer !== "Walk-in customer"
                      ? t.customer
                      : "Walk-in"}
                  </span>
                  <span className="dash-order-meta">
                    {t.total_items} item{t.total_items !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="dash-order-right">
                {t.status && (
                  <span className={`dash-order-status ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                )}
                <span className="dash-order-total">
                  ${Number(t.total || 0).toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main DashboardPage ─────────────────────────────────────────────────────

function DashboardPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const [transactions, setTransactions] = useState([]);
  const [products,     setProducts]     = useState([]);
  const [txnLoading,   setTxnLoading]   = useState(true);
  const [prodLoading,  setProdLoading]  = useState(true);

  useEffect(() => {
    api.get("/transactions")
      .then(res => setTransactions(res.data || []))
      .catch(err => console.error("Failed to load transactions:", err))
      .finally(() => setTxnLoading(false));

    api.get("/products")
      .then(res => setProducts(res.data || []))
      .catch(err => console.error("Failed to load products:", err))
      .finally(() => setProdLoading(false));
  }, []);

  return (
    <div className="dashboard">

      {/* Greeting header */}
      <GreetingHeader user={user} />

      {/* KPI row */}
      <section className={`dashboard-kpis${isManager ? "" : " dashboard-kpis--sm"}`}>
        {isManager && <RevenueKpi transactions={transactions} loading={txnLoading} />}
        {isManager && <AvgOrderKpi transactions={transactions} loading={txnLoading} />}
        <ActiveOrdersKpi transactions={transactions} loading={txnLoading} />
        <InventoryHealthKpi products={products} loading={prodLoading} />
      </section>

      {/* Trend + Attention */}
      <section className="dashboard-trend">
        <SalesTrendWidget transactions={transactions} loading={txnLoading} isManager={isManager} />
        <AttentionFeedWidget products={products} loading={prodLoading} />
      </section>

      {/* Recent orders + Top sellers */}
      <section className={`dashboard-activity${isManager ? "" : " dashboard-activity--single"}`}>
        <RecentOrdersWidget transactions={transactions} loading={txnLoading} />
        {isManager && <TopSellersWidget />}
      </section>

    </div>
  );
}

export default DashboardPage;
