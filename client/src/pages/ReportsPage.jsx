import TopProductsReport from "../components/TopProductsReport";
import AvgTransactionReport from "../components/AvgTransactionReport";
import TotalRevenueReport from "../components/TotalRevenueReport";
import CustomerCountReport from "../components/CustomerCountReport";
import LowestPriceReport from "../components/LowestPriceReport";
import EmployeeShiftSummary from "../components/EmployeeShiftSummary";
import "./ReportsPage.css";

function ReportsPage() {
  return (
    <div className="reports-page">
      <div className="reports-card">
        {/* Manager Dashboard Section */}
        <header className="reports-header">
          <h1 className="reports-title">Manager Dashboard</h1>
          <p className="reports-subtitle">
            High-level insights from sales and transactions
          </p>
        </header>

        {/* Top row: 3 KPI cards */}
        <div className="kpi-row">
          <TotalRevenueReport />
          <AvgTransactionReport />
          <CustomerCountReport />
        </div>

        {/* Bottom row: Chart and pricing */}
        <div className="reports-grid">
          {/* Left: Top products chart */}
          <TopProductsReport />

          {/* Right: Lowest price */}
          <LowestPriceReport />
        </div>

        {/* Divider */}
        <div className="reports-divider"></div>

        {/* Employee Reports Section */}
        <header className="reports-header">
          <h1 className="reports-title">Employee Reports</h1>
          <p className="reports-subtitle">
            Shift summaries and performance metrics
          </p>
        </header>

        <EmployeeShiftSummary />
      </div>
    </div>
  );
}

export default ReportsPage;