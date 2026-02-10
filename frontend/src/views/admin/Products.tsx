import React, { use, useEffect, useMemo } from "react";

import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
// Core CSS
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";

import { ActivateIcon, DeactivateIcon, EditIcon } from "../../components/icons";

import Swal from "sweetalert2";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
import type { Status } from "../../types/status";
import type { Actions } from "../../types/actions";
import client from "../../axiosClient";

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
} //tangina

interface ActionCellProps extends ICellRendererParams<IRow> {
  onEdit: (row: IRow, actions: string) => void;
  onActivate: (row: IRow) => void;
  onDeactivate: (row: IRow) => void;
}

function Products() {
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
  const onEdit = (row: IRow, action: string) => {};

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
  const onDeactivate = (row: IRow) => {};

  const [colDefs] = useState<ColDef[]>([
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
      field: "image",
      width: 225,
      headerName: "Image",
      cellRenderer: ImageRenderer,
    },
    {
      field: "barcode",
      headerName: "Barcode",
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
      cellRenderer: StatusCellRenderer,
    },
    {
      field: "status_id",
      headerName: "Actions",
      cellRendererParams: { onEdit, onActivate, onDeactivate },
      cellRenderer: ActionCell,
    },
  ]);
  const [rowData, setRowData] = useState<IRow[] | null>(null);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 2,
      filter: true,
      editable: true,
    };
  }, []);

  // Container: Defines the grid's theme & dimensions.
  return (
    <div
      style={{ width: "95%", height: "80vh", marginTop: "20px" }}
      className="ag-theme-alpine"
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
      />
    </div>
  );
}
const StatusCellRenderer = (params: ValueFormatterParams) => {
  const value = params.data.id;
  const [status, setStatus] = useState<Status>(value);
  const [action, setAction] = useState<Actions>("Activate");
  console.log(status);

  const statusStyles: Record<Status, string> = {
    1: "select-success bg-success text-white ",
    2: "select-error bg-error text-white",
    3: "select-warning bg-warning text-black",
  };

  useEffect(() => {
    if (value === 1) {
      setStatus(1);
    } else if (value === 2) {
      setStatus(2);
    } else {
      setStatus(3);
    }
  }, []);

  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <select
        defaultValue={
          status === 1
            ? "Available"
            : status === 2
              ? "Unavailable"
              : "Out of Stock"
        }
        className={`select select-bordered ${statusStyles[status]} font-[Poppins]`}
      >
        <option disabled={true}>Set Product Status</option>
        <option
          value="Available"
          className="badge-soft badge-success"
          onClick={() => setStatus(1)}
        >
          Available
        </option>
        <option
          value="Unavailable"
          className="badge-soft badge-error"
          onClick={() => setStatus(2)}
        >
          Unavailable
        </option>
        <option
          value="Out of Stock"
          className="badge-soft badge-warning"
          onClick={() => setStatus(3)}
        >
          Out of Stock
        </option>
      </select>
    </div>
  );
};

const ImageRenderer = (params: ValueFormatterParams) => {
  const value = params.value;

  return <img src={value} alt="Product" style={{ width: "100px" }} />;
};

const ActionCell: React.FC<ActionCellProps> = ({
  data,
  onEdit,
  onActivate,
  onDeactivate,
}) => {
  if (!data) return null;
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <select defaultValue="BSIT" className="select w-full">
        <option disabled={true}>Student Course</option>
        <option value="BSIT">BSIT</option>
        <option value="BSBA">BSBA</option>
        <option value="BSA">BSA</option>
        <option value="BTLED">BTLED</option>
      </select>
    </div>
  );
};
export default Products;
