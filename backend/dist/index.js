"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ProductRoutes_1 = __importDefault(require("./routes/ProductRoutes"));
const SalesRoutes_1 = __importDefault(require("./routes/SalesRoutes"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", ProductRoutes_1.default);
app.use("/api", SalesRoutes_1.default);
console.log((0, express_list_endpoints_1.default)(app));
app.listen(port, () => {
    console.log("Index.ts");
    console.log(`Server is running on http://localhost:${port}`);
});
