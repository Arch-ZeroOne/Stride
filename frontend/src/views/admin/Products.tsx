import React, { useEffect, useMemo, useRef } from "react";
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { EditIcon } from "../../components/icons";
import { useModal, useProduct } from "../../context/ModalContext";
import Swal from "sweetalert2";
import type { Status } from "../../types/status";
import client from "../../axiosClient";
import { useNavigate } from "react-router";
import { Plus, Package, BarcodeIcon, X } from "lucide-react";
import Barcode from "react-barcode";
import { useBarcode } from "../../context/BarcodeContext";
import { useReactToPrint } from "react-to-print";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  product_id: number;
  product_name: string;
  image: string;
  barcode: string;
  price: string;
  accession_number: string;
  created_at: number;
  status_id: number;
}

const MODAL_ACTIONS = {
  SETACTIVE: "Activate",
  SETINACTIVE: "Deactivate",
  SETOUTOFSTOCK: "Out of Stock",
  SETLOWSTOCK: "Low Stock",
};

interface ActionCellProps extends ICellRendererParams {
  onEdit: (row: IRow, actions: string) => void;
  onActivate: (row: IRow) => void;
  onDeactivate: (row: IRow) => void;
}

interface StatusChangeProps {
  row: IRow;
}

function Products() {
  const { productAction, setProductAction } = useModal();
  const { productId } = useProduct();
  const { barcode } = useBarcode();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get("/products");

        setRowData(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  const onEdit = (row: IRow, action: string) => {
    console.log(row, action);
  };

  useEffect(() => {
    try {
      if (typeof productAction === "string") {
        const updateStatus = async () => {
          if (productId == null) return;
          switch (productAction) {
            case MODAL_ACTIONS.SETACTIVE:
              await client.patch(`/products/activate/${productId}`);
              break;
            case MODAL_ACTIONS.SETINACTIVE:
              await client.patch(`/products/deactivate/${productId}`);
              break;
            case MODAL_ACTIONS.SETOUTOFSTOCK:
              await client.patch(`/products/mark/${productId}`);
              break;
            case MODAL_ACTIONS.SETLOWSTOCK:
              await client.patch(`/products/low/${productId}`);
              break;
          }
        };
        updateStatus();
      }
    } catch (error) {
      console.error("Error Updating Status:", error);
    }
  }, [productAction, productId]);

  const onActivate = (row: IRow) => {
    Swal.fire({
      title: "Activate Product?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Activate Product",
      background: "#111827",
      color: "#e2e8f0",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await client.patch(`/products/activate/${row.product_id}`);
        } catch (error) {
          console.error("Error activating product:", error);
        }
        Swal.fire({
          title: "Product Activated!",
          text: "Product status set to available.",
          icon: "success",
          background: "#111827",
          color: "#e2e8f0",
          confirmButtonColor: "#10b981",
        });
      }
    });
  };

  const onDeactivate = (row: IRow) => {
    console.log(row);
  };

  const [colDefs] = useState([
    {
      field: "product_name",
      headerName: "Product Name",
      flex: 3,
      filter: "agTextColumnFilter",
      floatingFilter: true,
    },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params: ValueFormatterParams) =>
        "₱" + Number(params.value).toLocaleString(),
    },
    {
      field: "quantity",
      headerName: "Stock",
      width: 100,
      filter: "agNumberColumnFilter",
      floatingFilter: true,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      filter: false,
      cellRenderer: BarcodeRenderer,
      flex: 3,
    },
    {
      headerName: "Status",
      cellRenderer: (params: ICellRendererParams) => (
        <StatusCellRenderer row={params.data} />
      ),
      flex: 2,
      filter: false,
      editable: false,
    },
    {
      field: "status_id",
      headerName: "Actions",
      filter: false,
      cellRendererParams: { onEdit, onActivate, onDeactivate },
      cellRenderer: ActionCell,
      flex: 2,
    },
  ]);

  const [rowData, setRowData] = useState(null);

  const defaultColDef = useMemo(
    () => ({
      flex: 2,
      editable: false,
    }),
    [],
  );

  const gridOptions = {
    rowHeight: 60,
  };

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
      {barcode ? <BarcodeModal barcode={barcode} /> : ""}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Products</h1>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              Manage your product inventory
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            navigate("/admin/manageproduct");
            setProductAction("Add");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.boxShadow =
              "0 6px 24px rgba(16,185,129,0.45)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.boxShadow =
              "0 4px 16px rgba(16,185,129,0.3)")
          }
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* ── AG Grid ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
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
          />
        </div>
      </div>
    </div>
  );
}

