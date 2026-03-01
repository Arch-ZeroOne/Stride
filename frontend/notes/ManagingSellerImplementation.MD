# Seller Management — How It Works

A deep dive into how `SellerContext.tsx`, `ManageSeller.tsx`, and `SellersTable.tsx` are implemented and how they communicate with each other.

---

## The Big Picture

The three files follow a **Context → Table → Form** pattern:

```
SellerProvider (SellerContext.tsx)
│
├── SellersTable.tsx   ← reads context to open/close modal, handles list + delete
│   └── <ManageSeller /> ← rendered inside modal overlay, handles add/update form
```

The context sits at the top and acts as the **shared brain**. The table and the form both plug into it independently without needing to pass props between them.

---

## 1. SellerContext.tsx — The Shared Brain

### What problem does it solve?

Without context, `SellersTable` would need to pass `sellerAction`, `selectedSellerId`, and `isModalOpen` down to `ManageSeller` as props. That gets messy fast, especially as the app grows. Context lifts that shared state up so both components can read and write it freely.

### How it's built

```tsx
type SellerAction = "Add" | "Update" | null;

type SellerContextType = {
  sellerAction: SellerAction;
  selectedSellerId: number | null;
  isModalOpen: boolean;
  openModal: (action: SellerAction, id?: number) => void;
  closeModal: () => void;
  // ...setters
};
```

The context exposes **two key functions** instead of raw setters:

```tsx
const openModal = (action: SellerAction, id?: number) => {
  setSellerAction(action); // "Add" or "Update"
  setSelectedSellerId(id ?? null); // undefined becomes null for Add
  setIsModalOpen(true);
};

const closeModal = () => {
  setSellerAction(null);
  setSelectedSellerId(null);
  setIsModalOpen(false);
};
```

> **Why functions instead of raw setters?**
> `openModal` and `closeModal` always update all three pieces of state together atomically. If you exposed `setIsModalOpen` directly, a developer could open the modal without setting the action, causing bugs. The functions enforce correct usage.

### How to provide it

Wrap the page (or your whole app) with `<SellerProvider>`:

```tsx
// In your router or parent component
<SellerProvider>
  <SellersTable />
</SellerProvider>
```

### How to consume it

Any child component calls the custom hook:

```tsx
const { openModal, closeModal, isModalOpen, sellerAction, selectedSellerId } =
  useSeller();
```

The hook also throws a helpful error if you forget the provider:

```tsx
export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context)
    throw new Error("useSeller must be used within a SellerProvider");
  return context;
};
```

---

## 2. SellersTable.tsx — The List + Controller

### Fetching data

On mount, `fetchSellers` calls `GET /sellers` and stores the result in two state arrays:

```tsx
const [sellers, setSellers] = useState<Seller[]>([]); // source of truth
const [filtered, setFiltered] = useState<Seller[]>([]); // what the table displays
```

Two arrays are needed because search filters `filtered` without destroying the original `sellers`. When you clear the search, the full list is still intact.

### Auto re-fetch after modal closes

This is the key wiring between the table and the form:

```tsx
useEffect(() => {
  if (!isModalOpen) fetchSellers();
}, [isModalOpen]);
```

When `ManageSeller` calls `closeModal()` after a successful add or update, `isModalOpen` flips to `false`. This effect fires and re-fetches the latest data automatically. No callbacks, no event emitters — just a reactive effect on context state.

### Search filtering

```tsx
useEffect(() => {
  const q = search.toLowerCase();
  const results = sellers.filter(
    (s) =>
      s.firstname.toLowerCase().includes(q) ||
      s.lastname.toLowerCase().includes(q) ||
      s.branch_name?.toLowerCase().includes(q) ||
      String(s.seller_id).includes(q),
  );
  setFiltered(results);
  setPage(1); // reset to page 1 on new search
}, [search, sellers]);
```

This runs every time `search` or `sellers` changes. Resetting `page` to `1` prevents the edge case where you're on page 3, search narrows results to 1 page, and you'd see an empty table.

### Sorting

```tsx
const handleSort = (key: SortKey) => {
  const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
  // toggle direction if same column, default to asc for new column
  const sorted = [...filtered].sort((a, b) => { ... });
  setFiltered(sorted);
};
```

`[...filtered]` spreads into a new array before sorting because `.sort()` mutates in place — mutating state directly causes React not to re-render.

### Pagination

```tsx
const totalPages = Math.ceil(filtered.length / pageSize);
const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
```

`paginated` is a derived slice of `filtered` computed on every render — no extra state needed. The smart ellipsis in the pagination UI works by:

1. Keeping only page numbers that are `1`, `totalPages`, or within 1 of the current page
2. Running a `reduce` that inserts `"…"` wherever there's a gap greater than 1

### Opening the modal

```tsx
// Add button
onClick={() => openModal("Add")}

// Edit button per row
onClick={() => openModal("Update", seller.seller_id)}
```

`openModal` from context sets `sellerAction`, `selectedSellerId`, and flips `isModalOpen` to `true` all at once.

### The modal overlay

```tsx
{
  isModalOpen && (
    <div className="fixed inset-0 z-50 ...">
      {" "}
      {/* backdrop */}
      <div className="relative w-full max-w-2xl ...">
        {" "}
        {/* panel */}
        <button onClick={closeModal}>X</button>
        <ManageSeller />
      </div>
    </div>
  );
}
```

