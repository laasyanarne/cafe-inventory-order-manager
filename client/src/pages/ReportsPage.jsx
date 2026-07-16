import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./ReportsPage.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt$(n) {
  return `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="rpt-kpi">
      <div className="rpt-kpi-label">{label}</div>
      <div className={`rpt-kpi-value${accent ? ` rpt-kpi-value--${accent}` : ""}`}>{value}</div>
      {sub && <div className="rpt-kpi-sub">{sub}</div>}
    </div>
  );
}

function SectionHeader({ children, action }) {
  return (
    <div className="rpt-section-header">
      <span>{children}</span>
      {action}
    </div>
  );
}

// ── Sales Tab ─────────────────────────────────────────────────────────────────

function SalesTab({ revenue, avgTxn, customerCount, categories, topProducts }) {
  const totalRevenue       = Number(revenue || 0);
  const avgOrder           = Number(avgTxn || 0);
  const uniqueCustomers    = Number(customerCount || 0);
  const revenuePerCustomer = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

  const maxCatRevenue = categories.reduce((m, c) => Math.max(m, c.revenue), 0);

  const byRevenue = [...topProducts]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
  const byQty = [...topProducts]
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 8);

  const maxRev = byRevenue[0]?.revenue || 0;
  const maxQty = byQty[0]?.total_qty   || 0;

  return (
    <div className="rpt-tab-content">
      <div className="rpt-kpi-row">
        <KpiCard label="Total Revenue"        value={fmt$(totalRevenue)}       sub="all-time gross" />
        <KpiCard label="Avg Order Value"       value={fmt$(avgOrder)}           sub="per transaction" />
        <KpiCard label="Revenue per Customer"  value={fmt$(revenuePerCustomer)} sub={`${uniqueCustomers} unique customers`} />
      </div>

      <div className="rpt-section">
        <SectionHeader>Revenue by Category</SectionHeader>
        <div className="rpt-card">
          {categories.length === 0 ? (
            <p className="loading-state">No sales data.</p>
          ) : categories.map(cat => {
            const barPct   = maxCatRevenue > 0 ? (cat.revenue / maxCatRevenue) * 100 : 0;
            const sharePct = totalRevenue  > 0 ? (cat.revenue / totalRevenue)  * 100 : 0;
            return (
              <div key={cat.category} className="rpt-cat-row">
                <span className="rpt-cat-name">{cat.category}</span>
                <div className="rpt-cat-bar-wrap">
                  <div className="rpt-cat-bar" style={{ width: `${barPct}%` }} />
                </div>
                <span className="rpt-cat-revenue">{fmt$(cat.revenue)}</span>
                <span className="rpt-cat-pct">{sharePct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rpt-section">
        <SectionHeader>Top Products</SectionHeader>
        <div className="rpt-two-col">
          <div className="rpt-card">
            <div className="rpt-card-title">By Revenue</div>
            {byRevenue.map((p, i) => (
              <div key={p.id} className="rpt-prod-row">
                <span className="rpt-prod-rank">{i + 1}</span>
                <span className="rpt-prod-name">{p.name}</span>
                <div className="rpt-prod-bar-wrap">
                  <div className="rpt-prod-bar" style={{ width: `${maxRev > 0 ? (p.revenue / maxRev) * 100 : 0}%` }} />
                </div>
                <span className="rpt-prod-val">{fmt$(p.revenue)}</span>
              </div>
            ))}
          </div>
          <div className="rpt-card">
            <div className="rpt-card-title">By Quantity Sold</div>
            {byQty.map((p, i) => (
              <div key={p.id} className="rpt-prod-row">
                <span className="rpt-prod-rank">{i + 1}</span>
                <span className="rpt-prod-name">{p.name}</span>
                <div className="rpt-prod-bar-wrap">
                  <div className="rpt-prod-bar" style={{ width: `${maxQty > 0 ? (p.total_qty / maxQty) * 100 : 0}%` }} />
                </div>
                <span className="rpt-prod-val">{Number(p.total_qty)} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu Tab ──────────────────────────────────────────────────────────────────

function MenuTab({ recipes }) {
  const total      = recipes.length;
  const withRecipe = recipes.filter(r => r.ingredient_count > 0).length;
  const noRecipe   = total - withRecipe;
  const pct        = total > 0 ? Math.round((withRecipe / total) * 100) : 0;

  // Per-category coverage
  const catMap = {};
  recipes.forEach(r => {
    if (!catMap[r.category]) catMap[r.category] = { total: 0, with: 0 };
    catMap[r.category].total++;
    if (r.ingredient_count > 0) catMap[r.category].with++;
  });
  const catBreakdown = Object.entries(catMap)
    .map(([cat, v]) => ({ cat, ...v }))
    .sort((a, b) => b.total - a.total);

  const missing = recipes
    .filter(r => r.ingredient_count === 0)
    .slice(0, 24);

  return (
    <div className="rpt-tab-content">
      <div className="rpt-kpi-row">
        <KpiCard label="Total Products"  value={total}      sub="across all categories" />
        <KpiCard label="With Recipe"     value={withRecipe} sub={`${pct}% coverage`} accent="ok" />
        <KpiCard label="Missing Recipe"  value={noRecipe}   sub="not yet linked" accent={noRecipe > 50 ? "warn" : undefined} />
      </div>

      <div className="rpt-section">
        <SectionHeader>Recipe Coverage by Category</SectionHeader>
        <div className="rpt-card">
          <div className="rpt-coverage-track">
            <div className="rpt-coverage-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="rpt-coverage-legend">
            <span className="rpt-cov-ok">{withRecipe} with recipe</span>
            <span className="rpt-cov-gap">{noRecipe} missing</span>
          </div>

          <div className="rpt-cat-cov-list">
            {catBreakdown.map(({ cat, total: t, with: w }) => {
              const catPct = t > 0 ? (w / t) * 100 : 0;
              return (
                <div key={cat} className="rpt-cat-cov-row">
                  <span className="rpt-cat-cov-name">{cat}</span>
                  <div className="rpt-cat-cov-track">
                    <div className="rpt-cat-cov-fill" style={{ width: `${catPct}%` }} />
                  </div>
                  <span className="rpt-cat-cov-frac">{w} / {t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rpt-section">
        <SectionHeader action={<Link to="/menu/recipes" className="rpt-section-link">Add recipes →</Link>}>
          Products Without Recipes
        </SectionHeader>
        <div className="rpt-card">
          {missing.length === 0 ? (
            <p className="rpt-empty-note">All products have recipes linked.</p>
          ) : (
            <div className="rpt-no-recipe-grid">
              {missing.map(p => (
                <div key={p.product_id} className="rpt-no-recipe-item">
                  <span className="rpt-no-recipe-name">{p.name}</span>
                  <span className="rpt-no-recipe-cat">{p.category}</span>
                </div>
              ))}
            </div>
          )}
          {noRecipe > 24 && (
            <p className="rpt-overflow-note">
              + {noRecipe - 24} more —{" "}
              <Link to="/menu/recipes">view all in Recipe Library</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inventory Tab ─────────────────────────────────────────────────────────────

function InventoryTab({ ingredients }) {
  const total    = ingredients.length;
  const out      = ingredients.filter(i => i.status === "out").length;
  const critical = ingredients.filter(i => i.status === "critical").length;
  const low      = ingredients.filter(i => i.status === "low").length;
  const ok       = ingredients.filter(i => i.status === "ok").length;

  const criticalItems = ingredients
    .filter(i => i.status === "out" || i.status === "critical")
    .slice(0, 12);
  const lowItems = ingredients
    .filter(i => i.status === "low")
    .slice(0, 8);

  const criticalPct = total > 0 ? ((out + critical) / total) * 100 : 0;
  const lowPct      = total > 0 ? (low              / total) * 100 : 0;
  const okPct       = total > 0 ? (ok               / total) * 100 : 0;

  return (
    <div className="rpt-tab-content">
      <div className="rpt-kpi-row">
        <KpiCard label="Total Ingredients" value={total}          sub="tracked in system" />
        <KpiCard label="Out / Critical"    value={out + critical} sub="needs restocking" accent={out + critical > 0 ? "danger" : undefined} />
        <KpiCard label="Low / Below Par"   value={low}            sub="approaching minimum" accent={low > 0 ? "warn" : undefined} />
        <KpiCard label="Healthy"           value={ok}             sub="at or above par" accent={ok > 0 ? "ok" : undefined} />
      </div>

      <div className="rpt-section">
        <SectionHeader>Stock Health Breakdown</SectionHeader>
        <div className="rpt-card">
          <div className="rpt-health-bar">
            <div className="rpt-health-seg rpt-health-seg--out"
              style={{ width: `${(out / total) * 100}%` }} title={`Out of stock: ${out}`} />
            <div className="rpt-health-seg rpt-health-seg--critical"
              style={{ width: `${(critical / total) * 100}%` }} title={`Critical: ${critical}`} />
            <div className="rpt-health-seg rpt-health-seg--low"
              style={{ width: `${lowPct}%` }} title={`Low: ${low}`} />
            <div className="rpt-health-seg rpt-health-seg--ok"
              style={{ width: `${okPct}%` }} title={`Healthy: ${ok}`} />
          </div>
          <div className="rpt-health-legend">
            <span className="rpt-hl rpt-hl--out">
              <span className="rpt-hl-dot" />Out ({out})
            </span>
            <span className="rpt-hl rpt-hl--critical">
              <span className="rpt-hl-dot" />Critical ({critical})
            </span>
            <span className="rpt-hl rpt-hl--low">
              <span className="rpt-hl-dot" />Low ({low})
            </span>
            <span className="rpt-hl rpt-hl--ok">
              <span className="rpt-hl-dot" />Healthy ({ok})
            </span>
          </div>
        </div>
      </div>

      {criticalItems.length > 0 && (
        <div className="rpt-section">
          <SectionHeader action={<Link to="/inventory" className="rpt-section-link">View all →</Link>}>
            Out of Stock &amp; Critical
          </SectionHeader>
          <div className="rpt-card">
            <div className="rpt-ing-list">
              {criticalItems.map(ing => (
                <div key={ing.id} className="rpt-ing-row">
                  <span className="rpt-ing-name">{ing.name}</span>
                  <span className={`rpt-ing-badge rpt-ing-badge--${ing.status}`}>
                    {ing.status === "out" ? "Out" : "Critical"}
                  </span>
                  <span className="rpt-ing-qty">{ing.quantity} / {ing.min_quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {lowItems.length > 0 && (
        <div className="rpt-section">
          <SectionHeader>Below Par Level</SectionHeader>
          <div className="rpt-card">
            <div className="rpt-ing-list">
              {lowItems.map(ing => (
                <div key={ing.id} className="rpt-ing-row">
                  <span className="rpt-ing-name">{ing.name}</span>
                  <span className="rpt-ing-badge rpt-ing-badge--low">Low</span>
                  <span className="rpt-ing-qty">{ing.quantity} / {ing.min_quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Labor Tab ─────────────────────────────────────────────────────────────────

function LaborTab({ shifts }) {
  const totalEmployees = shifts.length;
  const totalShifts    = shifts.reduce((s, e) => s + Number(e.total_shifts || 0), 0);
  const totalHours     = shifts.reduce((s, e) => s + Number(e.total_hours  || 0), 0);
  const totalCost      = shifts.reduce((s, e) => s + Number(e.wage_cost    || 0), 0);

  return (
    <div className="rpt-tab-content">
      <div className="rpt-kpi-row">
        <KpiCard label="Active Employees" value={totalEmployees}             sub="with shift records" />
        <KpiCard label="Total Shifts"     value={totalShifts}                sub="all recorded" />
        <KpiCard label="Total Hours"      value={totalHours.toLocaleString()} sub="across all staff" />
        <KpiCard label="Est. Labor Cost"  value={fmt$(totalCost)}            sub="hours × hourly rate" />
      </div>

      <div className="rpt-section">
        <SectionHeader>Team Hours Breakdown</SectionHeader>
        <div className="rpt-card rpt-card--table">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="td-center">Shifts</th>
                  <th className="td-center">Total Hours</th>
                  <th className="td-center">Avg Shift</th>
                  <th className="td-center">Hourly Rate</th>
                  <th className="td-center">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(e => (
                  <tr key={e.employee_id}>
                    <td>{e.name || `Employee #${e.employee_id}`}</td>
                    <td className="td-center">{e.total_shifts}</td>
                    <td className="td-center">{e.total_hours}h</td>
                    <td className="td-center td-muted">{Number(e.avg_shift).toFixed(1)}h</td>
                    <td className="td-center">{fmt$(e.wage)}/h</td>
                    <td className="td-center">{fmt$(e.wage_cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="rpt-labor-total-row">
                  <td><strong>Total</strong></td>
                  <td className="td-center">{totalShifts}</td>
                  <td className="td-center">{totalHours}h</td>
                  <td className="td-center td-muted">—</td>
                  <td className="td-center">—</td>
                  <td className="td-center">{fmt$(totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="rpt-labor-note">
            Estimated cost = recorded hours × current hourly rate. Does not include overtime, benefits, or taxes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main ReportsPage ──────────────────────────────────────────────────────────

const TABS = ["Sales", "Menu", "Inventory", "Labor"];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Sales");
  const [loading,   setLoading]   = useState(true);

  const [revenue,     setRevenue]     = useState(null);
  const [avgTxn,      setAvgTxn]      = useState(null);
  const [customers,   setCustomers]   = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recipes,     setRecipes]     = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [shifts,      setShifts]      = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/reports/total-revenue")
        .then(r => setRevenue(r.data?.total_revenue))
        .catch(() => {}),
      api.get("/reports/avg-transaction")
        .then(r => setAvgTxn(r.data?.avg_total))
        .catch(() => {}),
      api.get("/reports/customer-count")
        .then(r => setCustomers(r.data?.customer_count))
        .catch(() => {}),
      api.get("/reports/category-revenue")
        .then(r => setCategories(r.data || []))
        .catch(() => {}),
      api.get("/reports/top-products")
        .then(r => setTopProducts(r.data || []))
        .catch(() => {}),
      api.get("/recipes")
        .then(r => setRecipes(r.data || []))
        .catch(() => {}),
      api.get("/recipes/ingredients")
        .then(r => setIngredients(r.data || []))
        .catch(() => {}),
      api.get("/reports/employee/shifts")
        .then(r => setShifts(r.data || []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-state">Loading reports…</p>;

  const TAB_DESCRIPTIONS = {
    Sales:     "Revenue composition, category performance, and top-selling products",
    Menu:      "Recipe coverage across your product catalog",
    Inventory: "Ingredient stock health and restocking priorities",
    Labor:     "Scheduled hours, shift counts, and estimated payroll by team member",
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Business performance · All-time data</p>
        </div>
      </header>

      <div className="rpt-tabs-row">
        <div className="rpt-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`rpt-tab${activeTab === tab ? " rpt-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <p className="rpt-tab-desc">{TAB_DESCRIPTIONS[activeTab]}</p>
      </div>

      {activeTab === "Sales"     && (
        <SalesTab
          revenue={revenue}
          avgTxn={avgTxn}
          customerCount={customers}
          categories={categories}
          topProducts={topProducts}
        />
      )}
      {activeTab === "Menu"      && <MenuTab recipes={recipes} />}
      {activeTab === "Inventory" && <InventoryTab ingredients={ingredients} />}
      {activeTab === "Labor"     && <LaborTab shifts={shifts} />}
    </div>
  );
}

export default ReportsPage;
