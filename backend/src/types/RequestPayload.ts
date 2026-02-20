export type Product = {
  id?: number;
  product_name: string;
  barcode?: string;
  image?: string;
  price: number;
  accession_number?: string;
  created_at?: Date;
  updated_at?: Date;
  product_category_id: number;
  status_id: number;
  quantity?: number;
};

export type Sales = {
  sale_id?: number;
  selling_date: Date;
  total: number;
  branch_id: number;
  seller_id: number;
};

export type SellingItem = {
  item_id: number;
  product_id: number;
  sale_id: number;
  quantity: number;
  unit_price: number;
};