`ManageSeller` is rendered **inside** the table's JSX, not in a portal. It works because React renders conditionally — the component only mounts when `isModalOpen` is `true`, which also means `useEffect` in `ManageSeller` fires fresh every time the modal opens. The X button calls `closeModal()` directly which also triggers the re-fetch effect above.

### Status badges

```tsx
const statusStyle: Record<number, { color, bg, border, label }> = {
  1: { label: "Active",           color: "#10b981", ... },
  2: { label: "Inactive",         color: "#ef4444", ... },
  3: { label: "Disabled",         color: "#64748b", ... },
  4: { label: "Approved",         color: "#6366f1", ... },
  5: { label: "Waiting Approval", color: "#f59e0b", ... },
};

// In the row:
const badge = statusStyle[seller.status_id] ?? statusStyle[5];
```

A plain object lookup by `status_id` returns the right colors. The `?? statusStyle[5]` fallback handles any unexpected `status_id` gracefully by defaulting to the "Waiting Approval" style.

---

## 3. ManageSeller.tsx — The Add/Update Form

### Reading context

```tsx
const { sellerAction, selectedSellerId, closeModal } = useSeller();
```

- `sellerAction` — tells the form whether to POST or PATCH
- `selectedSellerId` — the ID to fetch when pre-filling for Update
- `closeModal` — called on success to close the modal and trigger the table's re-fetch

### Pre-filling on Update

```tsx
useEffect(() => {
  fetchBranches();
  fetchStatuses();

  if (sellerAction === "Update" && selectedSellerId) {
    const retrieveOld = async () => {
      const response = await client.get(`/sellers/${selectedSellerId}`);
      const { firstname, middlename, lastname, branch_id, status_id } =
        response.data;
      setFirstname(firstname);
      setMiddlename(middlename ?? "");
      setBranchId(branch_id);
      setStatusId(status_id);
      // ...
    };
    retrieveOld();
  }
}, []);
```

The empty `[]` dependency means this runs once when the component **mounts**. Since `ManageSeller` only mounts when the modal opens, this is equivalent to "run when the modal opens." The `selectedSellerId` is already set in context before the modal opens (set by `openModal`), so it's available immediately.

### Conditional status picker

```tsx
{
  sellerAction === "Update" && (
    <div>
      {statusOptions.map((s) => (
        <button
          style={status_id === s.id ? activeStyle : inactiveStyle}
          onClick={() => setStatusId(s.id)}
        >
          {status_id === s.id && <Check size={10} />}
          {s.label}
        </button>
      ))}
    </div>
  );
}
```

Status is hidden on Add because new sellers always default to `status_id = 5` (Waiting Approval) — there's no reason to let an admin set it during creation. On Update, all 5 options appear as toggle buttons. The active one shows a checkmark and gets its matching color scheme.

### The submit handler

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Validate
  if (!firstname.trim()) { Swal.fire(...); return; }
  if (!branch_id)         { Swal.fire(...); return; }

  // 2. Build payload (no account_id)
  const payload = { firstname, middlename: middlename || null, lastname, branch_id, status_id };

  // 3. POST or PATCH based on sellerAction
  switch (sellerAction) {
    case "Add":    await client.post("/sellers", payload); break;
    case "Update": await client.patch(`/sellers/${selectedSellerId}`, payload); break;
  }

  // 4. Reset form and close modal (triggers table re-fetch via context effect)
  resetForm();
  closeModal();
};
```

`middlename || null` converts an empty string to `null` before sending to the API, keeping your database clean instead of storing empty strings.

### Reset

```tsx
const resetForm = () => {
  setFirstname("");
  setMiddlename("");
  setLastname("");
  setBranchId(undefined);
  setStatusId(5);
};
```

Called both on success and when Cancel is clicked. This ensures the form is blank next time the modal opens for an Add action.

---

## Data Flow Summary

```
User clicks "Add Seller"
  → openModal("Add")                        [SellersTable]
  → sets sellerAction="Add", isModalOpen=true [SellerContext]
  → modal renders, ManageSeller mounts        [SellersTable JSX]
  → useEffect fires, fetches branches/statuses [ManageSeller]
  → user fills form, clicks submit
  → POST /sellers                            [ManageSeller]
  → resetForm() + closeModal()               [ManageSeller]
  → isModalOpen flips to false               [SellerContext]
  → useEffect([isModalOpen]) fires           [SellersTable]
  → GET /sellers re-fetches, table updates   [SellersTable]

User clicks pencil on a row
  → openModal("Update", seller.seller_id)    [SellersTable]
  → sets sellerAction="Update", selectedSellerId=N, isModalOpen=true
  → ManageSeller mounts, useEffect fires
  → GET /sellers/:id pre-fills form          [ManageSeller]
  → user edits, clicks submit
  → PATCH /sellers/:id                       [ManageSeller]
  → closeModal() → table re-fetches          [SellerContext → SellersTable]
```

---

## Key Patterns to Remember

| Pattern                                   | Why                                                     |
| ----------------------------------------- | ------------------------------------------------------- |
| Two state arrays (`sellers` + `filtered`) | Search filters without destroying source data           |
| `openModal(action, id?)` function         | Atomically sets all 3 pieces of modal state together    |
| `useEffect([isModalOpen])` in table       | Reactive re-fetch without callbacks or props            |
| Empty `[]` in ManageSeller's `useEffect`  | Runs once on mount = runs on every modal open           |
| `middlename \|\| null`                    | Sends null to DB instead of empty string                |
| `statusStyle` record lookup               | Clean badge theming by status_id without if/else chains |
| `[...filtered].sort(...)`                 | Spread before sort to avoid mutating state directly     |
