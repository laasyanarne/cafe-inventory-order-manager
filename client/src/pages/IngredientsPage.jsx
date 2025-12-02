import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import InventoryForm from "../components/InventoryForm";
import InventoryList from "../components/InventoryList";
import "./InventoryPage.css";

function InventoryPage() {
  const { user } = useAuth();
  const listRef = useRef();

  const refresh = () => listRef.current?.refresh();

  return (
    <div className="inventory-page">
      <div className="inventory-card">
        <h1 className="inventory-title">Inventory Management</h1>
        <InventoryForm onAdded={refresh} />
        <div className="inventory-content">
          <InventoryList ref={listRef} />
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
