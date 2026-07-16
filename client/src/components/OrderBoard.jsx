import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

// ── Status column definitions ─────────────────────────────────────────────

const COLS = [
  { key: "queued",    label: "Queued",    next: "preparing", action: "Start Preparing" },
  { key: "preparing", label: "Preparing", next: "ready",     action: "Mark Ready"      },
  { key: "ready",     label: "Ready",     next: "completed", action: "Complete Order"  },
];

// Tab accent class by column key (used on mobile)
const TAB_ACCENT = {
  queued:    "",
  preparing: "ob-mobile-tab--preparing",
  ready:     "ob-mobile-tab--ready",
};

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 5)     return "just now";
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  return `${Math.floor(diff / 86400)}d`;
}

// ── Order Card ────────────────────────────────────────────────────────────

function OrderCard({ order, colKey, onAdvance }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const col         = COLS.find(c => c.key === colKey);
  const displayName = order.customer === "Walk-in customer" ? "Walk-in" : order.customer;

  const handleAdvance = async () => {
    if (!col) return;
    setBusy(true);
    try {
      await api.patch(`/transactions/${order.id}/status`, { status: col.next });
      onAdvance();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update order status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`order-card order-card--${colKey}`}>
      <div className="order-card-header">
        <span className="order-card-id">#{order.id}</span>
        <span className="order-card-time">{timeAgo(order.created_at)}</span>
      </div>

      <div className="order-card-customer">{displayName}</div>

      <div className="order-card-meta">
        {order.total_items} item{order.total_items !== 1 ? "s" : ""}
        <span className="order-card-dot">·</span>
        <span className="order-card-total">${Number(order.total || 0).toFixed(2)}</span>
      </div>

      {order.items?.length > 0 && (
        <div className="order-card-items">
          {order.items.slice(0, 3).map(item => (
            <span key={item.product_id} className="order-card-item-tag">
              {item.qty}× {item.name}
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="order-card-item-more">+{order.items.length - 3} more</span>
          )}
        </div>
      )}

      {order.order_note && (
        <div className="order-card-note">"{order.order_note}"</div>
      )}

      {col && (
        <button
          className={`btn btn-sm order-card-action order-card-action--${colKey}`}
          onClick={handleAdvance}
          disabled={busy}
        >
          {busy ? "Updating…" : col.action}
        </button>
      )}
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────

const EMPTY_LABELS = {
  queued:    "No orders queued",
  preparing: "Kitchen is clear",
  ready:     "No orders waiting",
};

const OrderBoard = forwardRef(function OrderBoard(_props, ref) {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeCol, setActiveCol] = useState("queued");

  const load = useCallback(async () => {
    try {
      const res    = await api.get("/transactions");
      const active = (res.data || []).filter(t => t.status !== "completed");
      setOrders(active);
    } catch (err) {
      console.error("Failed to load active orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useImperativeHandle(ref, () => ({ refresh: load }));

  if (loading) return <p className="loading-state">Loading active orders…</p>;

  const colCounts = Object.fromEntries(
    COLS.map(col => [col.key, orders.filter(o => o.status === col.key).length])
  );

  return (
    <>
      {/* Mobile status tabs — hidden on desktop via CSS */}
      <div className="ob-mobile-tabs">
        {COLS.map(col => {
          const isActive   = activeCol === col.key;
          const hasOrders  = colCounts[col.key] > 0;
          const cls = [
            "ob-mobile-tab",
            TAB_ACCENT[col.key],
            isActive   ? "ob-mobile-tab--active"     : "",
            hasOrders  ? "ob-mobile-tab--has-orders"  : "",
          ].filter(Boolean).join(" ");
          return (
            <button key={col.key} className={cls} onClick={() => setActiveCol(col.key)}>
              <span className="ob-mobile-tab-count">{colCounts[col.key]}</span>
              <span className="ob-mobile-tab-label">{col.label}</span>
            </button>
          );
        })}
      </div>

      {/* Board — desktop shows all 3 columns; mobile hides inactive column */}
      <div className="order-board">
        {COLS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key);
          const colCls = [
            "order-col",
            `order-col--${col.key}`,
            activeCol !== col.key ? "order-col--mobile-hidden" : "",
          ].filter(Boolean).join(" ");
          return (
            <div key={col.key} className={colCls}>
              <div className="order-col-header">
                <span className="order-col-label">{col.label}</span>
                <span className="order-col-count">{colOrders.length}</span>
              </div>
              <div className="order-col-cards">
                {colOrders.length === 0 ? (
                  <p className="order-col-empty">{EMPTY_LABELS[col.key]}</p>
                ) : (
                  colOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      colKey={col.key}
                      onAdvance={load}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});

export default OrderBoard;
