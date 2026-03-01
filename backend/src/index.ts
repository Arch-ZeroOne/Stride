import express, { Application } from "express";
import cors from "cors";
import productRoutes from "./routes/ProductRoutes";
import saleRoutes from "./routes/SalesRoutes";
import expressListEndpoints from "express-list-endpoints";
import sellerRoutes from "./routes/SellerRoutes";
const app: Application = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", saleRoutes);
app.use("/api", sellerRoutes);

app.listen(port, () => {
  console.log("Index.ts");
  console.log(`Server is running on http://localhost:${port}`);
});
