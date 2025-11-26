import TopProductsReport from "../components/TopProductsReport";
import AvgTransactionReport from "../components/AvgTransactionReport";
import "./ReportsPage.css";

function ReportsPage() {
  return (
    <div className="reports-page">
      <div className="reports-card">
        <header className="reports-header">
          <h1 className="reports-title">Manager Dashboard</h1>
          <p className="reports-subtitle">
            High-level insights from sales and transactions
          </p>
        </header>

        <div className="reports-grid">
          {/* Left: Top products chart */}
          <TopProductsReport />

          {/* Right: Average transaction card */}
          <AvgTransactionReport />
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
