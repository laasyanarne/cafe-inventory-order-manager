import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../components/ConfirmDialog";
import "./ProductsPage.css";

function SortArrow({ field, current, dir }) {
  if (field !== current) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon-active">{dir === "asc" ? "↑" : "↓"}</span>;
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  );
}

function ProductsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [dialog, setDialog] = useState(null); // null | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", unit: "unit" });
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const q = search.toLowerCase();
  const filtered = products
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    )
    .sort((a, b) => {
      if (sortField === "price" || sortField === "stock") {
        const va = parseFloat(a[sortField]) || 0;
        const vb = parseFloat(b[sortField]) || 0;
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const va = String(a[sortField] || "").toLowerCase();
      const vb = String(b[sortField] || "").toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const openAdd = () => {
    setForm({ name: "", description: "", price: "", stock: "", unit: "unit" });
    setEditTarget(null);
    setDialog("add");
  };

  const openEdit = (product) => {
    setForm({
      name:        product.name,
      description: product.description || "",
      price:       product.price,
      stock:       product.stock,
      unit:        product.unit || "unit",
    });
    setEditTarget(product);
    setDialog("edit");
  };

  const closeDialog = () => {
    setDialog(null);
    setEditTarget(null);
    setSaving(false);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim() || form.price === "") {
      toast.warning("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      if (dialog === "add") {
        await api.post("/products", form);
      } else {
        await api.put(`/products/${editTarget.id}`, form);
      }
      closeDialog();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save product");
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: "Delete Item",
      message: `Remove "${name}" from the menu? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete product");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Menu</h1>
          <p className="page-subtitle">Manage menu items and pricing</p>
        </div>
        {isManager && <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>}
      </header>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Items</span>
          <div className="toolbar">
            <div className="search-wrap" style={{ maxWidth: 280 }}>
              <span className="search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="search-input"
                placeholder="Search menu items…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span className="count-chip">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <p className="loading-state">Loading…</p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-sortable" onClick={() => handleSort("name")}>
                    Name <SortArrow field="name" current={sortField} dir={sortDir} />
                  </th>
                  <th className="menu-th-desc">Description</th>
                  <th className="th-right th-sortable" onClick={() => handleSort("price")}>
                    Price <SortArrow field="price" current={sortField} dir={sortDir} />
                  </th>
                  <th className="th-right th-sortable" onClick={() => handleSort("stock")}>
                    Stock <SortArrow field="stock" current={sortField} dir={sortDir} />
                  </th>
                  <th className="th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <p className="empty-state-title">
                          {search ? "No items match your search." : "No products yet."}
                        </p>
                        {!search && (
                          <p className="empty-state-desc">Click "+ Add Item" to get started.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id}>
                      <td><span className="menu-name">{p.name}</span></td>
                      <td className="menu-td-desc">
                        {p.description
                          ? <span className="menu-desc">{p.description}</span>
                          : <span className="td-muted">—</span>}
                      </td>
                      <td className="td-right">
                        <span className="menu-price">${parseFloat(p.price || 0).toFixed(2)}</span>
                      </td>
                      <td className="td-right td-muted">{p.stock}</td>
                      <td className="td-actions">
                        {isManager && (
                          <>
                            <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>
                              <IconEdit />
                            </button>
                            <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(p.id, p.name)}>
                              <IconTrash />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialog && (
        <div className="modal-overlay" onClick={closeDialog}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {dialog === "add" ? "Add Menu Item" : "Edit Menu Item"}
                </h2>
                {dialog === "edit" && editTarget && (
                  <p className="modal-desc">Editing: {editTarget.name}</p>
                )}
              </div>
              <button className="modal-close" onClick={closeDialog} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label form-label-required">Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Latte"
                    value={form.name}
                    onChange={e => setField("name", e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-field">
                  <label className="form-label form-label-required">Price ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setField("price", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Stock</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.stock}
                    onChange={e => setField("stock", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <input
                    className="form-input"
                    placeholder="e.g. cup, bag, kg"
                    value={form.unit}
                    onChange={e => setField("unit", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDialog}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : dialog === "add" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
