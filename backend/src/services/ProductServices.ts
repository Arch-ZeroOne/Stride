import { query } from "../dbconfig";
import { Product } from "../types/RequestPayload";
import * as util from "../util/util";

// ── Stock Check Helper ────────────────────────────────────────────────────────
// status_id 1 = active, 2 = deactivated, 3 = out of stock
const checkAndUpdateStockStatus = async (id: string | number) => {
  const { rows } = await query(
    "SELECT quantity, status_id FROM product WHERE product_id = $1",
    [id],
  );

  if (!rows[0]) return;
  console.log("Checking updatable status");
  const { quantity, status_id } = rows[0];

  if (quantity <= 10) {
    console.log("Out of stock");
    await query("UPDATE product SET status_id = 4 WHERE product_id = $1", [id]);
  }
  // If out of stock and currently active → mark as out of stock (status_id = 3)
  if (quantity <= 0 && status_id === 1) {
    await query("UPDATE product SET status_id = 3 WHERE product_id = $1", [id]);
  }

  // If back in stock and was out of stock → restore to active (status_id = 1)
  if (quantity > 0 && status_id === 3) {
    await query("UPDATE product SET status_id = 1 WHERE product_id = $1", [id]);
    console.log(`Product ${id} restored to active`);
  }

  //If back in stock and stock is equal or below 10

  if (quantity <= 10 && quantity != 0 && status_id === 1) {
    await query("UPDATE product SET status_id = 4 WHERE product_id = $1", [id]);
  }
  if (quantity <= 0 && status_id === 4) {
    console.log("No Stock");
    await query("UPDATE product SET status_id = 3 WHERE product_id = $1", [id]);
  }
};

// ── Queries ───────────────────────────────────────────────────────────────────
export const getAllProducts = async () => {
  const { rows } = await query("SELECT * FROM product");
  return rows;
};

export const getProductById = async (id: number) => {
  const { rows } = await query("SELECT * FROM product WHERE product_id = $1", [
    id,
  ]);
  return rows[0];
};

export const addProduct = async (product: Product) => {
  const verified_at = null;
  let created_at = new Date();
  let updated_at = null;
  const barcode = await util.generateProductBarcode();
  let status_id = 1;
  const { product_name, image, price, product_category_id, quantity } = product;

  if (quantity) {
    status_id = quantity > 0 ? 1 : 3;
  }

  const { rows } = await query(
    "INSERT INTO product (product_name,barcode,image,price,created_at,updated_at,product_category_id,status_id,quantity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [
      product_name,
      barcode,
      image,
      price,
      created_at,
      updated_at,
      product_category_id,
      status_id, // set out of stock immediately if quantity is 0
      quantity,
    ],
  );

  return rows;
};

export const updateProduct = async (id: string, product: Product) => {
  let updated_at = new Date();

  let { product_name, image, price, product_category_id, status_id, quantity } =
    product;

  let params = [
    product_name,
    price,
    updated_at,
    product_category_id,
    status_id,
    quantity,
  ];

  if (!status_id) {
    console.log("No Status Id");
    status_id = 1;
  }

  let queryString =
    "UPDATE product SET product_name = $1, price = $2, updated_at = $3, product_category_id = $4, status_id = $5, quantity = $6";

  if (image) {
    queryString += ", image = $7";
    queryString += " WHERE product_id = $8";
    params.push(image);
  } else {
    queryString += " WHERE product_id = $7";
  }

  params.push(id);

  const { rows } = await query(`${queryString} RETURNING *`, params);

  // Re-check stock status after update since quantity may have changed
  await checkAndUpdateStockStatus(id);

  return rows;
};

// Called from your sales service after a successful sale to deduct quantity
export const deductProductQuantity = async (
  product_id: number,
  quantity_sold: number,
) => {
  const { rows } = await query(
    "UPDATE product SET quantity = quantity - $1 WHERE product_id = $2 RETURNING *",
    [quantity_sold, product_id],
  );

  if (!rows[0]) throw new Error(`Product ${product_id} not found`);

  // Check and auto-update status after deduction
  await checkAndUpdateStockStatus(product_id);

  return rows[0];
};

export const activateProduct = async (id: string) => {
  // Only allow activation if product has stock
  const { rows: check } = await query(
    "SELECT quantity FROM product WHERE product_id = $1",
    [id],
  );

  if (!check[0]) throw new Error("Product not found");

  if (check[0].quantity <= 0) {
    throw new Error("Cannot activate a product with zero stock");
  }

  const { rows } = await query(
    "UPDATE product SET status_id = 1 WHERE product_id = $1 RETURNING *",
    [id],
  );

  return rows;
};

export const deactivateProduct = async (id: string) => {
  const rows = await query(
    "UPDATE product SET status_id = 2 WHERE product_id = $1 RETURNING *",
    [id],
  );
  return rows;
};
export const markOutOfStock = async (id: string) => {
  const { rows: check } = await query(
    "SELECT * FROM product WHERE product_id = $1",
    [id],
  );

  if (check[0].quantity > 0) {
    throw new Error(
      "Cannot mark out of stock  a product with greater than 10 stock",
    );
  }

  const { rows } = await query(
    "UPDATE product SET status_id = 3 WHERE product_id = $1 RETURNING *",
    [id],
  );
  await checkAndUpdateStockStatus(id);
  return rows;
};

export const getCategories = async () => {
  const { rows } = await query("SELECT * FROM productcategories");
  return rows;
};

export const getByBarcode = async (barcode: string) => {
  const { rows } = await query("SELECT * FROM product WHERE barcode = $1", [
    barcode,
  ]);
  return rows;
};
