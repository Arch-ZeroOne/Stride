import * as sellerService from "../services/SellerService";
import { Request, Response } from "express";
import { SellerParams } from "../types/SellerParams";

// ─── GET ALL SELLERS ──────────────────────────────────────────────────────────
// Returns a list of all sellers with their current account status
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await sellerService.getAllSellers();
    return res.status(200).json(sellers);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error:", error });
  }
};

// ─── GET SELLER BY ID ─────────────────────────────────────────────────────────
// Returns a single seller by their seller_id; 404 if not found
export const getSellerById = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const seller = await sellerService.getSellerById(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    return res.status(200).json(seller);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── ADD SELLER ───────────────────────────────────────────────────────────────
// Creates a new seller record; responds with 201 on success
export const addSeller = async (req: Request, res: Response) => {
  try {
    const addedSeller = await sellerService.addSeller(req.body);
    return res.status(201).json(addedSeller);
  } catch (error) {
    console.error("Error adding seller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── UPDATE SELLER ────────────────────────────────────────────────────────────
// Updates seller details (name, branch, account) by seller_id
export const updateSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const updatedSeller = await sellerService.updateSeller(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DELETE SELLER ────────────────────────────────────────────────────────────
// Permanently deletes a seller record by seller_id; 404 if not found
export const deleteSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await sellerService.deleteSeller(id);

    if (!deleted) {
      return res.status(404).json({ message: "Seller not found" });
    }
    return res
      .status(200)
      .json({ message: "Seller deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting seller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── ACTIVATE SELLER ──────────────────────────────────────────────────────────
// Sets the seller's account status to Active (status_id = 1)
export const activateSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const activated = await sellerService.activateSeller(req.params.id);
    return res.status(200).json(activated);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DEACTIVATE SELLER ────────────────────────────────────────────────────────
// Sets the seller's account status to Inactive (status_id = 2)
export const deactivateSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const deactivated = await sellerService.deactivateSeller(req.params.id);
    return res.status(200).json(deactivated);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DISABLE SELLER ───────────────────────────────────────────────────────────
// Sets the seller's account status to Disabled (status_id = 3)
export const disableSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const disabled = await sellerService.disableSeller(req.params.id);
    return res.status(200).json(disabled);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── APPROVE SELLER ───────────────────────────────────────────────────────────
// Sets the seller's account status to Approved (status_id = 4)
export const approveSeller = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const approved = await sellerService.approveSeller(req.params.id);
    return res.status(200).json(approved);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── SET WAITING APPROVAL ─────────────────────────────────────────────────────
// Sets the seller's account status to Waiting Approval (status_id = 5)
export const setWaitingApproval = async (
  req: Request<SellerParams>,
  res: Response,
) => {
  try {
    const waiting = await sellerService.setWaitingApproval(req.params.id);
    return res.status(200).json(waiting);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBranch = async (req: Request, res: Response) => {
  try {
    console.log("Controller hit");
    const branches = await sellerService.getAllBranch();
    return res.status(200).json(branches);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error:", error });
  }
};
export const logIn = async (req: Request, res: Response) => {
  try {
    const sellerStatus = await sellerService.logIn(req.body);
    if (sellerStatus[0].status_id === 1) {
      return res.status(200).json({ logged: true });
    } else if (sellerStatus[0].status_id === 2) {
      return res.status(200).json({
        logged: false,
        message: "Account Inactive Please Contact the Admin",
      });
    } else if (sellerStatus[0].status_id === 3) {
      return res.status(200).json({
        logged: false,
        message: "Account Disabled Please Contact the Admin",
      });
    } else if (sellerStatus[0].status_id === 4) {
      return res.status(200).json({
        logged: false,
        message: "Account Still Waiting Approval Please Contact the Admin",
      });
    }
  } catch (error) {
    console.error("Error adding seller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
