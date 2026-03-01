import { query } from "../dbconfig";

// ─── GET ALL ADMINS ───────────────────────────────────────────────────────────
// Fetches all admins
export const getAllAdmins = async () => {
  const { rows } = await query(
    `SELECT 
      admin_id,
      firstname,
      lastname,
      image,
      created_at,
      updated_at
     FROM admin
     ORDER BY admin_id ASC`,
  );
  return rows;
};

// ─── GET ADMIN BY ID ──────────────────────────────────────────────────────────
// Fetches a single admin record by their admin_id
export const getAdminById = async (id: number) => {
  const { rows } = await query(
    `SELECT 
      admin_id,
      firstname,
      lastname,
      image,
      created_at,
      updated_at
     FROM admin
     WHERE admin_id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

// ─── ADD ADMIN ────────────────────────────────────────────────────────────────
// Inserts a new admin record
export const addAdmin = async (admin: any) => {
  const { firstname, lastname, image } = admin;

  const { rows } = await query(
    `INSERT INTO admin 
      (firstname, lastname, image, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [firstname, lastname, image ?? null],
  );
  return rows[0];
};

// ─── UPDATE ADMIN ─────────────────────────────────────────────────────────────
// Updates editable fields of an admin by admin_id
export const updateAdmin = async (id: string, admin: any) => {
  const { firstname, lastname, image } = admin;

  const { rows } = await query(
    `UPDATE admin
     SET 
       firstname  = $1,
       lastname   = $2,
       image      = $3,
       updated_at = NOW()
     WHERE admin_id = $4
     RETURNING *`,
    [firstname, lastname, image ?? null, id],
  );
  return rows[0];
};

// ─── DELETE ADMIN ─────────────────────────────────────────────────────────────
// Permanently removes an admin record by admin_id
export const deleteAdmin = async (id: number) => {
  const { rows } = await query(
    `DELETE FROM admin WHERE admin_id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
};
