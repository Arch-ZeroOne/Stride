import { createBrowserRouter } from "react-router";
import Login from "./views/auth/Login";

import AdminLayout from "./views/layout/AdminLayout";
import Products from "./views/admin/Products";
import ManageProduct from "./views/admin/ManageProduct";
import Dashboard from "./views/admin/Dashboard";
import SellerInterface from "./views/seller/SellerInterface";
import LandingPage from "./views/landing/LandingPage";
import SellersTable from "./views/admin/SellersTable";
const router = createBrowserRouter([
  {
    path: "/signin",
    element: <Login />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
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
        path: "sellers",
        element: <SellersTable />,
      },
    ],
  },
  {
    path: "/seller",
    element: <SellerInterface />,
  },
]);

export default router;
