import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("TS AND Typescript Server Working");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
