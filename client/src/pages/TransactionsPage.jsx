import { useRef, useState } from "react";
import OrderBoard from "../components/OrderBoard";
import TransactionsList from "../components/TransactionsList";
import TransactionForm from "../components/TransactionForm";
import "./TransactionsPage.css";

function TransactionsPage() {
  const boardRef = useRef(null);
  const listRef  = useRef(null);
  const [tab,         setTab]         = useState("active");
  const [editingTxn,  setEditingTxn]  = useState(null);
  const [formOpen,    setFormOpen]    = useState(false);

  const refreshAll = () => {
    boardRef.current?.refresh();
    listRef.current?.refresh();
  };

  const openNew = () => {
    setEditingTxn(null);
    setFormOpen(true);
  };

  const openEdit = (txn) => {
    setEditingTxn(txn);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingTxn(null);
    refreshAll();
    // New orders land in Active; switch there so user sees the queued card
    if (!editingTxn) setTab("active");
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingTxn(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Order Center</h1>
          <p className="page-subtitle">Active orders and transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Order</button>
      </header>

      {/* Tab switcher */}
      <div className="txn-tabs">
        <button
          className={`txn-tab${tab === "active" ? " txn-tab--active" : ""}`}
          onClick={() => setTab("active")}
        >
          Active Orders
        </button>
        <button
          className={`txn-tab${tab === "history" ? " txn-tab--active" : ""}`}
          onClick={() => setTab("history")}
        >
          History
        </button>
      </div>

      {formOpen && (
        <TransactionForm
          mode={editingTxn ? "edit" : "create"}
          initialData={editingTxn}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}

      {tab === "active" ? (
        <OrderBoard ref={boardRef} />
      ) : (
        <div className="card">
          <TransactionsList
            ref={listRef}
            onEdit={openEdit}
            statusFilter="completed"
          />
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
