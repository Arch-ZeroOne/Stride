import express, { Application } from "express";
import cors from "cors";
import ProductRoutes from "./routes/ProductRoutes";

const app: Application = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", ProductRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
