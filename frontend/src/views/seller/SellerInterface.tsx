import { useEffect, useState, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Scan,
  Tag,
  CreditCard,
  BarChart2,
  Receipt,
  Banknote,
  Calculator,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { SaleData, ItemData } from "../../types/sale";
import client from "../../axiosClient";
import Default from "/default/defaultimage.png";
import Swal from "sweetalert2";

type Categories = {
  product_category_id: number;
  category_name: string;
};

interface Product {
  product_id: number;
  product_name: string;
  image: string;
  barcode: string;
  price: string;
  accession_number: string;
  created_at: number;
  status_id: number;
  quantity: number;
  product_category_id: number;
  category_name?: string;
}

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  taxRate: number;
  total: number;
}

function SellerInterface() {
  const navigate = useNavigate();
  const [total, setTotal] = useState<number | undefined>();
  const [products, setProducts] = useState<Product[] | undefined>();
  const [categories, setCategories] = useState<Categories[] | undefined>();
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<CartItem[] | undefined>(undefined);

  useEffect(() => {
    if (cart) {
      const sumPrice = cart.reduce(
        (acc, curr) => acc + curr.price * curr.qty,
        0,
      );
      setTotal(sumPrice);
      cartRef.current = cart;
    }
  }, [cart]);

  const getProducts = async () => {
    setProductsLoading(true);
    const allProducts = await client.get("/products");
    const allCategories = await client.get("/products/categories");
    setProducts(allProducts.data);
    setCategories(allCategories.data);
    setProductsLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleCalculateChange = () => {
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || !total) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid amount paid.",
        icon: "error",
      });
      return;
    }
    if (paid < total) {
      Swal.fire({
        title: "Insufficient Amount",
        text: "Amount paid is less than the total.",
        icon: "error",
      });
      setChange(null);
      return;
    }
    setChange(paid - total);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const item = prev.find((i) => i.product_id === id);
      if (!item) return prev;
      const newQty = Math.max(1, item.qty + delta);
      const available = products?.find((data) => data.product_id === id);
      if (available?.quantity === 0) {
        Swal.fire({
          title: "Insufficient Amount",
          text: "Amount paid is less than the total.",
          icon: "error",
        });
        return prev;
      }
      return prev.map((i) => (i.product_id === id ? { ...i, qty: newQty } : i));
    });
    const available = products?.find((data) => data.product_id === id);
    if (available?.quantity !== 0) {
      setProducts((prevProducts) =>
        prevProducts?.map((p) =>
          p.product_id === id ? { ...p, quantity: p.quantity - 1 } : p,
        ),
      );
    }
  };

  const removeItem = (id: number) => {
    const cartItem = cart?.find((i) => i.product_id === id);
    if (cartItem) {
      setProducts((prevProducts) =>
        prevProducts?.map((p) =>
          p.product_id === id
            ? { ...p, quantity: p.quantity + cartItem.qty }
            : p,
        ),
      );
    }
    setCart((prev) => {
      if (!prev) return [];
      return prev.filter((item) => item.product_id !== id);
    });
  };

  const addToCart = (productToFind: Product, productId: number) => {
    const exists = cart?.find(
      (c) => c.product_name === productToFind.product_name,
    );
    if (exists) {
      const findItem = products?.find(
        (item: Product) => item.product_id === exists.product_id,
      );
      if (!findItem) return;
      if (findItem.quantity < 1) {
        Swal.fire({
          title: "No more stock",
          text: "Stock is not available anymore",
          icon: "error",
        });
        return;
      }
    }
    const productToAdd = products?.find(
      (item) => item.product_id === productId,
    );
    if (exists) {
      updateQty(exists.product_id, 1);
    } else {
      setProducts((prevProducts) =>
        prevProducts?.map((p) =>
          p.product_id === productId ? { ...p, quantity: p.quantity - 1 } : p,
        ),
      );
      setCart((prev: any) => {
        if (!prev) return [];
        return [
          ...prev,
          {
            product_id: productToAdd?.product_id,
            product_name: productToAdd?.product_name,
            price: Number(productToAdd?.price),
            qty: 1,
            total: Number(productToAdd?.price),
          },
        ];
      });
    }
  };

  const handlePayment = async () => {
    if (cart) {
      if (Number(amountPaid) === 0) {
        Swal.fire({
          title: "No Payment Input!!",
          text: "You cannot check out when you dont input payment",
          icon: "error",
        });
        return;
      }
      if (cart.length === 0) {
        Swal.fire({
          title: "Cart Empty!!",
          text: "You cannot check out when cart is empty",
          icon: "error",
        });
        return;
      }
      const sales: SaleData = {
        selling_date: new Date(),
        total: total,
        branch_id: 1,
        seller_id: 1,
      };
      const items: ItemData[] = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.qty,
        unit_price: item.price,
      }));
      const payload = { sale_data: sales, items_data: items };
      setLoading(true);
      const response = await client.post("/sales", payload);
      if (response.data) {
        Swal.fire({
          title: "Successfully Checked Out",
          text: "You can now receive the payment",
          icon: "success",
        });
        await getProducts();
        setLoading(false);
        setCart([]);
        setAmountPaid("");
        setChange(null);
        return;
      }
      Swal.fire({ title: "Error", text: "Error Occurred", icon: "error" });
    }
  };

  const handleBarcodeScan = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const find = await client.get(`/products/get/${barcodeValue}`);
      const { data } = find;
      if (data.length !== 0 && data[0].status_id === 2) {
        Swal.fire({
          title: "Error",
          text: "Product is Marked Deactivated Please Contact Admin for the issue",
          icon: "error",
        });
        return;
      }
      if (data.length !== 0 && data[0].status_id === 3) {
        Swal.fire({
          title: "Error",
          text: "Product is Out Of Stock Please Contact the admin for stock checking",
          icon: "error",
        });
        return;
      }
      if (data.length === 0) {
        Swal.fire({ title: "Error", text: "Product not found", icon: "error" });
      }
      if (data.length !== 0) {
        addToCart(data[0], data[0].product_id);
      }
      setBarcodeValue("");
    }
  };

  if (!products) return null;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchedCategoryId = categories?.find(
      (c) => c.category_name === activeCategory,
    )?.product_category_id;
    const matchesCategory =
      activeCategory === "All Categories" ||
      matchedCategoryId === p.product_category_id;
    const matchesAvailable = Number(p.status_id) === 1 && p.quantity > 0;
    return matchesSearch && matchesCategory && matchesAvailable;
  });

  const cartCount = cart?.reduce((acc, item) => acc + item.qty, 0) ?? 0;

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{
        background: "#0a0f1a",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-3 sm:px-5 py-2.5 shrink-0 z-10"
        style={{
          background: "#0d1321",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <BarChart2 size={14} color="#fff" />
          </div>
          <span
            className="font-bold text-sm sm:text-base"
            style={{ color: "#e2e8f0" }}
          >
            SwiftPOS <span style={{ color: "#10b981" }}>LIVE</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {products.length} items
          </span>

          {/* Mobile cart toggle */}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold relative"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <ShoppingCart size={14} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
                style={{ background: "#10b981", fontSize: "10px" }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              Swal.fire({
                title: "Do you want to log out??",
                text: "You will be logged out to login page!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Log Out",
              }).then((result) => {
                if (result.isConfirmed) navigate("/signin");
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.1)")
            }
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left: Products ── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Search / Barcode / Reload Row */}
          <div className="flex flex-col sm:flex-row gap-2 px-3 sm:px-4 pt-3 pb-2 shrink-0">
            {/* Search */}
            <div
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl min-w-0"
              style={{
                background: "#151b27",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Search size={14} style={{ color: "#64748b", flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#e2e8f0" }}
              />
            </div>

            {/* Barcode */}
            <div
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl min-w-0"
              style={{
                background: "#151b27",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Scan size={14} style={{ color: "#64748b", flexShrink: 0 }} />
              <input
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                onKeyDown={(e) => handleBarcodeScan(e)}
                type="text"
                placeholder="Scan barcode..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#e2e8f0" }}
              />
            </div>

            {/* Reload Button */}
            <button
              onClick={getProducts}
              disabled={productsLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
                minWidth: "40px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(16,185,129,0.22)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(16,185,129,0.12)")
              }
              title="Reload Products"
            >
              <RefreshCw
                size={14}
                className={productsLoading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Reload</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 px-3 sm:px-4 pb-2 overflow-x-auto shrink-0 scrollbar-hide">
            {[
              "All Categories",
              ...(categories?.map((c) => c.category_name) ?? []),
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                style={
                  activeCategory === cat
                    ? {
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                      }
                    : { background: "rgba(255,255,255,0.05)", color: "#64748b" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4">
            {productsLoading ? (
              <div
                className="flex items-center justify-center h-48 text-sm"
                style={{ color: "#64748b" }}
              >
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="flex items-center justify-center h-48 text-sm"
                style={{ color: "#64748b" }}
              >
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    onClick={() => addToCart(product, product.product_id)}
                    className="rounded-2xl cursor-pointer transition-all group relative overflow-hidden"
                    style={{
                      background: "#151b27",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid rgba(16,185,129,0.4)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(16,185,129,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div className="relative">
                      <img
                        src={product.image || Default}
                        alt={product.product_name}
                        className="w-full h-24 sm:h-28 object-cover"
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).src = Default)
                        }
                      />
                      <span
                        className="absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md"
                        style={{
                          background:
                            product.quantity > 5
                              ? "rgba(16,185,129,0.2)"
                              : "rgba(245,158,11,0.2)",
                          color: product.quantity > 5 ? "#10b981" : "#f59e0b",
                        }}
                      >
                        {product.quantity}
                      </span>
                    </div>
                    <div className="p-2">
                      <p
                        className="text-xs font-semibold leading-tight mb-0.5 line-clamp-2"
                        style={{ color: "#e2e8f0" }}
                      >
                        {product.product_name}
                      </p>
                      <p className="text-xs mb-1" style={{ color: "#475569" }}>
                        {product.barcode}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#10b981" }}
                      >
                        ₱{Number(product.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Cart ── */}
        {/* Overlay for mobile */}
        {cartOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setCartOpen(false)}
          />
        )}

        <div
          className={`
            flex flex-col shrink-0
            fixed lg:relative inset-y-0 right-0 z-30 lg:z-auto
            w-80 sm:w-96 lg:w-80 xl:w-96
            transition-transform duration-300 ease-in-out
            ${cartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}
          style={{
            background: "#0d1321",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Cart Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} style={{ color: "#10b981" }} />
              <span
                className="font-semibold text-sm"
                style={{ color: "#e2e8f0" }}
              >
                Order Summary
              </span>
              {cartCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ background: "#10b981", fontSize: "10px" }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCart([]);
                  setAmountPaid("");
                  setChange(null);
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
              >
                <Trash2 size={12} /> Clear
              </button>
              <button
                onClick={() => setCartOpen(false)}
                className="flex lg:hidden items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Cart Column Headers */}
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs shrink-0"
            style={{
              color: "#475569",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span className="flex-1">Item</span>
            <span className="w-16 text-center">Qty</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-7" />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 gap-1">
                <ShoppingCart size={24} style={{ color: "#1e293b" }} />
                <p className="text-xs" style={{ color: "#334155" }}>
                  Cart is empty
                </p>
                <p className="text-xs" style={{ color: "#1e293b" }}>
                  Click a product to add
                </p>
              </div>
            )}
            {cart?.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-2 px-4 py-2.5 transition-all"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium leading-tight truncate"
                    style={{ color: "#cbd5e1" }}
                  >
                    {item.product_name}
                  </p>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    ₱{item.price.toLocaleString()} ea
                  </p>
                </div>
                <div className="flex items-center gap-1 w-16 justify-center">
                  <button
                    onClick={() => updateQty(item.product_id, -1)}
                    className="w-5 h-5 flex items-center justify-center rounded-md transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#94a3b8",
                    }}
                  >
                    <Minus size={10} />
                  </button>
                  <span
                    className="text-xs w-4 text-center"
                    style={{ color: "#e2e8f0" }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.product_id, 1)}
                    className="w-5 h-5 flex items-center justify-center rounded-md transition-all"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                    }}
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <span
                  className="w-16 text-right text-xs font-semibold"
                  style={{ color: "#e2e8f0" }}
                >
                  ₱{(item.price * item.qty).toLocaleString()}
                </span>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md ml-1 transition-all"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(239,68,68,0.25)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(239,68,68,0.1)")
                  }
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-4 py-3 space-y-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Totals */}
            <div
              className="rounded-xl p-3 space-y-1.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="flex justify-between items-center text-xs"
                style={{ color: "#64748b" }}
              >
                <span>Subtotal</span>
                <span style={{ color: "#94a3b8" }}>
                  ₱{" "}
                  {total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div
                className="flex justify-between items-center pt-1.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: "#e2e8f0" }}
                >
                  Total
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: "#10b981" }}
                >
                  ₱{" "}
                  {total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Cash Tender */}
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#64748b" }}
              >
                Cash Tender
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(16,185,129,0.4)")
                  }
                  onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.07)")
                  }
                >
                  <Banknote
                    size={13}
                    style={{ color: "#64748b", flexShrink: 0 }}
                  />
                  <input
                    value={amountPaid}
                    type="number"
                    placeholder="0.00"
                    onChange={(e) => {
                      setAmountPaid(e.target.value);
                      setChange(null);
                    }}
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: "#e2e8f0" }}
                  />
                </div>
                <button
                  onClick={handleCalculateChange}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(16,185,129,0.22)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(16,185,129,0.12)")
                  }
                >
                  <Calculator size={12} /> Calc
                </button>
              </div>

              {/* Change */}
              <div
                className="flex items-center justify-between mt-2 px-3 py-2 rounded-xl"
                style={{
                  background:
                    change !== null && change >= 0
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    change !== null && change >= 0
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-xs" style={{ color: "#64748b" }}>
                  Change
                </span>
                <span
                  className="text-base font-bold"
                  style={{
                    color:
                      change === null
                        ? "#334155"
                        : change >= 0
                          ? "#10b981"
                          : "#ef4444",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {change === null
                    ? "—"
                    : `₱${change.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {/* Process Payment */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.boxShadow =
                  "0 6px 28px rgba(16,185,129,0.45)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 20px rgba(16,185,129,0.3)")
              }
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={15} /> Process Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerInterface;
