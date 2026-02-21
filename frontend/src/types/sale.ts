export type SaleData = {
  selling_date: Date;
  total: number | undefined;
  branch_id: number;
  seller_id: number;
};

export type ItemData = {
  product_id: number;
  quantity: number;
  unit_price: number;
};
