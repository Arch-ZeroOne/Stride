import { query } from "../dbconfig";
import { Sales, SellingItem } from "../types/RequestPayload";

export const addSale = async (sale: any) => {
  let selling_date = new Date();

  //   const { product_id, profit } = sale;

  //   const { rows } = await query(
  //     "INSERT INTO sale (product_id,profit,selling_date) VALUES ($1,$2,$3) RETURNING *",
  //     [product_id, profit, selling_date],
  //   );

  //* Sample Structure for frontend
  //! This data is sample on how frontend data looks
  [
    {
      sale_data: {
        selling_date: "2026-02-20",
        total: 1200,
        branch_id: 2,
        seller_id: 4,
      },
      items_data: [
        {
          product_id: 10,
          quantity: 2,
          unit_price: 500,
        },
        {
          product_id: 15,
          quantity: 1,
          unit_price: 200,
        },
      ],
    },
  ];

  const values: any[] = [];
  const placeHolders: any[] = [];
  //Means item is not inserted
  if (!sale) {
    return false;
  }
  sale.forEach(async (item: any) => {
    const { sale_data, items_data } = item;
    const { selling_date, total, branch_id, seller_id } = sale_data;
    //Inserting sale data to sales
    //* The value total is already totaled in the frontend
    //* Branch and Seller will be added by the admin
    //* Selling date will be a date
    const { rows } = await query(
      "INSERT INTO sales (selling_date,total,branch_id,seller_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [selling_date, total, branch_id, seller_id],
    );

    //Insertion per item
    await query("BEGIN");
    items_data.forEach((item: any, index: number) => {
      //* Creates the base index
      const baseIndex = index * 4;
      console.log("Index:", index);
      console.log("Base Index:" + baseIndex);
      placeHolders.push(
        `($${baseIndex + 1}, $${baseIndex + 2},$${baseIndex + 3},$${baseIndex + 4})`,
      );
      // ID here is defaulted to one (1) for testing
      values.push(Number(item.product_id), 1, item.quantity, item.unit_price);
    });
    console.log(placeHolders.join(","));
    console.log(values);
    await query(
      `INSERT INTO selling_item (product_id,sale_id,quantity,unit_price) VALUES ${placeHolders.join(",")}`,
      values,
    );
    await query("COMMIT");
  });

  return true;
};
