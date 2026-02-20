import { query } from "../dbconfig";
import { Sales } from "../types/RequestPayload";
export const addSale = async (sale: any) => {
  let selling_date = new Date();

  //   const { product_id, profit } = sale;

  //   const { rows } = await query(
  //     "INSERT INTO sale (product_id,profit,selling_date) VALUES ($1,$2,$3) RETURNING *",
  //     [product_id, profit, selling_date],
  //   );
  const { items } = sale;
  const values: any[] = [];
  const placeHolders: any[] = [];

  await query("BEGIN");
  //Insertion for sale with total

  //Insertion per item
  items.forEach((item: any, index: number) => {
    const baseIndex = index * 2;
    console.log(item);
    placeHolders.push(`($${baseIndex + 1}, $${baseIndex + 2})`);
    values.push(Number(item.profit), selling_date);
  });
  console.log(placeHolders.join(","));
  console.log(values);
  await query(
    `INSERT INTO sale (profit,selling_date) VALUES ${placeHolders.join(",")}`,
    values,
  );
  await query("COMMIT");
};