// ─── Status Cell ──────────────────────────────────────────────────────────────
const StatusCellRenderer: React.FC<StatusChangeProps> = ({ row }) => {
  const status_id = row.status_id as Status;
  const [status, setStatus] = useState(status_id);
  const [isUpdating, setIsUpdating] = useState(false);
  const { setProductAction } = useModal();
  const { setProductId } = useProduct();

  const statusStyles: Record<
    number,
    { bg: string; color: string; border: string }
  > = {
    1: {
      bg: "rgba(16,185,129,0.12)",
      color: "#10b981",
      border: "rgba(16,185,129,0.3)",
    },
    2: {
      bg: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      border: "rgba(239,68,68,0.3)",
    },
    3: {
      bg: "rgba(245,158,11,0.12)",
      color: "#f59e0b",
      border: "rgba(245,158,11,0.3)",
    },
    4: {
      bg: "rgba(59,130,246,0.12)",
      color: "#3b82f6",
      border: "rgba(59,130,246,0.3)",
    },
  };

  useEffect(() => {
    setStatus(
      status_id === 1 ? 1 : status_id === 2 ? 2 : status_id === 3 ? 3 : 4,
    );
  }, []);

  const s = statusStyles[status] ?? statusStyles[1];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = Number(e.target.value);
    const prev = status;
    setStatus(action as Status);
    setIsUpdating(true);
    try {
      if (action === 1) {
        await client.patch(`/products/activate/${row.product_id}`);
        setProductAction(MODAL_ACTIONS.SETACTIVE);
      } else if (action === 2) {
        await client.patch(`/products/deactivate/${row.product_id}`);
        setProductAction(MODAL_ACTIONS.SETINACTIVE);
      } else {
        await client.patch(`/products/mark/${row.product_id}`);
        setProductAction(MODAL_ACTIONS.SETOUTOFSTOCK);
      }
      setProductId(row.product_id);
    } catch (error) {
      setStatus(prev);
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center h-full gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: "8px",
          padding: "3px 8px",
          fontSize: "11px",
          fontWeight: "600",
          outline: "none",
          cursor: isUpdating ? "not-allowed" : "pointer",
          opacity: isUpdating ? 0.5 : 1,
        }}
      >
        <option value={1} style={{ background: "#1a2035", color: "#e2e8f0" }}>
          Active
        </option>
        <option value={2} style={{ background: "#1a2035", color: "#e2e8f0" }}>
          Inactive
        </option>
        <option value={3} style={{ background: "#1a2035", color: "#e2e8f0" }}>
          Out of Stock
        </option>
        <option value={4} style={{ background: "#1a2035", color: "#e2e8f0" }}>
          Low Stock
        </option>
      </select>
      {isUpdating && (
        <div
          className="w-3.5 h-3.5 rounded-full border-2 animate-spin flex-shrink-0"
          style={{ borderColor: `${s.color}33`, borderTopColor: s.color }}
        />
      )}
    </div>
  );
};

// ─── Action Cell ──────────────────────────────────────────────────────────────
const ActionCell: React.FC<ActionCellProps> = ({ data }) => {
  if (!data) return null;

  const { setProductAction } = useModal();
  const navigate = useNavigate();
  const { setBarcode } = useBarcode();

  return (
    <div className="flex items-center gap-2 h-full">
      {/* Edit */}
      <button
        onClick={() => {
          setProductAction("Update");
          navigate(`manageproduct/${data.product_id}`);
        }}
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
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
        title="Edit product"
      >
        <EditIcon className="w-3.5 h-3.5" />
      </button>

      {/* Barcode */}
      <button
        onClick={() => {
          const barcodeModal = document.getElementById(
            "my_modal_1",
          ) as HTMLDialogElement;
          setBarcode(data.barcode);
          barcodeModal.showModal();
        }}
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
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
        title="View Barcode"
      >
        <BarcodeIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── Barcode Renderer (inline in grid) ───────────────────────────────────────
const BarcodeRenderer = ({ data }: any) => {
  const barcode = data.barcode;
  return <Barcode value={barcode} width={0.9} height={30} fontSize={10} />;
};

// ─── Barcode Modal ────────────────────────────────────────────────────────────
const BarcodeModal = ({ barcode }: any) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const printBarcode = useReactToPrint({ contentRef: componentRef });

  return (
    <dialog id="my_modal_1" className="modal text-black">
      <div
        className="modal-box"
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "28px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-white text-sm">Product Barcode</p>
          <form method="dialog">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#64748b",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <X size={13} />
            </button>
          </form>
        </div>

        {/* Barcode */}
        <div
          className="flex justify-center rounded-xl p-4 mb-5"
          style={{ background: "#fff" }}
          ref={componentRef}
        >
          <Barcode value={barcode} displayValue={true} format="CODE128" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
            onClick={() => printBarcode()}
          >
            Print Barcode
          </button>
          <form method="dialog" style={{ flex: 1 }}>
            <button
              className="w-full py-2.5 rounded-xl text-xs font-semibold"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Products;
