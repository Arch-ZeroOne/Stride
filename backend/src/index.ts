import express, { Application } from "express";
import cors from "cors";
import productRoutes from "./routes/ProductRoutes";
import expressListEndpoints from "express-list-endpoints";

const app: Application = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
console.log(expressListEndpoints(app));

app.listen(port, () => {
  console.log("Index.ts");
  console.log(`Server is running on http://localhost:${port}`);
});
