import React, { useState, useEffect, useMemo } from "react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import {
  Receipt,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Tag,
  CalendarDays,
} from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

type Expense = {
  expense_id: number;
  amount: number;
  expense_category: string;
  expense_date: string;
  updated_at: string;
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: "#1a2035",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#e2e8f0",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  fontFamily: "'Sora', 'DM Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#475569",
  marginBottom: "6px",
  display: "block",
};

// ─── Expense Categories ───────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "Utilities",
  "Rent",
  "Supplies",
  "Salaries",
  "Marketing",
  "Maintenance",
  "Transportation",
  "Miscellaneous",
];

// ─── ID Cell Renderer ─────────────────────────────────────────────────────────
const IdCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span
        className="px-2 py-0.5 rounded-md text-xs font-mono font-bold"
        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
      >
        #{data.expense_id}
      </span>
    </div>
  );
};

// ─── Category Cell Renderer ───────────────────────────────────────────────────
const CategoryCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span
        className="px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
      >
        {data.expense_category}
      </span>
    </div>
  );
};

// ─── Action Cell Renderer ─────────────────────────────────────────────────────
interface ActionCellProps extends ICellRendererParams {
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const ActionCellRenderer: React.FC<ActionCellProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  if (!data) return null;
  return (
    <div className="flex items-center gap-1.5 h-full">
      <button
        onClick={() => onEdit(data)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: "rgba(251,191,36,0.1)",
          color: "#fbbf24",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(251,191,36,0.22)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(251,191,36,0.1)")
        }
        title="Edit"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={() => onDelete(data.expense_id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: "rgba(239,68,68,0.1)",
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(239,68,68,0.22)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(239,68,68,0.1)")
        }
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

// ─── Manage Expense Form ──────────────────────────────────────────────────────
interface ManageExpenseProps {
  mode: "Add" | "Update";
  initialData?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ManageExpenseForm: React.FC<ManageExpenseProps> = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [amount, setAmount] = useState<string>(
    initialData ? String(initialData.amount) : "",
  );
  const [expense_category, setCategory] = useState<string>(
    initialData?.expense_category ?? "",
  );
  const [expense_date, setDate] = useState<string>(
    initialData?.expense_date
      ? initialData.expense_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid amount",
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
      });
      return;
    }
    if (!expense_category) {
      Swal.fire({
        title: "Error!",
        text: "Please select a category",
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
      });
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      expense_category,
      expense_date,
    };

    try {
      setIsSubmitting(true);
      if (mode === "Add") {
        await client.post("/expenses", payload);
        Swal.fire({
          title: "Success!",
          text: "Expense added successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#111827",
          color: "#e2e8f0",
        });
      } else {
        await client.patch(`/expenses/${initialData!.expense_id}`, payload);
        Swal.fire({
          title: "Updated!",
          text: "Expense updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#111827",
          color: "#e2e8f0",
        });
      }
      onSuccess();
    } catch {
      Swal.fire({
        title: "Error!",
        text: `Failed to ${mode === "Add" ? "add" : "update"} expense`,
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusGreen = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => (e.currentTarget.style.border = "1px solid rgba(16,185,129,0.4)");
  const blurGray = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)");

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      {/* Form Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Receipt size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {mode === "Add" ? "Add New Expense" : "Update Expense"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {mode === "Add"
                ? "Fill in the details to record a new expense"
                : "Edit the expense details below"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "#475569",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount */}
        <div>
          <span style={labelStyle}>
            Amount (₱) <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: "#10b981" }}
            >
              ₱
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              style={{ ...inputStyle, paddingLeft: "28px" }}
              onFocus={focusGreen}
              onBlur={blurGray}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <span style={labelStyle}>
            Category <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <div className="relative">
            <Tag
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
              style={{ color: "#475569" }}
            />
            <select
              value={expense_category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{
                ...inputStyle,
                paddingLeft: "34px",
                appearance: "none",
                cursor: "pointer",
              }}
              onFocus={focusGreen}
              onBlur={blurGray}
            >
              <option value="" style={{ background: "#1a2035" }}>
                Select a category
              </option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: "#1a2035" }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <span style={labelStyle}>
            Expense Date <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <div className="relative">
            <CalendarDays
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }}
            />
            <input
              type="date"
              value={expense_date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                ...inputStyle,
                paddingLeft: "34px",
                colorScheme: "dark",
              }}
              onFocus={focusGreen}
              onBlur={blurGray}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#64748b",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{
            background: isSubmitting
              ? "rgba(16,185,129,0.4)"
              : "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: isSubmitting
              ? "none"
              : "0 4px 20px rgba(16,185,129,0.3)",
          }}
        >
          {isSubmitting ? (
            <>
              <div
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                }}
              />
              {mode === "Add" ? "Adding..." : "Updating..."}
            </>
          ) : (
            <>
              <Check size={15} />
              {mode === "Add" ? "Add Expense" : "Update Expense"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
function ExpensesTable() {
  const [rowData, setRowData] = useState<Expense[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [formMode, setFormMode] = useState<"Add" | "Update" | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await client.get("/expenses");
      setRowData(res.data);
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch expenses",
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Expense?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      background: "#111827",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;
    try {
      await client.delete(`/expenses/${id}`);
      Swal.fire({
        title: "Deleted!",
        text: "Expense removed successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#111827",
        color: "#e2e8f0",
      });
      fetchExpenses();
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete expense",
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
      });
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────
  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormMode("Update");
    // Scroll to top so the form is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Form success ───────────────────────────────────────────────────────
  const handleFormSuccess = () => {
    setFormMode(null);
    setSelectedExpense(null);
    fetchExpenses();
  };

  const handleFormCancel = () => {
    setFormMode(null);
    setSelectedExpense(null);
  };

  // ── Column Defs ────────────────────────────────────────────────────────
  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "expense_id",
        headerName: "ID",
        width: 90,
        filter: false,
        cellRenderer: IdCellRenderer,
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 2,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        valueFormatter: (params: ValueFormatterParams) =>
          "₱" + Number(params.value).toLocaleString(),
      },
      {
        field: "expense_category",
        headerName: "Category",
        flex: 2,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        cellRenderer: CategoryCellRenderer,
      },
      {
        field: "expense_date",
        headerName: "Expense Date",
        flex: 2,
        filter: false,
        valueFormatter: ({ value }: { value: string }) =>
          value
            ? new Date(value).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—",
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        flex: 2,
        filter: false,
        valueFormatter: ({ value }: { value: string }) =>
          value
            ? new Date(value).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—",
      },
      {
        headerName: "Actions",
        filter: false,
        width: 110,
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onEdit: handleEdit,
          onDelete: handleDelete,
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const defaultColDef = useMemo(() => ({ flex: 2, editable: false }), []);
  const gridOptions = { rowHeight: 58 };

  return (
    <div
      className="w-full h-full p-6"
      style={{
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Receipt size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Expenses</h1>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              Manage all recorded expenses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExpenses}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
            }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setSelectedExpense(null);
              setFormMode("Add");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            }}
          >
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* ── Manage Expense Form (Add / Update) ── */}
      {formMode && (
        <ManageExpenseForm
          mode={formMode}
          initialData={selectedExpense}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* ── AG Grid Card ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Search toolbar */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "#111827",
          }}
        >
          <div className="relative" style={{ minWidth: 260 }}>
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category, amount…"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#e2e8f0",
                borderRadius: "12px",
                padding: "8px 12px 8px 32px",
                fontSize: "13px",
                outline: "none",
                width: "100%",
                fontFamily: "'Sora', 'DM Sans', sans-serif",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.border =
                  "1px solid rgba(16,185,129,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.07)")
              }
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <X size={11} />
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        <div
          className="ag-theme-quartz-dark w-full"
          style={
            {
              height: "600px",
              "--ag-background-color": "#111827",
              "--ag-header-background-color": "#0f1117",
              "--ag-odd-row-background-color": "#111827",
              "--ag-row-hover-color": "rgba(16,185,129,0.05)",
              "--ag-border-color": "rgba(255,255,255,0.06)",
              "--ag-header-foreground-color": "#475569",
              "--ag-foreground-color": "#cbd5e1",
              "--ag-font-family": "'Sora', 'DM Sans', sans-serif",
              "--ag-font-size": "12px",
              "--ag-input-focus-border-color": "#10b981",
              "--ag-selected-row-background-color": "rgba(16,185,129,0.08)",
            } as React.CSSProperties
          }
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            quickFilterText={search}
          />
        </div>
      </div>
    </div>
  );
}

export default ExpensesTable;
