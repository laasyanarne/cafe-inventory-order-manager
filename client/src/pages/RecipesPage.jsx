import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Plus, ChevronRight } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../components/ConfirmDialog";
import "./RecipesPage.css";

// ── Status helpers ─────────────────────────────────────────────────────────

function ingStatus(qty, min) {
  const q = qty ?? 0, m = min ?? 0;
  if (q === 0) return "out";
  if (m > 0) {
    if (q < m * 0.5) return "critical";
    if (q < m)       return "low";
  }
  return "ok";
}

const STATUS_LABEL = { ok: "OK", low: "Low", critical: "Critical", out: "Out" };

function SortArrow({ field, current, dir }) {
  if (field !== current) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon-active">{dir === "asc" ? "↑" : "↓"}</span>;
}

// ── Stock progress bar (ingredient) ───────────────────────────────────────

function IngBar({ qty, min }) {
  const pct = min > 0 ? Math.min(100, Math.round((qty / min) * 100)) : null;
  const status = ingStatus(qty, min);
  if (pct === null) return null;
  return (
    <div className="rec-ing-bar-wrap">
      <div className={`rec-ing-bar rec-ing-bar--${status}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Ingredient Picker (searchable select for add form) ────────────────────

function IngredientPicker({ allIngredients, usedIds, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const available = allIngredients.filter(
    i => !usedIds.has(i.id) && i.name.toLowerCase().includes(query.toLowerCase())
  );

  const selected = value ? allIngredients.find(i => i.id === value) : null;

  const handleSelect = (ing) => {
    onChange(ing);
    setQuery(ing.name);
    setOpen(false);
  };

  return (
    <div className="rec-picker" ref={wrapRef}>
      <input
        className="form-input rec-picker-input"
        placeholder="Search ingredient…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(null); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && available.length > 0 && (
        <div className="rec-picker-dropdown">
          {available.slice(0, 12).map(i => (
            <button
              key={i.id}
              type="button"
              className={`rec-picker-option${ingStatus(i.quantity, i.min_quantity) !== "ok" ? " rec-picker-option--warn" : ""}`}
              onMouseDown={() => handleSelect(i)}
            >
              <span className="rec-picker-name">{i.name}</span>
              <span className="rec-picker-stock">
                {i.quantity} {i.unit}
                {ingStatus(i.quantity, i.min_quantity) !== "ok" && (
                  <span className={`rec-picker-status rec-picker-status--${ingStatus(i.quantity, i.min_quantity)}`}>
                    {STATUS_LABEL[ingStatus(i.quantity, i.min_quantity)]}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="rec-picker-preview">
          {selected.quantity} {selected.unit} in stock
          {selected.min_quantity > 0 && ` · min ${selected.min_quantity} ${selected.unit}`}
        </div>
      )}
    </div>
  );
}

// ── Recipe Drawer ─────────────────────────────────────────────────────────

function RecipeDrawer({ productId, productName, productCategory, productPrice, onClose, onRecipeChanged, isManager }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [recipe,         setRecipe]         = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [addIngredient,  setAddIngredient]  = useState(null);
  const [addQty,         setAddQty]         = useState("1");
  const [addSaving,      setAddSaving]      = useState(false);

  // qty editing state: { [ingredient_id]: value_string }
  const [editQty, setEditQty] = useState({});

  const loadRecipe = async () => {
    try {
      const res = await api.get(`/recipes/${productId}`);
      setRecipe(res.data);
    } catch (err) {
      console.error("Failed to load recipe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setRecipe(null);
    setShowAddForm(false);
    setEditQty({});
    loadRecipe();
    api.get("/recipes/ingredients")
      .then(res => setAllIngredients(res.data || []))
      .catch(() => {});
  }, [productId]);

  const usedIds = new Set((recipe?.ingredients || []).map(i => i.ingredient_id));

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addIngredient) return;
    const qty = parseFloat(addQty);
    if (!qty || qty <= 0) return;
    setAddSaving(true);
    try {
      await api.post(`/recipes/${productId}/ingredients`, {
        ingredient_id: addIngredient.id,
        qty_per_serve: qty,
      });
      setShowAddForm(false);
      setAddIngredient(null);
      setAddQty("1");
      await loadRecipe();
      onRecipeChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add ingredient");
    } finally {
      setAddSaving(false);
    }
  };

  const handleQtyBlur = async (ingredient_id, currentQty) => {
    const raw = editQty[ingredient_id];
    if (raw === undefined) return;
    const val = parseFloat(raw);
    if (!val || val <= 0 || val === currentQty) {
      setEditQty(prev => { const n = { ...prev }; delete n[ingredient_id]; return n; });
      return;
    }
    try {
      await api.put(`/recipes/${productId}/ingredients/${ingredient_id}`, {
        qty_per_serve: val,
      });
      await loadRecipe();
      onRecipeChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update quantity");
    }
    setEditQty(prev => { const n = { ...prev }; delete n[ingredient_id]; return n; });
  };

  const handleRemove = async (ingredient_id) => {
    const ok = await confirm({
      title: "Remove Ingredient",
      message: "Remove this ingredient from the recipe?",
      confirmLabel: "Remove",
    });
    if (!ok) return;
    try {
      await api.delete(`/recipes/${productId}/ingredients/${ingredient_id}`);
      await loadRecipe();
      onRecipeChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove ingredient");
    }
  };

  const unit = addIngredient?.unit ?? "";

  return (
    <div className="inv-drawer rec-drawer">
      {/* Header */}
      <div className="inv-drawer-header">
        <div className="inv-drawer-title-group">
          {productCategory && (
            <span className="inv-drawer-cat">{productCategory}</span>
          )}
          <h2 className="inv-drawer-title">{productName}</h2>
          <span className="rec-drawer-price">
            ${(productPrice || 0).toFixed(2)}
          </span>
        </div>
        <button className="inv-drawer-close" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      {/* Recipe section */}
      <div className="inv-drawer-section">
        <div className="rec-section-header">
          <h3 className="inv-drawer-section-title">Recipe</h3>
          {isManager && !showAddForm && (
            <button
              className="btn btn-secondary btn-xs rec-add-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={12} /> Add Ingredient
            </button>
          )}
        </div>

        {loading ? (
          <p className="loading-state" style={{ padding: "16px 0" }}>Loading…</p>
        ) : (
          <>
            {/* Ingredient list */}
            {(recipe?.ingredients || []).length === 0 && !showAddForm && (
              <p className="rec-empty-recipe">
                No ingredients yet. Add the first one to start tracking servings.
              </p>
            )}

            {(recipe?.ingredients || []).map(ing => {
              const status = ingStatus(ing.stock_qty, ing.min_qty);
              const qtyVal = editQty[ing.ingredient_id] !== undefined
                ? editQty[ing.ingredient_id]
                : String(ing.qty_per_serve);
              return (
                <div key={ing.ingredient_id} className={`rec-ing-row rec-ing-row--${status}`}>
                  <div className="rec-ing-top">
                    <span className="rec-ing-name">{ing.ingredient_name}</span>
                    {isManager && (
                      <button
                        className="rec-ing-remove"
                        title="Remove from recipe"
                        onClick={() => handleRemove(ing.ingredient_id)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="rec-ing-qty-row">
                    <input
                      className="form-input rec-ing-qty-input"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={qtyVal}
                      readOnly={!isManager}
                      onChange={isManager ? e =>
                        setEditQty(prev => ({ ...prev, [ing.ingredient_id]: e.target.value }))
                        : undefined}
                      onBlur={isManager ? () => handleQtyBlur(ing.ingredient_id, ing.qty_per_serve) : undefined}
                      title={isManager ? "Click to edit quantity per serving" : "Quantity per serving"}
                    />
                    <span className="rec-ing-unit">{ing.unit} per serving</span>
                  </div>
                  <div className="rec-ing-stock-row">
                    <IngBar qty={ing.stock_qty} min={ing.min_qty} />
                    <span className="rec-ing-stock-text">
                      {ing.stock_qty} {ing.unit} in stock
                    </span>
                    <span className="rec-ing-servings">
                      {ing.servings_possible} srv
                    </span>
                    <span className={`inv-status-chip inv-status-${status}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add ingredient form */}
            {showAddForm && (
              <form className="rec-add-form" onSubmit={handleAddSubmit}>
                <div className="rec-add-form-title">Add Ingredient</div>
                <IngredientPicker
                  allIngredients={allIngredients}
                  usedIds={usedIds}
                  value={addIngredient?.id ?? null}
                  onChange={setAddIngredient}
                />
                <div className="rec-add-qty-row">
                  <div className="form-field">
                    <label className="form-label">Per serving</label>
                    <div className="rec-add-qty-wrap">
                      <input
                        className="form-input rec-add-qty-input"
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={addQty}
                        onChange={e => setAddQty(e.target.value)}
                        required
                      />
                      {unit && <span className="rec-add-unit">{unit}</span>}
                    </div>
                  </div>
                </div>
                <div className="rec-add-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setShowAddForm(false); setAddIngredient(null); setAddQty("1"); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!addIngredient || addSaving}
                  >
                    {addSaving ? "Adding…" : "Add to Recipe"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Estimated servings summary */}
      {!loading && recipe && (recipe.ingredients || []).length > 0 && (
        <div className="inv-drawer-section rec-servings-section">
          <h3 className="inv-drawer-section-title">Estimated Servings</h3>
          <div className="rec-servings-val">
            {recipe.servings_possible ?? "—"}
          </div>
          {recipe.limiting_ingredient && (
            <div className="rec-limiting">
              <span className="rec-limiting-label">Limiting ingredient:</span>
              <span className="rec-limiting-name">{recipe.limiting_ingredient}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="inv-drawer-footer">
        <Link to="/inventory" className="inv-drawer-menu-link">
          View in Inventory <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RecipesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDir,   setSortDir]   = useState("asc");
  const [selected,  setSelected]  = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/recipes");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Refresh selected product data after recipe edits
  const handleRecipeChanged = () => load();

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // Summary counts
  const withRecipe  = products.filter(p => p.ingredient_count > 0).length;
  const noRecipe    = products.filter(p => p.ingredient_count === 0).length;
  const withShortage = products.filter(p => p.has_shortage).length;

  // Filter
  const q = search.toLowerCase();
  let visible = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );
  if (filter === "has_recipe")  visible = visible.filter(p => p.ingredient_count > 0);
  if (filter === "no_recipe")   visible = visible.filter(p => p.ingredient_count === 0);
  if (filter === "shortage")    visible = visible.filter(p => p.has_shortage);

  // Sort
  const sorted = [...visible].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "name")     return dir * a.name.localeCompare(b.name);
    if (sortField === "category") return dir * (a.category || "").localeCompare(b.category || "");
    if (sortField === "recipe")   return dir * (a.ingredient_count - b.ingredient_count);
    if (sortField === "servings") {
      const sa = a.servings_possible ?? -1;
      const sb = b.servings_possible ?? -1;
      return dir * (sa - sb);
    }
    return 0;
  });

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Recipes</h1>
          <p className="page-subtitle">Ingredient assignments and menu coverage</p>
        </div>
      </header>
      {/* Summary bar */}
      <div className="inv-summary">
        <button
          className={`inv-summary-stat${filter === "has_recipe" ? " inv-summary-stat--active" : ""}`}
          onClick={() => setFilter(f => f === "has_recipe" ? "all" : "has_recipe")}
        >
          <span className="inv-summary-val inv-summary-val--ok">{withRecipe}</span>
          <span className="inv-summary-label">with recipe</span>
        </button>
        <div className="inv-summary-divider" />
        <button
          className={`inv-summary-stat${filter === "no_recipe" ? " inv-summary-stat--active" : ""}`}
          onClick={() => setFilter(f => f === "no_recipe" ? "all" : "no_recipe")}
        >
          <span className="inv-summary-val">{noRecipe}</span>
          <span className="inv-summary-label">no recipe</span>
        </button>
        <div className="inv-summary-divider" />
        <button
          className={`inv-summary-stat${filter === "shortage" ? " inv-summary-stat--active" : ""}`}
          onClick={() => setFilter(f => f === "shortage" ? "all" : "shortage")}
        >
          <span className="inv-summary-val inv-summary-val--warn">{withShortage}</span>
          <span className="inv-summary-label">with shortage</span>
        </button>
      </div>

      {/* Table + Drawer */}
      <div className="inv-health-layout">
        <div className="card inv-health-card">
          <div className="card-header">
            <span className="card-title">Recipe Library</span>
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
            <p className="loading-state">Loading recipes…</p>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">
                {search || filter !== "all" ? "No matching products" : "No products yet"}
              </p>
              <p className="empty-state-desc">
                {search || filter !== "all"
                  ? "Try a different search or filter."
                  : "Add products from the Menu page first."}
              </p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="th-sortable" onClick={() => handleSort("name")}>
                      Name <SortArrow field="name" current={sortField} dir={sortDir} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort("category")}>
                      Category <SortArrow field="category" current={sortField} dir={sortDir} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort("recipe")}>
                      Recipe <SortArrow field="recipe" current={sortField} dir={sortDir} />
                    </th>
                    <th className="th-right th-sortable" onClick={() => handleSort("servings")}>
                      Servings <SortArrow field="servings" current={sortField} dir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(p => {
                    const isSelected = selected?.product_id === p.product_id;
                    return (
                      <tr
                        key={p.product_id}
                        className={`inv-row${isSelected ? " inv-row--selected" : ""}`}
                        onClick={() => setSelected(isSelected ? null : p)}
                      >
                        <td>
                          <span className="inv-product-name">{p.name}</span>
                        </td>
                        <td>
                          {p.category
                            ? <span className="inv-product-cat rec-cat-inline">{p.category}</span>
                            : <span className="td-muted">—</span>}
                        </td>
                        <td>
                          {p.ingredient_count > 0 ? (
                            <div className="rec-recipe-cell">
                              <span className="rec-ingredient-badge">
                                {p.ingredient_count} {p.ingredient_count === 1 ? "ingredient" : "ingredients"}
                              </span>
                              {p.has_shortage && (
                                <span className="rec-shortage-dot" title="Ingredient shortage" />
                              )}
                            </div>
                          ) : (
                            <span className="td-muted rec-no-recipe">No recipe</span>
                          )}
                        </td>
                        <td className="td-right">
                          {p.servings_possible !== null ? (
                            <span className={`rec-servings-badge${p.has_shortage ? " rec-servings-badge--warn" : ""}`}>
                              {p.servings_possible}
                            </span>
                          ) : (
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
            <RecipeDrawer
              productId={selected.product_id}
              productName={selected.name}
              productCategory={selected.category}
              productPrice={selected.price}
              onClose={() => setSelected(null)}
              onRecipeChanged={handleRecipeChanged}
              isManager={isManager}
            />
          )}
        </div>
      </div>
    </div>
  );
}
