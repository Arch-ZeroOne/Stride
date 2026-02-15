import React, { useState, useRef } from "react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import * as util from "../../util/cloudinary";
const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Food & Beverages" },
  { id: 4, name: "Home & Garden" },
  { id: 5, name: "Sports & Outdoors" },
  { id: 6, name: "Books & Media" },
  { id: 7, name: "Health & Beauty" },
  { id: 8, name: "Toys & Games" },
  { id: 9, name: "Automotive" },
  { id: 10, name: "Office Supplies" },
  { id: 11, name: "Furniture" },
  { id: 12, name: "Jewelry & Accessories" },
  { id: 13, name: "Pet Supplies" },
  { id: 14, name: "Tools & Hardware" },
  { id: 15, name: "Baby Products" },
];

function AddProduct() {
  const [product_name, setProductName] = useState<string>();
  const [imageFile, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState();
  const [price, setPrice] = useState<string>();
  const [product_category_id, setCategory] = useState<number>();

  const imageRef = useRef(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const url = URL.createObjectURL(file);
      setImage(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product_name || !price) {
      return;
    }
    // Validation
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

      if (imageRef.current) {
        const image = await util.getUploadUrl(imageFile);
        const payload = { product_name, price, image, product_category_id };

        const response = await client.post("/products", payload);

        Swal.fire({
          title: "Success!",
          text: "Product added successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        setImagePreview("");
        setProductName("");
        setPrice("");
        setImage(null);
        setCategory(0);
      }

      // Optionally redirect to products page
      // navigate('/products');
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add product",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setImagePreview(null);
  };

  return (
    <div className="w-full h-full bg-base-100 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the product details below
        </p>
      </div>

      {/* Form Card */}
      <div className="card bg-white shadow-xl max-w-4xl mr-auto ml-auto">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Product Image
                    </span>
                  </label>

                  {/* Image Preview */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 flex items-center justify-center bg-gray-50 h-64">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                          }}
                          className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-500 mb-2">No image selected</p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageRef}
                    onChange={handleImageChange}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                </div>
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Product Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={product_name}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                {/* Price */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Price (₱) <span className="text-error">*</span>
                    </span>
                  </label>
                  <label className="input-group">
                    <span className="bg-base-200">₱</span>
                    <input
                      type="number"
                      name="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full"
                      required
                    />
                  </label>
                </div>
                <div className="form-control w-full">
                  <select
                    className="select"
                    value={product_category_id}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        onClick={() => setCategory(category.id)}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="divider"></div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Helper Info Card */}
      <div className="alert alert-info shadow-lg mt-6 max-w-4xl mr-auto ml-auto">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Tips for adding products</h3>
            <div className="text-xs">
              • Use clear, high-quality images for better product presentation
              <br />
              • Ensure barcode numbers are accurate for inventory tracking
              <br />• Fields marked with * are required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
