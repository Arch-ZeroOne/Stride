import { useEffect, useState, useRef, use } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Home,
  Scan,
  Package,
  Tag,
  CreditCard,
  X,
  BarChart2,
  User,
  Warehouse,
  Receipt,
  ShoppingBag,
  Banknote,
  Calculator,
  LogOut,
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

const initialCart: CartItem[] = [];

function SellerInterface() {
  const navigate = useNavigate();
  const [total, setTotal] = useState<number>();
  const [products, setProducts] = useState<Product[]>();
  const [categories, setCategories] = useState<Categories[]>();
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[] | undefined>([]);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [barcodeValue, setBarcodeValue] = useState<string | null | undefined>(
    "",
  );

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
  useEffect(() => {
    console.log(products);
  }, [products]);

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
    const matchesAvailable = Number(p.status_id) === 1;
    return matchesSearch && matchesCategory && matchesAvailable;
  });

  const cartCount = cart?.reduce((acc, item) => acc + item.qty, 0) ?? 0;

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
      }}
    >
      {/* ── Top Bar ── */}
      <header
        style={{
          background: "linear-gradient(90deg, #0f1117 0%, #151b27 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        className="flex items-center justify-between px-6 py-3 z-10 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white">
              SwiftPOS
            </span>
            <span
              className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
            >
              LIVE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
          >
            <BarChart2 size={13} />
            <span>{products.length} items</span>
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
          >
            <Home size={16} />
          </button>
          {/* Handling Logout */}
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
                if (result.isConfirmed) {
                  navigate("/signin");
                }
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
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Products ── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "#0f1117" }}
        >
          {/* Search Row */}
          <div
            className="flex gap-3 p-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Search size={14} style={{ color: "#10b981" }} />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#e2e8f0" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Scan size={14} style={{ color: "#6366f1" }} />
              <input
                onChange={(e) => setBarcodeValue(e.target.value)}
                onKeyDown={(e) => handleBarcodeScan(e)}
                type="text"
                placeholder="Scan barcode..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#e2e8f0" }}
              />
            </div>
          </div>

          {/* Category Pills */}
          <div
            className="flex items-center gap-2 px-4 py-3 overflow-x-auto"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {[
              "All Categories",
              ...(categories?.map((c) => c.category_name) ?? []),
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? {
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                      }
                    : { background: "rgba(255,255,255,0.05)", color: "#64748b" }
                }
              >
                <Tag size={10} />
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "rgba(16,185,129,0.2)",
                    borderTopColor: "#10b981",
                  }}
                />
                <p className="text-xs font-medium" style={{ color: "#475569" }}>
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ color: "#334155" }}
              >
                <Package size={40} />
                <p className="text-sm font-medium">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
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
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
                    <div
                      className="flex items-center justify-center h-28 rounded-t-2xl overflow-hidden"
                      style={{ background: "#1e2535" }}
                    >
                      <img
                        src={product.image || Default}
                        className="h-full w-full object-cover"
                        alt={product.product_name}
                      />
                    </div>
                    <div className="p-3">
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{ color: "#e2e8f0" }}
                      >
                        {product.product_name}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 font-mono"
                        style={{ color: "#475569" }}
                      >
                        {product.barcode}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{
                            background: "rgba(16,185,129,0.12)",
                            color: "#10b981",
                          }}
                        >
                          ${Number(product.price).toLocaleString()}
                        </span>
                        <div
                          className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: "rgba(16,185,129,0.2)",
                            color: "#10b981",
                          }}
                        >
                          <Plus size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Cart ── */}
        <div
          className="w-[480px] flex flex-col"
          style={{
            background: "#111827",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Cart Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} style={{ color: "#10b981" }} />
              <span className="font-bold text-sm text-white">
                Order Summary
              </span>
              {cartCount > 0 && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.2)",
                    color: "#10b981",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setCart([]);
                setAmountPaid("");
                setChange(null);
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
            >
              <X size={12} />
              Clear
            </button>
          </div>

          {/* Customer / Warehouse */}
          <div
            className="flex gap-3 px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <User size={13} style={{ color: "#6366f1" }} />
              <select
                className="bg-transparent outline-none text-xs w-full"
                style={{ color: "#94a3b8" }}
              >
                <option>Walk-in Customer</option>
              </select>
            </div>
            <div
              className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Warehouse size={13} style={{ color: "#f59e0b" }} />
              <select
                className="bg-transparent outline-none text-xs w-full"
                style={{ color: "#94a3b8" }}
              >
                <option>North Warehouse</option>
              </select>
            </div>
          </div>

          {/* Cart Column Headers */}
          <div
            className="grid px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: "#334155",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              gridTemplateColumns: "2fr 1fr 1fr auto",
            }}
          >
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
            <span></span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart?.length === 0 && (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ color: "#1e293b" }}
              >
                <ShoppingCart size={36} />
                <p className="text-sm font-medium" style={{ color: "#334155" }}>
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
                className="grid items-center px-5 py-3 transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.1)" }}
                  >
                    <Package size={12} style={{ color: "#10b981" }} />
                  </div>
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: "#cbd5e1" }}
                  >
                    {item.product_name}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateQty(item.product_id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#94a3b8",
                    }}
                  >
                    <Minus size={10} />
                  </button>
                  <span
                    className="text-xs font-bold w-6 text-center"
                    style={{ color: "#e2e8f0" }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.product_id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                    }}
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <span
                  className="text-xs font-semibold text-right"
                  style={{ color: "#e2e8f0" }}
                >
                  ${(item.price * item.qty).toLocaleString()}
                </span>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg ml-2 transition-all"
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
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="p-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Totals card */}
            <div
              className="rounded-2xl p-4 mb-3"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: "#475569" }}>
                  Subtotal
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  $
                  {total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div
                className="pt-3 flex justify-between items-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Receipt size={13} style={{ color: "#10b981" }} />
                  <span className="text-sm font-bold text-white">Total</span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#10b981" }}
                >
                  $
                  {total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* ── Cash Tender ── */}
            <div
              className="rounded-2xl p-4 mb-3"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Amount Paid input */}
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "#334155" }}
              >
                Cash Tender
              </p>
              <div className="flex gap-2 mb-3">
                <div
                  className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
                  style={{
                    background: "#0f1117",
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
                    style={{ color: "#10b981", flexShrink: 0 }}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Amount paid"
                    value={amountPaid}
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.25)",
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
                  <Calculator size={13} />
                  Calc
                </button>
              </div>

              {/* Change display */}
              <div
                className="flex justify-between items-center rounded-xl px-3 py-2.5"
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
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#475569" }}
                >
                  Change
                </span>
                <span
                  className="text-sm font-black"
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
                    : `$${change.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {/* Process Payment button */}
            <button
              className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all text-sm tracking-wide text-white"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}
              onClick={handlePayment}
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
                <span className="loading loading-spinner text-white" />
              ) : (
                <>
                  <CreditCard size={16} />
                  Process Payment
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
