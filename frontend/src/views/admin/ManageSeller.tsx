import React, { useState, useEffect } from "react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import { useSeller } from "../../context/SellerContext";
import { Users, User, Building2, Check, ChevronDown } from "lucide-react";

type Branch = {
  branch_id: number;
  branch_name: string;
};

type AccountStatus = {
  status_id: number;
  status_name: string;
};

function ManageSeller() {
  const [firstname, setFirstname] = useState<string>("");
  const [middlename, setMiddlename] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [branch_id, setBranchId] = useState<number | undefined>();
  const [status_id, setStatusId] = useState<number>(5); // Default: Waiting Approval
  const [branches, setBranches] = useState<Branch[]>([]);
  const [statuses, setStatuses] = useState<AccountStatus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sellerAction, selectedSellerId, closeModal } = useSeller();

  useEffect(() => {
    // Fetch branches for the dropdown
    const fetchBranches = async () => {
      const res = await client.get("/sellers/branches/index");
      console.log(statuses);
      setBranches(res.data);
    };

    // Fetch account statuses for the status picker
    const fetchStatuses = async () => {
      const res = await client.get("/sellers");

      setStatuses(res.data);
    };

    fetchBranches();
    fetchStatuses();

    // If updating, pre-fill the form with existing seller data
    if (sellerAction === "Update" && selectedSellerId) {
      const retrieveOld = async () => {
        const response = await client.get(`/sellers/${selectedSellerId}`);
        const { data } = response;

        const { firstname, middlename, lastname, branch_id, status_id } = data;
        setFirstname(firstname);
        setMiddlename(middlename ?? "");
        setLastname(lastname);
        setBranchId(branch_id);
        setStatusId(status_id);
      };
      retrieveOld();
    }
  }, []);

  const resetForm = () => {
    setFirstname("");
    setMiddlename("");
    setLastname("");
    setBranchId(undefined);
    setStatusId(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstname.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a first name",
        icon: "error",
      });
      return;
    }
    if (!lastname.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a last name",
        icon: "error",
      });
      return;
    }
    if (!branch_id) {
      Swal.fire({
        title: "Error!",
        text: "Please select a branch",
        icon: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        firstname: firstname.trim(),
        middlename: middlename.trim() || null,
        lastname: lastname.trim(),
        branch_id,
        status_id,
      };
      console.log(payload);

      switch (sellerAction) {
        case "Add":
          await client.post("/sellers", payload);
          Swal.fire({
            title: "Success!",
            text: "Seller added successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          break;

        case "Update":
          await client.patch(`/sellers/${selectedSellerId}`, payload);
          Swal.fire({
            title: "Success!",
            text: "Seller updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          break;
      }

      resetForm();
      closeModal();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to manage seller",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: "#1a2035",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e2e8f0",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
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

  // Status button config — matches your 5 account_status rows
  const statusOptions = [
    {
      id: 1,
      label: "Active",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.3)",
    },
    {
      id: 2,
      label: "Inactive",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
    },
    {
      id: 3,
      label: "Disabled",
      color: "#64748b",
      bg: "rgba(100,116,139,0.1)",
      border: "rgba(100,116,139,0.3)",
    },
    {
      id: 4,
      label: "Approved",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
      border: "rgba(99,102,241,0.3)",
    },
    {
      id: 5,
      label: "Waiting Approval",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
    },
  ];

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
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {sellerAction === "Add" ? "Add Seller" : "Update Seller"}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            {sellerAction === "Add"
              ? "Fill in the details to register a new seller"
              : "Update the seller's information below"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl">
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Name Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Name */}
            <div>
              <span style={labelStyle}>
                First Name <span style={{ color: "#ef4444" }}>*</span>
              </span>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#475569" }}
                />
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Juan"
                  required
                  style={{ ...inputStyle, paddingLeft: "34px" }}
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
            </div>

            {/* Middle Name */}
            <div>
              <span style={labelStyle}>Middle Name</span>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#475569" }}
                />
                <input
                  type="text"
                  value={middlename}
                  onChange={(e) => setMiddlename(e.target.value)}
                  placeholder="Santos"
                  style={{ ...inputStyle, paddingLeft: "34px" }}
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
            </div>

            {/* Last Name */}
            <div>
              <span style={labelStyle}>
                Last Name <span style={{ color: "#ef4444" }}>*</span>
              </span>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#475569" }}
                />
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Dela Cruz"
                  required
                  style={{ ...inputStyle, paddingLeft: "34px" }}
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
            </div>
          </div>

          {/* ── Branch ── */}
          <div>
            <span style={labelStyle}>
              Branch <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <div className="relative">
              <Building2
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                style={{ color: "#475569" }}
              />
              <select
                value={branch_id ?? ""}
                onChange={(e) => setBranchId(Number(e.target.value))}
                required
                style={{
                  ...inputStyle,
                  paddingLeft: "34px",
                  appearance: "none",
                  cursor: "pointer",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(16,185,129,0.4)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.07)")
                }
              >
                <option value="" style={{ background: "#1a2035" }}>
                  Select a branch
                </option>
                {branches.map((branch) => (
                  <option
                    key={branch.branch_id}
                    value={branch.branch_id}
                    style={{ background: "#1a2035" }}
                  >
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#475569" }}
              />
            </div>
          </div>

          {/* ── Status (Update only) ── */}
          {sellerAction === "Update" && (
            <div>
              <span style={labelStyle}>Account Status</span>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusId(s.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={
                      status_id === s.id
                        ? {
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            color: "#334155",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    {status_id === s.id && <Check size={10} />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              resetForm();
              closeModal();
            }}
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
                {sellerAction === "Add" ? "Adding..." : "Updating..."}
              </>
            ) : (
              <>
                <Check size={15} />
                {sellerAction === "Add" ? "Add Seller" : "Update Seller"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageSeller;
