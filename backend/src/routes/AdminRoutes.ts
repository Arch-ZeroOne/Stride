import { Router } from "express";
import * as adminController from "../controllers/AdminController";

const router = Router();

// ─── READ ─────────────────────────────────────────────────────────────────────
// GET all admins
router.get("/admins", adminController.getAllAdmins);

// GET a single admin by their admin_id
router.get("/admins/:id", adminController.getAdminById);

// ─── CREATE ───────────────────────────────────────────────────────────────────
// POST a new admin; body: { firstname, lastname, image? }
router.post("/admins", adminController.addAdmin);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PATCH admin details (firstname, lastname, image) by admin_id
router.patch("/admins/:id", adminController.updateAdmin);

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE an admin permanently by admin_id
router.delete("/admins/:id", adminController.deleteAdmin);

export default router;
