import { useRef, useState } from "react";
import TransactionsList from "../components/TransactionsList";
import TransactionForm from "../components/TransactionForm";
import "./TransactionsPage.css";

function TransactionsPage() {
  const listRef = useRef(null);
  const [editingTxn, setEditingTxn] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleRefresh = () => {
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleNewClick = () => {
    setEditingTxn(null);
    setFormOpen(true);
  };

  const handleEditRequest = (txn) => {
    setEditingTxn(txn);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingTxn(null);
    handleRefresh();
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingTxn(null);
  };

  return (
    <div className="transactions-page">
      <div className="transactions-card">
        <header className="transactions-header">
          <h1 className="transactions-title">Transaction History</h1>
          <button
            className="transactions-new-btn"
            onClick={handleNewClick}
          >
            + New Transaction
          </button>
        </header>

        {formOpen && (
          <TransactionForm
            mode={editingTxn ? "edit" : "create"}
            initialData={editingTxn}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        <TransactionsList ref={listRef} onEdit={handleEditRequest} />
      </div>
    </div>
  );
}

export default TransactionsPage;
