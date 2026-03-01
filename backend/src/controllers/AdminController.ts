import * as adminService from "../services/AdminService";
import { Request, Response } from "express";

// ─── GET ALL ADMINS ───────────────────────────────────────────────────────────
// Returns a list of all admins
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await adminService.getAllAdmins();
    return res.status(200).json(admins);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error:", error });
  }
};

// ─── GET ADMIN BY ID ──────────────────────────────────────────────────────────
// Returns a single admin by their admin_id; 404 if not found
export const getAdminById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const admin = await adminService.getAdminById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── ADD ADMIN ────────────────────────────────────────────────────────────────
// Creates a new admin record; responds with 201 on success
export const addAdmin = async (req: Request, res: Response) => {
  try {
    const addedAdmin = await adminService.addAdmin(req.body);
    return res.status(201).json(addedAdmin);
  } catch (error) {
    console.error("Error adding admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── UPDATE ADMIN ─────────────────────────────────────────────────────────────
// Updates admin details (firstname, lastname, image) by admin_id
export const updateAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const updatedAdmin = await adminService.updateAdmin(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DELETE ADMIN ─────────────────────────────────────────────────────────────
// Permanently deletes an admin record by admin_id; 404 if not found
export const deleteAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await adminService.deleteAdmin(id);

    if (!deleted) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res
      .status(200)
      .json({ message: "Admin deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
