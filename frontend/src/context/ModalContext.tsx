import React, { useState, useContext } from "react";
const ProductModalContext = React.createContext({
  productAction: null,
  setProductAction: (props: any) => {},
});
const ProductContext = React.createContext({
  productId: null,
  setProductId: (props: any) => {},
});
export const useModal = () => {
  return useContext(ProductModalContext);
};

export const useProduct = () => {
  return useContext(ProductContext);
};

export const ModalContextProvider = ({ children }: any) => {
  const [productAction, setProductAction] = useState(null);
  const [productId, setProductId] = useState<null>(null);
  return (
    <ProductContext.Provider value={{ productId, setProductId }}>
      <ProductModalContext.Provider value={{ productAction, setProductAction }}>
        {children}
      </ProductModalContext.Provider>
    </ProductContext.Provider>
  );
};
