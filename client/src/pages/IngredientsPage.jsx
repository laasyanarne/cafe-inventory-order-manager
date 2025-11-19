import { useRef } from "react";
import IngredientForm from "../components/IngredientForm";
import IngredientList from "../components/IngredientsList";
import "./IngredientsPage.css";

function IngredientsPage() {
  const listRef = useRef(null);

  const handleRefresh = () => {
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  return (
    <div className="ingredients-page">
      <div className="ingredients-card">
        <header className="ingredients-header">
          <h1 className="ingredients-title">Ingredient Management</h1>
        </header>

        {/* form + list live inside the card */}
        <IngredientForm onIngredientAdded={handleRefresh} />
        <IngredientList ref={listRef} />
      </div>
    </div>
  );
}

export default IngredientsPage;
