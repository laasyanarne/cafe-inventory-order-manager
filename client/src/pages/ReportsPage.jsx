import TopProductsReport from "../components/TopProductsReport";
import AvgTransactionReport from "../components/AvgTransactionReport";
import TotalRevenueReport from "../components/TotalRevenueReport";
import CustomerCountReport from "../components/CustomerCountReport";
import LowestPriceReport from "../components/LowestPriceReport";
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
        <div className="kpi-row">
          <TotalRevenueReport />
          <AvgTransactionReport />
          <CustomerCountReport />
        </div>
        <div className="reports-grid">
          <TopProductsReport />
          <LowestPriceReport />
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;