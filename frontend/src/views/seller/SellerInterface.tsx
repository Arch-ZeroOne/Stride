import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Home,
  Tag,
  Scan,
} from "lucide-react";

import client from "../../axiosClient";
import Default from "/default/defaultimage.png";

type Categories = {
  category_id: number;
  category_name: string;
};

// const products: Product[] = [
//   {
//     id: 1,
//     name: "Mamaearth Vitamin C",
//     code: "BC00889",
//     price: 15000,
//     stock: 0,
//     unit: "Piece",
//     emoji: "🍋",
//   },
//   {
//     id: 2,
//     name: "Tasting The Past",
//     code: "P7850",
//     price: 800,
//     stock: 0,
//     unit: "Set",
//     emoji: "📚",
//   },
//   {
//     id: 3,
//     name: "Effective Java Learn",
//     code: "P96410",
//     price: 600,
//     stock: 0,
//     unit: "Set",
//     emoji: "📘",
//   },
// ];

// Row Data Interface
interface Product {
  product_id: number;
  product_name: string;
  image: string;
  barcode: string;
  price: string;
  accession_number: string;
  created_at: number;
  status_id: number;
}

interface CartItem {
  id: number;
  name: string;
  qty: number;
  tax: string;
  price: number;
  taxRate: number;
}

const initialCart: CartItem[] = [
  {
    id: 101,
    name: "Mixer",
    qty: 2,
    tax: "SGST (5%)",
    price: 400,
    taxRate: 0.05,
  },
  {
    id: 102,
    name: "Shrugs",
    qty: 1,
    tax: "CGST (10%)",
    price: 1500,
    taxRate: 0.2,
  },
];

const taxColors: Record<string, string> = {
  "SGST (5%)": "bg-emerald-500",
  "CGST (10%)": "bg-amber-500",
  "CGST (20%)": "bg-rose-500",
};

function calcSubtotal(item) {
  return item.price * item.qty * (1 + item.taxRate);
}

function SellerInterface() {
  const [products, setProducts] = useState<Product[]>();
  const [categories, setCategories] = useState<Categories[]>();
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [discount, setDiscount] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      const allProducts = await client.get("/products");
      const allCategories = await client.get("/products/categories");

      console.log(allProducts);
      console.log(allCategories);

      setProducts(allProducts.data);
      setCategories(allCategories.data);
    };
    getProducts();
  }, []);

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
      ),
    );
  };

  const removeItem = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const addToCart = (product: Product) => {
    const exists = cart.find((c) => c.name === product.name);
    if (exists) {
      updateQty(exists.id, 1);
    } else {
      //   setCart((prev) => [
      //     ...prev,
      //     {
      //       id: Date.now(),
      //       name: product.name,
      //       qty: 1,
      //       tax: "SGST (5%)",
      //       price: product.price,
      //       taxRate: 0.05,
      //     },
      //   ]);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + calcSubtotal(item), 0);
  const discountAmt = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmt);
  if (!products) return;
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="flex flex-col h-screen bg-gray-100 font-sans"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top Bar */}
      <div className="bg-green-500 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <span className="font-bold text-lg tracking-wide">POS</span>
        <Home size={20} className="cursor-pointer hover:opacity-80" />
      </div>

      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left: Products */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white border-r border-gray-200">
          {/* Search bars */}
          <div className="flex gap-3 p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 bg-gray-50">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 bg-gray-50">
              <Scan size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by Barcode Scanner"
                className="bg-transparent outline-none text-sm w-full text-gray-600"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100">
            {categories?.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveCategory(cat.category_name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeCategory === cat.category_name
                    ? "bg-green-500 text-white border-green-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => addToCart(product)}
                  className="border border-gray-100 rounded-xl bg-white hover:shadow-md hover:border-green-300 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 z-10">
                    {/* <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {} {product.unit}
                    </span> */}
                  </div>

                  <div className="flex items-center justify-center h-28 bg-gray-50 text-5xl rounded-t-xl group-hover:bg-green-50 transition-colors">
                    {product.image ? (
                      <img src={product.image}></img>
                    ) : (
                      <img src={Default}></img>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {product.product_name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {product.barcode}
                    </p>
                    <div className="mt-1.5">
                      <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded">
                        ₱ {product.price.toLocaleString()},00
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-[520px] flex flex-col bg-white">
          {/* Customer / Warehouse */}
          <div className="flex gap-3 p-4 border-b border-gray-100">
            <select className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-green-400">
              <option>Walk-in-customer</option>
            </select>
            <select className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-green-400">
              <option>North Warehouse</option>
            </select>
          </div>

          {/* Cart Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            <span>Name</span>
            <span className="text-center">Qty</span>
            <span className="text-center">Tax</span>
            <span className="text-right">Price</span>
            <span className="text-right">Sub Total</span>
            <span></span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {cart.map((item) => {
              const sub = calcSubtotal(item);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5 items-center">
                    <span
                      className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${taxColors[item.tax] || "bg-gray-400"}`}
                    >
                      {item.tax}
                    </span>
                  </div>
                  <span className="text-sm text-right text-gray-700">
                    $ {item.price.toLocaleString()},00
                  </span>
                  <span className="text-sm font-semibold text-right text-gray-800">
                    $
                    {sub.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors ml-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-9 border border-gray-200 rounded-lg text-gray-500 text-sm font-medium bg-gray-50">
                $
              </span>
              <input
                type="number"
                placeholder="Discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 bg-white"
              />
              <div className="text-right text-sm text-gray-600 ml-auto whitespace-nowrap">
                <div>
                  Sub Total:{" "}
                  <span className="font-semibold text-gray-800">
                    $
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  Total:{" "}
                  <span className="font-bold text-gray-900">
                    $
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide shadow-sm">
                PAY
              </button>
              <button
                onClick={() => setCart([])}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide shadow-sm"
              >
                Empty Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SellerInterface;
