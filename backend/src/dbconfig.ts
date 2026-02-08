import pg, { QueryResultRow } from "pg";
import * as dotenv from "dotenv";
import { QueryResult } from "pg";

dotenv.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || "3000", 10),
});

db.connect();
db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

//helper function for query

export const query = <T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
  return db.query<T>(text, params);
};
