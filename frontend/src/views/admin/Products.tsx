import React, { useEffect, useMemo } from "react";
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
// Core CSS
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { EyeIcon, EditIcon, BarcodeIcon } from "../../components/icons";
import { useModal, useProduct } from "../../context/ModalContext";
import Swal from "sweetalert2";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

import type { Status } from "../../types/status";
import client from "../../axiosClient";
import { useNavigate } from "react-router";

// Row Data Interface
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get("/products");
        const { data } = response;
        setRowData(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  const onEdit = (row: IRow, action: string) => {
    console.log(row);
    console.log(action);
  };

  useEffect(() => {
    try {
      if (typeof productAction === "string") {
        const updateStatus = async () => {
          switch (productAction) {
            case MODAL_ACTIONS.SETACTIVE:
              if (productId == null) return;
              await client.patch(`/products/activate/${productId}`);
              break;
            case MODAL_ACTIONS.SETINACTIVE:
              if (productId == null) return;
              await client.patch(`/products/deactivate/${productId}`);
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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Activate Product",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await client.patch(
            `/products/activate/${row.product_id}`,
          );
          console.log(response);
        } catch (error) {
          console.error("Error activating product:", error);
        }
        Swal.fire({
          title: "Product Activated!",
          text: "Product status set to available.",
          icon: "success",
        });
      }
    });
  };

  const onDeactivate = (row: IRow) => {
    console.log(row);
  };

  const [colDefs] = useState([
    {
      field: "product_id",
      width: 150,
      headerName: "#",
    },
    {
      field: "product_name",
      width: 130,
      headerName: "Product Name",
    },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      valueFormatter: (params: ValueFormatterParams) => {
        return "₱" + params.value.toLocaleString();
      },
    },
    {
      headerName: "Status",
      cellRenderer: (params: ICellRendererParams) => (
        <StatusCellRenderer row={params.data} />
      ),
      flex: 1,
      editable: false,
    },
    {
      field: "status_id",
      headerName: "Actions",
      cellRendererParams: {
        onEdit,
        onActivate,
        onDeactivate,
      },
      cellRenderer: ActionCell,
      flex: 1,
    },
  ]);

  const [rowData, setRowData] = useState(null);

  // Apply settings across all columns
  const defaultColDef = useMemo(() => {
    return {
      flex: 2,
      filter: true,
      editable: false,
    };
  }, []);

  // Container: Defines the grid's theme & dimensions.
  return (
    <div className="w-full h-full bg-base-100 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/admin/manageproduct");
            setProductAction("Add");
          }}
          className="btn btn-primary gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Product
        </button>
      </div>

      {/* Data Grid Card */}
      <div className="card bg-white shadow-xl">
        <div className="card-body p-0">
          <div
            className="ag-theme-quartz w-full h-[600px]"
            style={{
              width: "100%",
              height: "600px",
            }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

//* Have to manually pass the onStatusChange funtion for updating status
const StatusCellRenderer: React.FC<StatusChangeProps> = ({ row }) => {
  //Used as to tell typescript this is a status type
  const status_id = row.status_id as Status;
  const [status, setStatus] = useState(status_id);
  const { setProductAction } = useModal();
  const { setProductId } = useProduct();

  const statusStyles: Record<number, string> = {
    1: "select-success bg-success text-white ",
    2: "select-error bg-error text-white",
    3: "select-warning bg-warning text-black",
  };

  useEffect(() => {
    if (status_id === 1) {
      setStatus(1);
    } else if (status_id === 2) {
      setStatus(2);
    } else {
      setStatus(3);
    }
  }, []);

  return (
    <div className="flex items-center h-full">
      <select
        value={status}
        onChange={(e) => {
          const action = Number(e.target.value);
          setStatus(action as Status);
          if (action === 1) {
            setProductAction(MODAL_ACTIONS.SETACTIVE);
          } else {
            setProductAction(MODAL_ACTIONS.SETINACTIVE);
          }
          setProductId(row.product_id);
        }}
        className={`select select-sm select-bordered ${statusStyles[status]} font-[Poppins] outline-none `}
      >
        <option disabled>Set Product Status</option>
        <option value={1}>Available</option>
        <option value={2}>Unavailable</option>
      </select>
    </div>
  );
};

const ActionCell: React.FC<ActionCellProps> = ({
  data,
  onEdit,
  onActivate,
  onDeactivate,
}) => {
  if (!data) return null;

  const { setProductAction } = useModal();
  const navigate = useNavigate();
  console.log(onActivate, onDeactivate);

  return (
    <div className="flex items-center gap-2 h-full">
      <button className="btn btn-sm btn-ghost btn-circle hover:bg-blue-50">
        <EyeIcon className="w-4 h-4 text-blue-600" />
      </button>
      <button
        onClick={() => onEdit(data.product_id, "edit")}
        className="btn btn-sm btn-ghost btn-circle hover:bg-yellow-50"
      >
        <EditIcon
          className="w-4 h-4 text-yellow-600"
          onClick={() => {
            setProductAction("Update");
            navigate(`manageproduct/${data.product_id}`);
          }}
        />
      </button>
      <button className="btn btn-sm btn-ghost btn-circle hover:bg-purple-50">
        <BarcodeIcon className="w-4 h-4 text-purple-600" />
      </button>
    </div>
  );
};

export default Products;
