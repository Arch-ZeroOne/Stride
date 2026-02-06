import pg, { QueryResultRow } from "pg";
import env from "dotenv";
import { QueryResult } from "pg";

env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT as string, 10),
});
db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

//helper function for query

export const query = <T = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<QueryResultRow>> => {
  return db.query(text, params);
};
