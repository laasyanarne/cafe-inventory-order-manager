import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./StockHealthPage.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function getStatus(p) {
  const stock = Number(p.stock ?? 0);
  const par   = Number(p.par_level ?? 0);

  if (stock === 0) return { label: "Out of Stock", level: "critical", sort: 0 };

  if (par > 0) {
    if (stock < Math.ceil(par * 0.5)) return { label: "Critical",  level: "critical", sort: 1 };
    if (stock < par)                  return { label: "Low",       level: "low",      sort: 2 };
    return                                   { label: "In Stock",  level: "ok",       sort: 3 };
  }

  // Fallback when par_level not configured — use app-wide threshold of 10
  if (stock < 10) return { label: "Low",      level: "low", sort: 2 };
  return                 { label: "In Stock", level: "ok",  sort: 3 };
}

function formatDate(dt) {
  if (!dt) return "Never";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function SortArrow({ field, current, dir }) {
  if (field !== current) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon-active">{dir === "asc" ? "↑" : "↓"}</span>;
}

// ── Detail Drawer ─────────────────────────────────────────────────────────

function StockDrawer({ product, onClose, onSaved, isManager }) {
  const toast = useToast();
  const [stockVal,    setStockVal]    = useState(String(product.stock ?? 0));
  const [unitVal,     setUnitVal]     = useState(product.unit ?? "unit");
  const [parVal,      setParVal]      = useState(String(product.par_level ?? 0));
  const [supplier,    setSupplier]    = useState(product.supplier_name ?? "");
  const [categoryVal, setCategoryVal] = useState(product.category ?? "");
  const [updSaving,   setUpdSaving]   = useState(false);
  const [setsSaving,  setSetsSaving]  = useState(false);

  useEffect(() => {
    setStockVal(String(product.stock ?? 0));
    setUnitVal(product.unit ?? "unit");
    setParVal(String(product.par_level ?? 0));
    setSupplier(product.supplier_name ?? "");
    setCategoryVal(product.category ?? "");
  }, [product.id]);

  const status = getStatus(product);
  const par    = Number(product.par_level ?? 0);
  const stock  = Number(product.stock ?? 0);
  const pct    = par > 0 ? Math.min(100, Math.round((stock / par) * 100)) : null;

  const handleUpdateStock = async () => {
    setUpdSaving(true);
    try {
      await api.put(`/products/${product.id}`, {
        name:        product.name,
        description: product.description,
        price:       product.price,
        stock:       Number(stockVal),
        unit:        unitVal,
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update stock");
    } finally {
      setUpdSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSetsSaving(true);
    try {
      await api.put(`/products/${product.id}`, {
        name:          product.name,
        description:   product.description,
        price:         product.price,
        stock:         product.stock,
        par_level:     Number(parVal) || 0,
        unit:          unitVal,
        supplier_name: supplier.trim() || null,
        category:      categoryVal.trim() || null,
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSetsSaving(false);
    }
  };

  return (
    <div className="inv-drawer">
      {/* Header */}
      <div className="inv-drawer-header">
        <div className="inv-drawer-title-group">
          {product.category && (
            <span className="inv-drawer-cat">{product.category}</span>
          )}
          <h2 className="inv-drawer-title">{product.name}</h2>
        </div>
        <button
          className="inv-drawer-close"
          onClick={onClose}
          aria-label="Close drawer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Status + on-hand */}
      <div className="inv-drawer-section">
        <span className={`inv-status-chip inv-status-${status.level}`}>
          {status.label}
        </span>
        <div className="inv-drawer-stock-row">
          <span className="inv-drawer-stock-val">{stock}</span>
          <span className="inv-drawer-stock-unit">
            {product.unit ?? "unit"} on hand
          </span>
        </div>

        {pct !== null && (
          <div className="inv-par-section">
            <div className="inv-par-meta">
              <span>Par level: {par} {product.unit ?? "unit"}</span>
              <span>{pct}% of par</span>
            </div>
            <div className="inv-par-bar-wrap">
              <div
                className={`inv-par-bar inv-par-bar--${status.level}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="inv-drawer-section inv-drawer-details">
        <div className="inv-detail-row">
          <span className="inv-detail-label">Price</span>
          <span className="inv-detail-value">
            ${parseFloat(product.price || 0).toFixed(2)}
          </span>
        </div>
        {product.description && (
          <div className="inv-detail-row">
            <span className="inv-detail-label">Description</span>
            <span className="inv-detail-value">{product.description}</span>
          </div>
        )}
        <div className="inv-detail-row">
          <span className="inv-detail-label">Supplier</span>
          <span className="inv-detail-value">
            {product.supplier_name || (
              <em className="inv-detail-none">Not set</em>
            )}
          </span>
        </div>
        <div className="inv-detail-row">
          <span className="inv-detail-label">Last restocked</span>
          <span className="inv-detail-value">
            {formatDate(product.last_restocked_at)}
          </span>
        </div>
      </div>

      {/* Update stock form — manager only */}
      {isManager && <div className="inv-drawer-section inv-drawer-form-section">
        <h3 className="inv-drawer-section-title">Update Stock</h3>
        <div className="inv-form-row-2">
          <div className="form-field">
            <label className="form-label">New quantity</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={stockVal}
              onChange={e => setStockVal(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Unit</label>
            <input
              className="form-input"
              placeholder="unit"
              value={unitVal}
              onChange={e => setUnitVal(e.target.value)}
            />
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm inv-drawer-btn"
          onClick={handleUpdateStock}
          disabled={updSaving}
        >
          {updSaving ? "Saving…" : "Update Stock"}
        </button>
      </div>}

      {/* Inventory settings form — manager only */}
      {isManager && <div className="inv-drawer-section inv-drawer-form-section">
        <h3 className="inv-drawer-section-title">Inventory Settings</h3>
        <div className="inv-form-row-2">
          <div className="form-field">
            <label className="form-label">Par level</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={parVal}
              onChange={e => setParVal(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Category</label>
            <input
              className="form-input"
              placeholder="e.g. Drinks"
              value={categoryVal}
              onChange={e => setCategoryVal(e.target.value)}
            />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Supplier</label>
          <input
            className="form-input"
            placeholder="e.g. Local Roasters LLC"
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary btn-sm inv-drawer-btn"
          onClick={handleSaveSettings}
          disabled={setsSaving}
        >
          {setsSaving ? "Saving…" : "Save Settings"}
        </button>
      </div>}

      {/* Footer */}
      <div className="inv-drawer-footer">
        <Link to="/menu" className="inv-drawer-menu-link">
          Edit full item in Menu <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function StockHealthPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [sortField, setSortField] = useState("status");
  const [sortDir,   setSortDir]   = useState("asc");
  const [selected,  setSelected]  = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Keep drawer in sync with fresh data after save
  useEffect(() => {
    if (selected) {
      const fresh = products.find(p => p.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [products]);

  const handleSaved = () => load();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Filter
  const q = search.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category     || "").toLowerCase().includes(q) ||
    (p.supplier_name || "").toLowerCase().includes(q)
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "status") {
      const diff = getStatus(a).sort - getStatus(b).sort;
      if (diff !== 0) return sortDir === "asc" ? diff : -diff;
      return a.name.localeCompare(b.name);
    }
    if (sortField === "name") {
      return sortDir === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === "stock") {
      const diff = Number(a.stock) - Number(b.stock);
      return sortDir === "asc" ? diff : -diff;
    }
    return 0;
  });

  // Summary counts
  const counts = { critical: 0, low: 0, ok: 0 };
  for (const p of products) {
    const { level } = getStatus(p);
    if (level === "critical") counts.critical++;
    else if (level === "low")  counts.low++;
    else                       counts.ok++;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Stock levels and ingredient tracking</p>
        </div>
      </header>
      {/* Summary bar */}
      <div className="inv-summary">
        <div className="inv-summary-stat inv-summary-stat--critical">
          <span className="inv-summary-val">{counts.critical}</span>
          <span className="inv-summary-label">critical / out of stock</span>
        </div>
        <div className="inv-summary-divider" />
        <div className="inv-summary-stat inv-summary-stat--low">
          <span className="inv-summary-val">{counts.low}</span>
          <span className="inv-summary-label">low / below par</span>
        </div>
        <div className="inv-summary-divider" />
        <div className="inv-summary-stat inv-summary-stat--ok">
          <span className="inv-summary-val">{counts.ok}</span>
          <span className="inv-summary-label">in stock</span>
        </div>
      </div>

      {/* Table + Drawer */}
      <div className="inv-health-layout">
        {/* Table card */}
        <div className="card inv-health-card">
          <div className="card-header">
            <span className="card-title">All Products</span>
            <div className="toolbar">
              <div className="search-wrap" style={{ maxWidth: 260 }}>
                <span className="search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  className="search-input"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="count-chip">{sorted.length}</span>
            </div>
          </div>

          {loading ? (
            <p className="loading-state">Loading inventory…</p>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">
                {search ? "No matching products" : "No products yet"}
              </p>
              <p className="empty-state-desc">
                {search
                  ? "Try a different search term."
                  : "Add products from the Menu page."}
              </p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="th-sortable"
                      onClick={() => handleSort("name")}
                    >
                      Name <SortArrow field="name" current={sortField} dir={sortDir} />
                    </th>
                    <th
                      className="th-sortable"
                      onClick={() => handleSort("status")}
                    >
                      Status <SortArrow field="status" current={sortField} dir={sortDir} />
                    </th>
                    <th
                      className="th-right th-sortable"
                      onClick={() => handleSort("stock")}
                    >
                      On Hand <SortArrow field="stock" current={sortField} dir={sortDir} />
                    </th>
                    <th className="th-right">Par Level</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(p => {
                    const status     = getStatus(p);
                    const isSelected = selected?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`inv-row${isSelected ? " inv-row--selected" : ""}`}
                        onClick={() => setSelected(isSelected ? null : p)}
                      >
                        <td>
                          <div className="inv-name-cell">
                            <span className="inv-product-name">{p.name}</span>
                            {p.category && (
                              <span className="inv-product-cat">{p.category}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`inv-status-chip inv-status-${status.level}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="td-right">
                          <span className="inv-stock-val">{p.stock}</span>
                          <span className="inv-stock-unit"> {p.unit}</span>
                        </td>
                        <td className="td-right">
                          {Number(p.par_level) > 0
                            ? <span>{p.par_level} {p.unit}</span>
                            : <span className="td-muted">—</span>
                          }
                        </td>
                        <td>
                          {p.supplier_name || (
                            <span className="td-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sliding drawer */}
        <div className={`inv-drawer-wrap${selected ? " inv-drawer-wrap--open" : ""}`}>
          {selected && (
            <StockDrawer
              product={selected}
              onClose={() => setSelected(null)}
              onSaved={handleSaved}
              isManager={isManager}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default StockHealthPage;
