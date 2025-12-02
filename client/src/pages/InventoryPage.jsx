import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import InventoryForm from "../components/InventoryForm";
import InventoryList from "../components/InventoryList";
import "../pages/InventoryPage.css";  // make sure this line is here

function InventoryPage() {
  const { user } = useAuth();
  const listRef = useRef();

  const refresh = () => listRef.current?.refresh();

  return (
    <div className="inventory-page">
      <div className="inventory-card">
        <h1 className="inventory-title">Inventory Management</h1>
        <InventoryForm onAdded={refresh} />
        <InventoryList ref={listRef} />
      </div>
    </div>
  );
}

export default InventoryPage;
