import React, { useState, useRef, useEffect } from "react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import * as util from "../../util/cloudinary";
import { useModal } from "../../context/ModalContext";
import { useParams } from "react-router";
import {
  Package,
  Tag,
  Hash,
  ImagePlus,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

type Categories = {
  product_category_id: number;
  category_name: string;
};

function ManageProduct() {
  const [product_name, setProductName] = useState<string>("");
  const [imageFile, setImage] = useState<File | null>(null);
  const [price, setPrice] = useState<string>("");
  const [product_category_id, setCategory] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<number | undefined>();
  const [categories, setCategories] = useState<Categories[]>([]);

  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<number>(1);
  const { productAction } = useModal();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await client.get("/products/categories");
      setCategories(res.data);
    };
    fetchCategories();

    if (productAction === "Update") {
      const retrieveOld = async () => {
        const response = await client.get(`products/${id}`);
        const { data } = response;
        const {
          product_name,
          price,
          quantity,
          product_category_id,
          status_id,
          image,
        } = data;
        setProductName(product_name);
        setPrice(price);
        setCategory(product_category_id);
        setStatus(status_id);
        setQuantity(quantity);
        if (image) setImagePreview(image);
      };
      retrieveOld();
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product_name || !price) return;

    if (!product_name.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a product name",
        icon: "error",
      });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid price",
        icon: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const image = imageFile ? await util.getUploadUrl(imageFile) : undefined;
      const payload = {
        product_name,
        price,
        image,
        product_category_id,
        quantity,
        status_id: status,
      };

      if (!productAction) return;

      switch (productAction) {
        case "Add":
          await client.post("/products", payload);
          Swal.fire({
            title: "Success!",
            text: "Product added successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          break;
        case "Update":
          await client.patch(`/products/${id}`, payload);
          Swal.fire({
            title: "Success!",
            text: "Product updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          break;
      }

      setImagePreview(null);
      setProductName("");
      setPrice("");
      setImage(null);
      setCategory(undefined);
      setQuantity(undefined);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to manage product",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: "#1a2035",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e2e8f0",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "600" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "#475569",
    marginBottom: "6px",
    display: "block",
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
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <Package size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {productAction === "Add" ? "Add Product" : "Update Product"}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            {productAction === "Add"
              ? "Fill in the details to add a new product"
              : "Update the product details below"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* ── Left: Image Upload ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={labelStyle}>Product Image</span>

          {/* Preview box */}
          <div
            className="relative rounded-xl overflow-hidden flex items-center justify-center mb-4"
            style={{
              height: "220px",
              background: "#1a2035",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                  }}
                >
                  <X size={13} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)" }}
                >
                  <ImagePlus size={22} style={{ color: "#10b981" }} />
                </div>
                <p className="text-xs" style={{ color: "#475569" }}>
                  No image selected
                </p>
                <p className="text-[10px]" style={{ color: "#334155" }}>
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* File input styled */}
          <label
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <ImagePlus size={13} />
            {imagePreview ? "Change Image" : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              ref={imageRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* ── Right: Product Details ── */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Product Name */}
          <div>
            <span style={labelStyle}>
              Product Name <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <div className="relative">
              <Package
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}
              />
              <input
                type="text"
                value={product_name}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
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

          {/* Price */}
          <div>
            <span style={labelStyle}>
              Price (₱) <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                style={{ color: "#10b981" }}
              >
                ₱
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style={{ ...inputStyle, paddingLeft: "28px" }}
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

          {/* Quantity */}
          <div>
            <span style={labelStyle}>
              Quantity <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <div className="relative">
              <Hash
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}
              />
              <input
                type="number"
                value={quantity ?? ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
                min="0"
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

          {/* Category */}
          <div>
            <span style={labelStyle}>
              Category <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <div className="relative">
              <Tag
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                style={{ color: "#475569" }}
              />
              <select
                value={product_category_id ?? ""}
                onChange={(e) => setCategory(Number(e.target.value))}
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
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.product_category_id}
                    value={cat.product_category_id}
                    style={{ background: "#1a2035" }}
                  >
                    {cat.category_name}
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

          {/* Status — only show on Update */}
          {productAction === "Update" && (
            <div>
              <span style={labelStyle}>Status</span>
              <div className="flex gap-2">
                {[
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
                    label: "Out of Stock",
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.1)",
                    border: "rgba(245,158,11,0.3)",
                  },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={
                      status === s.id
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
                    {status === s.id && <Check size={10} />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 max-w-4xl">
        <button
          type="button"
          onClick={() => {
            setImagePreview(null);
            setProductName("");
            setPrice("");
            setCategory(undefined);
            setQuantity(undefined);
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
              {productAction === "Add" ? "Adding..." : "Updating..."}
            </>
          ) : (
            <>
              <Check size={15} />
              {productAction === "Add" ? "Add Product" : "Update Product"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ManageProduct;
