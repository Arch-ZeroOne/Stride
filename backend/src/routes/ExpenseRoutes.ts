import { Router } from "express";
import * as expenseController from "../controllers/ExpenseController";

const router = Router();

// ─── READ ─────────────────────────────────────────────────────────────────────
// GET all expenses
router.get("/expenses", expenseController.getAllExpenses);

// GET a single expense by expense_id
router.get("/expenses/:id", expenseController.getExpenseById);

// ─── CREATE ───────────────────────────────────────────────────────────────────
// POST a new expense; body: { amount, expense_category, expense_date }
router.post("/expenses", expenseController.addExpense);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PATCH expense details by expense_id
router.patch("/expenses/:id", expenseController.updateExpense);

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE an expense permanently by expense_id
router.delete("/expenses/:id", expenseController.deleteExpense);

export default router;
