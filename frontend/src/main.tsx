import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router.tsx";
import { ModalContextProvider } from "./context/ModalContext.tsx";
import { BarcodeContextProvider } from "./context/BarcodeContext.tsx";
import { SellerProvider } from "./context/SellerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModalContextProvider>
      <SellerProvider>
        <BarcodeContextProvider>
          <RouterProvider router={router} />
        </BarcodeContextProvider>
      </SellerProvider>
    </ModalContextProvider>
  </StrictMode>,
);
