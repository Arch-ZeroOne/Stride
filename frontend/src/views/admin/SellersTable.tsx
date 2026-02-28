import React, { useState, useEffect, useMemo } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import { useSeller } from "../../context/SellerContext";
import ManageSeller from "./ManageSeller";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

type Seller = {
  seller_id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  branch_id: number;
  branch_name?: string;
  account_status?: string;
  status_id: number;
  created_at: string;
  updated_at: string;
};

// ─── Status badge config ──────────────────────────────────────────────────────
const statusStyle: Record<
  number,
  { color: string; bg: string; border: string; label: string }
> = {
  1: {
    label: "Active",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
  },
  2: {
    label: "Inactive",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
  },
  3: {
    label: "Disabled",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.2)",
  },
  4: {
    label: "Approved",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.2)",
  },
  5: {
    label: "Waiting Approval",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
};

// ─── Status Cell Renderer ─────────────────────────────────────────────────────
const StatusCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;

  console.log(data.status_id);

  const badge = statusStyle[data.status_id] ?? statusStyle[5];
  return (
    <div className="flex items-center h-full">
      <span
        className="px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{
          background: badge.bg,
          color: badge.color,
          border: `1px solid ${badge.border}`,
        }}
      >
        {data.account_status ?? badge.label}
      </span>
    </div>
  );
};

// ─── Name Cell Renderer ───────────────────────────────────────────────────────
const NameCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;
  const fullName = [data.firstname, data.middlename, data.lastname]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex items-center gap-2.5 h-full">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
        }}
      >
        {data.firstname?.[0]?.toUpperCase()}
        {data.lastname?.[0]?.toUpperCase()}
      </div>
      <span className="font-semibold text-white" style={{ fontSize: 13 }}>
        {fullName}
      </span>
    </div>
  );
};

// ─── Branch Cell Renderer ─────────────────────────────────────────────────────
const BranchCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span
        className="px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
      >
        {data.branch_name ?? `Branch ${data.branch_id}`}
      </span>
    </div>
  );
};

// ─── ID Cell Renderer ─────────────────────────────────────────────────────────
const IdCellRenderer: React.FC<ICellRendererParams> = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span
        className="px-2 py-0.5 rounded-md text-xs font-mono font-bold"
        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
      >
        #{data.seller_id}
      </span>
    </div>
  );
};

// ─── Action Cell Renderer ─────────────────────────────────────────────────────
interface ActionCellProps extends ICellRendererParams {
  onEdit: (seller: Seller) => void;
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
          background: "rgba(99,102,241,0.1)",
          color: "#818cf8",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(99,102,241,0.22)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(99,102,241,0.1)")
        }
        title="Edit"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={() => onDelete(data.seller_id)}
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

// ─── Main Component ───────────────────────────────────────────────────────────
function SellersTable() {
  const [rowData, setRowData] = useState<Seller[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { isModalOpen, openModal, closeModal } = useSeller();

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await client.get("/sellers");

      setRowData(res.data);
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch sellers",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Re-fetch after modal closes so grid reflects latest add/update
  useEffect(() => {
    if (!isModalOpen) fetchSellers();
  }, [isModalOpen]);

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Seller?",
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
      await client.delete(`/sellers/${id}`);
      Swal.fire({
        title: "Deleted!",
        text: "Seller removed successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#111827",
        color: "#e2e8f0",
      });
      fetchSellers();
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete seller",
        icon: "error",
      });
    }
  };

  // ── Column Defs ────────────────────────────────────────────────────────
  const colDefs = useMemo(
    () => [
      {
        field: "seller_id",
        headerName: "ID",
        width: 90,
        filter: false,
        cellRenderer: IdCellRenderer,
      },
      {
        field: "firstname",
        headerName: "Full Name",
        flex: 3,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        cellRenderer: NameCellRenderer,
      },
      {
        field: "branch_name",
        headerName: "Branch",
        flex: 2,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        cellRenderer: BranchCellRenderer,
      },
      {
        field: "status_id",
        headerName: "Status",
        flex: 2,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: "created_at",
        headerName: "Created",
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
          onEdit: (seller: Seller) => openModal("Update", seller.seller_id),
          onDelete: handleDelete,
        },
      },
    ],
    [openModal],
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
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sellers</h1>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              Manage all registered sellers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSellers}
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
            onClick={() => openModal("Add")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            }}
          >
            <Plus size={14} />
            Add Seller
          </button>
        </div>
      </div>

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
              placeholder="Search by name, branch, status…"
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
            // Global search across all columns
            quickFilterText={search}
          />
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: "#0f1117",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#64748b",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <X size={14} />
            </button>
            <ManageSeller />
          </div>
        </div>
      )}
    </div>
  );
}

export default SellersTable;
