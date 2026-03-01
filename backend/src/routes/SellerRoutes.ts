import { Router } from "express";
import * as sellerController from "../controllers/SellerController";

const router = Router();

// ─── READ ─────────────────────────────────────────────────────────────────────
// GET all sellers (with joined account status)
router.get("/sellers", sellerController.getAllSellers);

// GET a single seller by their seller_id
router.get("/sellers/:id", sellerController.getSellerById);
// Gets the branch of the user
//! Why not working when /sellers/branches ?
router.get("/sellers/branches/index", sellerController.getAllBranch);
// ─── CREATE ───────────────────────────────────────────────────────────────────
// POST a new seller; body: { firstname, middlename?, lastname, branch_id, account_id, status_id? }
router.post("/sellers", sellerController.addSeller);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PATCH seller details (name, branch, account) by seller_id
router.patch("/sellers/:id", sellerController.updateSeller);

// ─── STATUS UPDATES ───────────────────────────────────────────────────────────
// PATCH — set status to Active (status_id = 1)
router.patch("/sellers/activate/:id", sellerController.activateSeller);

// PATCH — set status to Inactive (status_id = 2)
router.patch("/sellers/deactivate/:id", sellerController.deactivateSeller);

// PATCH — set status to Disabled (status_id = 3)
router.patch("/sellers/disable/:id", sellerController.disableSeller);

// PATCH — set status to Approved (status_id = 4)
router.patch("/sellers/approve/:id", sellerController.approveSeller);

// PATCH — set status to Waiting Approval (status_id = 5)
router.patch("/sellers/waiting/:id", sellerController.setWaitingApproval);

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE a seller permanently by seller_id
router.delete("/sellers/:id", sellerController.deleteSeller);

// POST a new seller; body: { firstname, middlename?, lastname, branch_id, account_id, status_id? }
router.post("/sellers/login", sellerController.logIn);

export default router;
