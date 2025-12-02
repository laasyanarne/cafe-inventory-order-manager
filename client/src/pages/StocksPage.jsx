import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import StocksForm from "../components/StocksForm";
import StocksList from "../components/StocksList";
import "./StocksPage.css";

function StocksPage() {
  const { user } = useAuth();
  const listRef = useRef();

  const refresh = () => listRef.current?.refresh();

  return (
    <div className="stocks-page">
      <div className="stocks-card">
        <h1 className="stocks-title">Stocks Overview</h1>
        <StocksForm onAdded={refresh} />
        <div className="stocks-content">
          <StocksList ref={listRef} />
        </div>
      </div>
    </div>
  );
}

export default StocksPage;
