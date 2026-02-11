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
import { EyeIcon, EditIcon, BarcodeIcon } from "../../components/icons";
import { useModal, useProduct } from "../../context/ModalContext";
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
}

const MODAL_ACTIONS = {
  SETACTIVE: "Activate",
  SETINACTIVE: "Deactivate",
  SETOUTOFSTOCK: "Out of Stock",
};

interface ActionCellProps extends ICellRendererParams<IRow> {
  onEdit: (row: IRow, actions: string) => void;
  onActivate: (row: IRow) => void;
  onDeactivate: (row: IRow) => void;
}

interface StatusChangeProps {
  row: IRow;
}

function Products() {
  const { productAction } = useModal();
  const { productId } = useProduct();
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

  useEffect(() => {
    try {
      if (typeof productAction === "string") {
        switch (productAction) {
          case MODAL_ACTIONS.SETACTIVE:
            const setProductActive = async () => {
              if (productId == null) return;

              const response = await client.patch(
                `/products/activate/${productId}`,
              );

              console.log(response);
            };
            setProductActive();
            break;
          case MODAL_ACTIONS.SETINACTIVE:
            const setProductInactive = async () => {
              if (productId == null) return;

              const response = await client.patch(
                `/products/deactivate/${productId}`,
              );
            };
            setProductInactive();
            break;
            break;
        }
      }
    } catch (error) {
      console.error("Error Updating Status:", error);
    }
  }, [productAction]);

  const onActivate = (row: IRow) => {
    Swal.fire({
      title: "Activate Pr`oduct?",
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
      field: "price",
      headerName: "Price",
      width: 130,
      valueFormatter: (params: ValueFormatterParams) => {
        return "₱" + params.value.toLocaleString();
      },
    },
    {
      headerName: "Status",
      cellRenderer: (params: ICellRendererParams<IRow>) => (
        <StatusCellRenderer row={params.data} />
      ),
      flex: 1,
      editable: false,
    },
    {
      field: "status_id",
      headerName: "Actions",
      cellRendererParams: { onEdit, onActivate, onDeactivate },
      cellRenderer: ActionCell,
      flex: 1,
    },
  ]);
  const [rowData, setRowData] = useState<IRow[] | null>(null);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 2,
      filter: true,
      editable: false,
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
        suppressCellFocus={true}
      />
    </div>
  );
}

//* Have to manually pass the onStatusChange funtion for updating status
const StatusCellRenderer: React.FC<StatusChangeProps> = ({ row }) => {
  //Used as to tell typescript this is a status type
  const status_id = row.status_id as Status;
  const [status, setStatus] = useState<Status>(status_id);
  const { setProductAction } = useModal();
  const { setProductId } = useProduct();

  const statusStyles: Record<Status, string> = {
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
    <div className="flex items-center gap-3 cursor-pointer">
      <select
        defaultValue={
          status === 1
            ? "Available"
            : status === 2
              ? "Unavailable"
              : "Out of Stock"
        }
        onChange={() => setProductId(row.product_id)}
        className={`select select-bordered ${statusStyles[status]} font-[Poppins] outline-none `}
      >
        <option disabled={true} className=" text-black">
          Set Product Status
        </option>
        <option
          value="Available"
          className="badge-soft badge-success "
          onClick={() => {
            setStatus(1);
            console.log(MODAL_ACTIONS.SETACTIVE);
            setProductAction(MODAL_ACTIONS.SETACTIVE);
          }}
        >
          Available
        </option>
        <option
          value="Unavailable"
          className="badge-soft badge-error mt-3"
          onClick={() => {
            setStatus(2);
            setProductAction(MODAL_ACTIONS.SETINACTIVE);
          }}
        >
          Unavailable
        </option>
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
  return (
    <section className="flex items-center gap-3 justify-center ">
      <button
        className="p-0 m-0 flex items-center cursor-pointer"
        title="Edit Product"
      >
        <EditIcon height={32} width={30} />
      </button>
      <button
        className="p-0 m-0 flex items-center cursor-pointer"
        title="View Product"
      >
        <EyeIcon height={30} width={30} />
      </button>
      <button
        className="p-0 m-0 flex items-center cursor-pointer"
        title="Show Barcode"
      >
        <BarcodeIcon height={30} width={30} />
      </button>
    </section>
  );
};
export default Products;
