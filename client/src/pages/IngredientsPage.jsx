import { useRef } from "react";
import { useAuth } from "../context/AuthContext";

import IngredientForm from "../components/IngredientForm";
import IngredientList from "../components/IngredientsList";
import "../pages/IngredientsPage.css";

function IngredientsPage() {
  const { user } = useAuth();
  const listRef = useRef();

  const refresh = () => listRef.current?.refresh();

  return (
    <div className="ingredients-page">
      <div className="ingredients-card">
        <h1 className="ingredients-title">Ingredient Management</h1>

        <IngredientForm onIngredientAdded={refresh} />
        <IngredientList ref={listRef} />
      </div>
    </div>
  );
}

export default IngredientsPage;
