import { createBrowserRouter } from "react-router";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import AdminLayout from "./views/layout/AdminLayout";
import Products from "./views/admin/Products";
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
        index: true,
        element: <Products />,
      },
    ],
  },
]);

export default router;
