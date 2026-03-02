import { query } from "../dbconfig";

// ─── GET ALL EXPENSES ─────────────────────────────────────────────────────────
// Fetches all expenses
export const getAllExpenses = async () => {
  const { rows } = await query(
    `SELECT 
      expense_id,
      amount,
      expense_category,
      expense_date,
      updated_at
     FROM expenses
     ORDER BY expense_id ASC`,
  );
  return rows;
};

// ─── GET EXPENSE BY ID ────────────────────────────────────────────────────────
// Fetches a single expense record by expense_id
export const getExpenseById = async (id: number) => {
  const { rows } = await query(
    `SELECT 
      expense_id,
      amount,
      expense_category,
      expense_date,
      updated_at
     FROM expenses
     WHERE expense_id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────
// Inserts a new expense record
export const addExpense = async (expense: any) => {
  const { amount, expense_category, expense_date } = expense;

  const { rows } = await query(
    `INSERT INTO expenses 
      (amount, expense_category, expense_date, updated_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [amount, expense_category, expense_date],
  );
  return rows[0];
};

// ─── UPDATE EXPENSE ───────────────────────────────────────────────────────────
// Updates editable fields of an expense by expense_id
export const updateExpense = async (id: string, expense: any) => {
  const { amount, expense_category, expense_date } = expense;

  const { rows } = await query(
    `UPDATE expenses
     SET 
       amount            = $1,
       expense_category  = $2,
       expense_date      = $3,
       updated_at        = NOW()
     WHERE expense_id = $4
     RETURNING *`,
    [amount, expense_category, expense_date, id],
  );
  return rows[0];
};

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
// Permanently removes an expense record by expense_id
export const deleteExpense = async (id: number) => {
  const { rows } = await query(
    `DELETE FROM expenses WHERE expense_id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
};
