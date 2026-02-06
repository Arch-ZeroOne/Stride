import { createBrowserRouter } from "react-router";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
