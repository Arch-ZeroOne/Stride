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
  product_id: number;
  profit: number;
  selling_date: number;
};
