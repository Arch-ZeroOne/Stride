import { query } from "../dbconfig";
import { Product } from "../types/RequestPayload";

export const getAllProducts = async () => {
  console.log("getAllProducts service called");
  const { rows } = await query("SELECT * FROM product");
  return rows;
};

export const getProductById = async (id: number) => {
  const { rows } = await query("SELECT * FROM product WHERE id = $1", [id]);

  return rows[0];
};

export const addProduct = async (product: Product) => {
  const verified_at = null;
  let created_at = new Date();
  let updated_at = null;

  const {
    product_name,
    barcode,
    image,
    price,
    accession_number,
    product_category_id,
  } = product;

  const { rows } = await query(
    "INSERT INTO product (product_name,barcode,image,price,accession_number,created_at,updated_at,product_category_id,status_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [
      product_name,
      barcode,
      image,
      price,
      accession_number,
      created_at,
      updated_at,
      product_category_id,
      1,
    ],
  );

  return rows;
};

export const updateProduct = async (id: string, product: Product) => {
  let updated_at = new Date();

  const {
    product_name,
    image,
    price,
    accession_number,
    product_category_id,
    status_id,
  } = product;

  const { rows } = await query(
    "UPDATE product SET product_name = $1, image = $2, price = $3,updated_at = $4, product_category_id = $5 ,status_id = $6 RETURNING *",
    [product_name, image, price, updated_at, product_category_id, status_id],
  );

  return rows;
};
export const activateProduct = async (id: string) => {
  const rows = await query(
    "UPDATE product SET status_id = 1 WHERE product_id = $1 RETURNING *",
    [id],
  );

  console.log(rows);
  return rows;
};

export const deactivateProduct = async (id: string) => {
  console.log("deactivateProduct service called with id:", id);
  const rows = await query(
    "UPDATE product SET status_id = 2 WHERE product_id = $1 RETURNING *",
    [id],
  );

  return rows;
};
