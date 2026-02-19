import { createBrowserRouter } from "react-router";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import AdminLayout from "./views/layout/AdminLayout";
import Products from "./views/admin/Products";
import ManageProduct from "./views/admin/ManageProduct";
import Branches from "./views/admin/Branches";
import Expenses from "./views/admin/Expenses";
import Sellers from "./views/admin/Sellers";
import SellerInterface from "./views/seller/SellerInterface";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "productlist",
        element: <Products />,
      },
      {
        path: "productlist/manageproduct/:id",
        element: <ManageProduct />,
      },
      {
        path: "manageproduct",
        element: <ManageProduct />,
      },
      {
        path: "branches",
        element: <Branches />,
      },
      {
        path: "expenses",
        element: <Expenses />,
      },
      {
        path: "sellers",
        element: <Sellers />,
      },
    ],
  },
  {
    path: "/seller",
    element: <SellerInterface />,
  },
]);

export default router;
