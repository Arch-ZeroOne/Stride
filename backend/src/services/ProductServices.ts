import { query } from "../dbconfig";
import { Product } from "../types/RequestPayload";
import * as util from "../util/util";

export const getAllProducts = async () => {
  const { rows } = await query("SELECT * FROM product");
  return rows;
};

export const getProductById = async (id: number) => {
  const { rows } = await query("SELECT * FROM products WHERE product_id = $1", [
    id,
  ]);

  return rows[0];
};

export const addProduct = async (product: Product) => {
  const verified_at = null;
  let created_at = new Date();
  let updated_at = null;
  const barcode = await util.generateProductBarcode();

  const { product_name, image, price, product_category_id, quantity } = product;

  const { rows } = await query(
    "INSERT INTO products (product_name,barcode,image,price,created_at,updated_at,product_category_id,status_id,quantity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [
      product_name,
      barcode,
      image,
      price,
      created_at,
      updated_at,
      product_category_id,
      1,
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
  console.log("Status ID:" + status_id);
  if (!status_id) {
    status_id = 1;
  }

  let queryString =
    "UPDATE products SET product_name = $1, price = $2,updated_at = $3, product_category_id = $4 ,status_id = $5,quantity = $6";

  if (image) {
    queryString += ",image = $7";
    queryString += " WHERE product_id = $8";
    params.push(image);
  } else {
    queryString += " WHERE product_id = $7";
  }

  params.push(id);

  const { rows } = await query(`${queryString} RETURNING *`, params);

  return rows;
};
export const activateProduct = async (id: string) => {
  const rows = await query(
    "UPDATE products SET status_id = 1 WHERE product_id = $1 RETURNING *",
    [id],
  );

  console.log(rows);
  return rows;
};

export const deactivateProduct = async (id: string) => {
  console.log("deactivateProduct service called with id:", id);
  const rows = await query(
    "UPDATE products SET status_id = 2 WHERE product_id = $1 RETURNING *",
    [id],
  );

  return rows;
};

export const getCategories = async () => {
  const { rows } = await query("SELECT * FROM productcategories");
  return rows;
};

export const getByBarcode = async (barcode: string) => {
  const { rows } = await query("SELECT * FROM products WHERE barcode = $1", [
    barcode,
  ]);
  console.log(rows);
};
