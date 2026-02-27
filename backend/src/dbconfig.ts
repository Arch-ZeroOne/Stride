import pg, { QueryResultRow } from "pg";
import * as dotenv from "dotenv";
import { QueryResult } from "pg";

dotenv.config();

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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
