import { Route, Routes } from "react-router";
import Budgets from "../pages/Budgests";
import BudgetDetail from "../pages/BudgestDetail";
import CreateBudget from "../pages/CreateBudget";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Budgets />} />
      <Route path="/budget/:id" element={<BudgetDetail />} />
      <Route path="/create" element={<CreateBudget />} />
    </Routes>
  );
}