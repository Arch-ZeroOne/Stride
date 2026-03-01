import { query } from "../dbconfig";

// ─── GET ALL SELLERS ──────────────────────────────────────────────────────────
// Fetches all sellers joined with their account status
export const getAllSellers = async () => {
  const { rows } = await query(
    `SELECT 
      s.seller_id,
      s.firstname,
      s.middlename,
      s.lastname,
      s.branch_id,
      s.created_at,
      s.updated_at,
      s.status_id,
      ast.status_name AS account_status
     FROM seller s
     LEFT JOIN account_status ast ON ast.status_id = s.status_id
     ORDER BY s.seller_id ASC`,
  );
  return rows;
};

// ─── GET SELLER BY ID ─────────────────────────────────────────────────────────
// Fetches a single seller record by their seller_id
export const getSellerById = async (id: number) => {
  const { rows } = await query(
    `SELECT 
      s.seller_id,
      s.firstname,
      s.middlename,
      s.lastname,
      s.branch_id,
      s.created_at,
      s.updated_at,
      ast.status_name AS account_status
     FROM seller s
     LEFT JOIN account_status ast ON ast.status_id = s.status_id
     WHERE s.seller_id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

// ─── ADD SELLER ───────────────────────────────────────────────────────────────
// Inserts a new seller record; defaults status to 'Waiting Approval' (status_id = 5)
export const addSeller = async (seller: any) => {
  const { firstname, middlename, lastname, branch_id, account_id, status_id } =
    seller;

  const { rows } = await query(
    `INSERT INTO seller 
      (firstname, middlename, lastname, branch_id,status_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [
      firstname,
      middlename ?? null,
      lastname,
      branch_id,
      status_id ?? 5, // Default: Waiting Approval
    ],
  );
  return rows[0];
};

// ─── UPDATE SELLER ────────────────────────────────────────────────────────────
// Updates editable fields of a seller by seller_id
export const updateSeller = async (id: string, seller: any) => {
  const { firstname, middlename, lastname, branch_id, status_id } = seller;

  const { rows } = await query(
    `UPDATE seller
     SET 
       firstname   = $1,
       middlename  = $2,
       lastname    = $3,
       branch_id   = $4,
       status_id = $5,
       updated_at  = NOW()
     WHERE seller_id = $6
     RETURNING *`,
    [firstname, middlename ?? null, lastname, branch_id, status_id, id],
  );
  return rows[0];
};

// ─── DELETE SELLER ────────────────────────────────────────────────────────────
// Permanently removes a seller record by seller_id
export const deleteSeller = async (id: number) => {
  const { rows } = await query(
    `DELETE FROM seller WHERE seller_id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
};

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────
// Shared helper to update only the status_id of a seller
const updateSellerStatus = async (id: string, status_id: number) => {
  const { rows } = await query(
    `UPDATE seller
     SET status_id  = $1,
         updated_at = NOW()
     WHERE seller_id = $2
     RETURNING *`,
    [status_id, id],
  );
  return rows[0];
};

export const getAllBranch = async () => {
  const { rows } = await query("SELECT * FROM branch");
  return rows;
};

export const logIn = async (seller: any) => {
  const { firstname, lastname } = seller;
  const { rows } = await query(
    "SELECT status_id FROM seller WHERE  firstname = $1 AND lastname = $2",
    [firstname, lastname],
  );

  return rows;
};

// Sets seller status to Active (status_id = 1)
export const activateSeller = async (id: string) => updateSellerStatus(id, 1);

// Sets seller status to Inactive (status_id = 2)
export const deactivateSeller = async (id: string) => updateSellerStatus(id, 2);

// Sets seller status to Disabled (status_id = 3)
export const disableSeller = async (id: string) => updateSellerStatus(id, 3);

// Sets seller status to Approved (status_id = 4)
export const approveSeller = async (id: string) => updateSellerStatus(id, 4);

// Sets seller status to Waiting Approval (status_id = 5)
export const setWaitingApproval = async (id: string) =>
  updateSellerStatus(id, 5);
