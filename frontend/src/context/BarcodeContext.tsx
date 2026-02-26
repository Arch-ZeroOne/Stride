import React, { useState, useContext } from "react";

const BarcodeContext = React.createContext({
  barcode: null,
  setBarcode: (props: any) => {
    console.log(props);
  },
});

export const useBarcode = () => {
  return useContext(BarcodeContext);
};

export const BarcodeContextProvider = ({ children }: any) => {
  const [barcode, setBarcode] = useState(null);
  return (
    <BarcodeContext.Provider value={{ barcode, setBarcode }}>
      {children}
    </BarcodeContext.Provider>
  );
};
