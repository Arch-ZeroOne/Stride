import { createContext, useContext, useState, type ReactNode } from "react";

type SellerAction = "Add" | "Update" | null;

type SellerContextType = {
  sellerAction: SellerAction;
  setSellerAction: (action: SellerAction) => void;
  selectedSellerId: number | null;
  setSelectedSellerId: (id: number | null) => void;
  isModalOpen: boolean;
  openModal: (action: SellerAction, id?: number) => void;
  closeModal: () => void;
};

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider = ({ children }: { children: ReactNode }) => {
  const [sellerAction, setSellerAction] = useState<SellerAction>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (action: SellerAction, id?: number) => {
    setSellerAction(action);
    setSelectedSellerId(id ?? null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSellerAction(null);
    setSelectedSellerId(null);
    setIsModalOpen(false);
  };

  return (
    <SellerContext.Provider
      value={{
        sellerAction,
        setSellerAction,
        selectedSellerId,
        setSelectedSellerId,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context)
    throw new Error("useSeller must be used within a SellerProvider");
  return context;
};
