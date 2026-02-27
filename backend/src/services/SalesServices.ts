import { query } from "../dbconfig";
import { Sales, SellingItem } from "../types/RequestPayload";
import { deductProductQuantity } from "./ProductServices";
export const addSale = async (sale: any) => {
  //   const { product_id, profit } = sale;

  //   const { rows } = await query(
  //     "INSERT INTO sale (product_id,profit,selling_date) VALUES ($1,$2,$3) RETURNING *",
  //     [product_id, profit, selling_date],
  //   );

  //* Sample Structure for frontend
  // //! This data is sample on how frontend data looks
  // [
  //   {
  //     sale_data: {
  //       selling_date: "2026-02-20",
  //       total: 1200,
  //       branch_id: 2,
  //       seller_id: 4,
  //     },
  //     items_data: [
  //       {
  //         product_id: 10,
  //         quantity: 2,
  //         unit_price: 500,
  //       },
  //       {
  //         product_id: 15,
  //         quantity: 1,
  //         unit_price: 200,
  //       },
  //     ],
  //   },
  // ];

  const values: any[] = [];
  const placeHolders: any[] = [];
  //Means item is not inserted
  if (!sale) {
    return false;
  }

  const { sale_data, items_data } = sale;
  const { selling_date, total, branch_id, seller_id } = sale_data;
  //Inserting sale data to sales
  //* The value total is already totaled in the frontend
  //* Branch and Seller will be added by the admin
  //* Selling date will be a date
  const { rows } = await query(
    "INSERT INTO sales (selling_date,total,branch_id,seller_id) VALUES ($1,$2,$3,$4) RETURNING sale_id",
    [selling_date, total, branch_id, seller_id],
  );

  //Insertion per item
  await query("BEGIN");
  items_data.forEach((item: any, index: number) => {
    //* Creates the base index
    const baseIndex = index * 4;

    placeHolders.push(
      `($${baseIndex + 1}, $${baseIndex + 2},$${baseIndex + 3},$${baseIndex + 4})`,
    );
    // ID here is defaulted to one (1) for testing
    values.push(
      Number(item.product_id),
      rows[0].sale_id,
      item.quantity,
      item.unit_price,
    );
  });

  await query(
    `INSERT INTO selling_item (product_id,sale_id,quantity,unit_price) VALUES ${placeHolders.join(",")}`,
    values,
  );
  await query("COMMIT");
  for (const item of items_data) {
    await deductProductQuantity(item.product_id, item.quantity);
  }
  //Deduct quantity to items

  return true;
};

export const getSales = async () => {
  const monthly = await query(
    "SELECT TO_CHAR(selling_date,'Month') AS label,SUM(selling_item.quantity) AS sales,SUM(total) AS income FROM selling_item JOIN sales ON sales.sale_id = selling_item.sale_id  GROUP BY label ORDER BY label",
  );
  const weekly = await query(
    "SELECT DATE_TRUNC('week',selling_date) AS weekly, TO_CHAR(selling_date,'Week') AS label, SUM(selling_item.quantity) AS total_sales, SUM(total) AS income FROM selling_item JOIN sales ON sales.sale_id = selling_item.sale_id  GROUP BY weekly,label,selling_date ORDER BY weekly, EXTRACT (DOW FROM selling_date)",
  );

  const daily = await query(
    "SELECT DATE_TRUNC('day',selling_date) AS daily, TO_CHAR(selling_date,'Day') AS label, SUM(selling_item.quantity) AS sales, SUM(total) AS income FROM selling_item JOIN sales ON sales.sale_id = selling_item.sale_id  GROUP BY daily,daily,selling_date ORDER BY daily, EXTRACT (DOW FROM selling_date)",
  );
  const byProduct = await query(
    "SELECT product_name as name ,SUM(selling_item.quantity) as unitsSold,SUM(unit_price) as income FROM selling_item JOIN product ON product.product_id = selling_item.product_id GROUP BY product_name",
  );

  const dashboardData = {
    monthly: monthly.rows,
    weekly: weekly.rows,
    daily: daily.rows,
    topProducts: byProduct.rows,
  };

  console.log(dashboardData);
  return dashboardData;
};
