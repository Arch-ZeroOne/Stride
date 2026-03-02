import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { X, Printer, CheckCircle } from "lucide-react";

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  taxRate?: number;
  total?: number;
}

interface ReceiptProps {
  cart: CartItem[];
  amountPaid?: number;
  change?: number | null;
  onClose?: () => void;
}

const DashedLine = () => (
  <div style={{ margin: "10px 0", borderTop: "1.5px dashed #c8c8c8" }} />
);

function Receipt({ cart, amountPaid, change, onClose, setCart }: ReceiptProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const totalItems = cart.reduce((a, i) => a + i.qty, 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const receiptNo = `SWF-${Date.now().toString().slice(-8)}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "420px",
          background: "#0d1321",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              <CheckCircle size={15} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#e2e8f0",
                  margin: 0,
                }}
              >
                Transaction Complete
              </p>
              <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>
                Receipt #{receiptNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              color: "#64748b",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* Printable Receipt */}
          <div
            ref={contentRef}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px 24px",
              fontFamily: "'Courier New', Courier, monospace",
              color: "#1a1a1a",
            }}
          >
            {/* Store Header */}
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "4px",
                  color: "#059669",
                  margin: 0,
                }}
              >
                SwiftPOS
              </p>
              <p
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  letterSpacing: "2px",
                  margin: "2px 0 0",
                }}
              >
                POINT OF SALE SYSTEM
              </p>
              <p
                style={{ fontSize: "9px", color: "#9ca3af", margin: "6px 0 0" }}
              >
                Main Branch • TIN: 000-000-000-000
              </p>
            </div>

            <DashedLine />

            {/* Receipt Meta */}
            {[
              ["Date", dateStr],
              ["Time", timeStr],
              ["Receipt #", receiptNo],
              ["Cashier", "Admin"],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "9px",
                  color: "#6b7280",
                  marginBottom: "3px",
                }}
              >
                <span>{label}:</span>
                <span
                  style={{
                    fontWeight: label === "Receipt #" ? "700" : "400",
                    color: label === "Receipt #" ? "#374151" : "#6b7280",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}

            <DashedLine />

            {/* Column Headers */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                paddingBottom: "6px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: "30px", textAlign: "center" }}>Qty</span>
              <span style={{ width: "56px", textAlign: "right" }}>Price</span>
              <span style={{ width: "64px", textAlign: "right" }}>Total</span>
            </div>

            {/* Cart Items */}
            <div style={{ marginBottom: "8px" }}>
              {cart.map((item) => (
                <div key={item.product_id} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        fontWeight: "600",
                        color: "#111827",
                        paddingRight: "6px",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.product_name}
                    </span>
                    <span
                      style={{
                        width: "30px",
                        textAlign: "center",
                        fontSize: "10px",
                        color: "#374151",
                      }}
                    >
                      {item.qty}
                    </span>
                    <span
                      style={{
                        width: "56px",
                        textAlign: "right",
                        fontSize: "10px",
                        color: "#6b7280",
                      }}
                    >
                      ₱
                      {item.price.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      style={{
                        width: "64px",
                        textAlign: "right",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      ₱
                      {(item.price * item.qty).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <DashedLine />

            {/* Totals */}
            <div>
              {(
                [
                  ["Subtotal", subtotal],
                  ["VAT (12%)", tax],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  <span>{label}</span>
                  <span>
                    ₱{val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "15px",
                  fontWeight: "800",
                  color: "#059669",
                  paddingTop: "8px",
                  borderTop: "2px solid #111827",
                  marginTop: "4px",
                }}
              >
                <span>TOTAL</span>
                <span>
                  ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cash Tendered & Change */}
            {amountPaid !== undefined && amountPaid > 0 && (
              <>
                <DashedLine />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "10px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Cash Tendered</span>
                    <span>
                      ₱
                      {amountPaid.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    <span>Change</span>
                    <span>
                      ₱
                      {(change ?? 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}

            <DashedLine />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "14px",
              }}
            >
              <span>Total Items</span>
              <span>{totalItems} pcs</span>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{ fontSize: "9px", color: "#9ca3af", margin: "0 0 2px" }}
              >
                — Thank you for your purchase! —
              </p>
              <p style={{ fontSize: "8px", color: "#d1d5db", margin: 0 }}>
                Powered by SwiftPOS • All sales are final
              </p>
              <div
                style={{
                  margin: "10px auto 0",
                  display: "flex",
                  justifyContent: "center",
                  gap: "2px",
                }}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i % 3 === 0 ? "3px" : "1.5px",
                      height: "26px",
                      background: "#374151",
                      borderRadius: "1px",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "8px",
                  color: "#9ca3af",
                  marginTop: "4px",
                  letterSpacing: "2px",
                }}
              >
                {receiptNo}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "16px 20px",
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              background: "rgba(255,255,255,0.05)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => reactToPrintFn()}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}
          >
            <Printer size={15} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receipt;
