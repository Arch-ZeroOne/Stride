import * as expenseService from "../services/ExpenseService";
import { Request, Response } from "express";

// ─── GET ALL EXPENSES ─────────────────────────────────────────────────────────
// Returns a list of all expenses
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getAllExpenses();
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error:", error });
  }
};

// ─── GET EXPENSE BY ID ────────────────────────────────────────────────────────
// Returns a single expense by expense_id; 404 if not found
export const getExpenseById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res.status(200).json(expense);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────
// Creates a new expense record; responds with 201 on success
export const addExpense = async (req: Request, res: Response) => {
  try {
    const addedExpense = await expenseService.addExpense(req.body);
    return res.status(201).json(addedExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── UPDATE EXPENSE ───────────────────────────────────────────────────────────
// Updates expense details by expense_id
export const updateExpense = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const updatedExpense = await expenseService.updateExpense(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
// Permanently deletes an expense record by expense_id; 404 if not found
export const deleteExpense = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await expenseService.deleteExpense(id);

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res
      .status(200)
      .json({ message: "Expense deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
