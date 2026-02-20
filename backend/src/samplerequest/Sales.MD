# Sales API Documentation

This document outlines the expected request format for creating sales and their associated items. The backend is designed to destructure these into two primary keys: `sale_data` and `items_data`.

---

## 🗄️ Database Schema Reference

The API interacts with two PostgreSQL tables:

1. **Sales** — Stores the header information (`selling_date`, `total`, `branch_id`, `seller_id`).
2. **selling_item** — Stores the array of products linked to a specific `sale_id`.

---

## 🚀 Thunder Client / Postman Request

### Request Configuration

| Property     | Value                                     |
| ------------ | ----------------------------------------- |
| **Method**   | `POST`                                    |
| **Endpoint** | `/api/sales` _(or your local equivalent)_ |
| **Headers**  | `Content-Type: application/json`          |

### Request Body (Bulk Example)

Each object in the array represents one complete transaction.

```json
[
  {
    "sale_data": {
      "selling_date": "2026-02-20",
      "total": 1200,
      "branch_id": 2,
      "seller_id": 4
    },
    "items_data": [
      {
        "product_id": 10,
        "quantity": 2,
        "unit_price": 500
      },
      {
        "product_id": 15,
        "quantity": 1,
        "unit_price": 200
      }
    ]
  }
]
```

---

## 🛠️ Implementation Guide

### Field Constraints

| Key          | Type    | Description                 | Constraints        |
| ------------ | ------- | --------------------------- | ------------------ |
| `branch_id`  | Integer | The ID of the store branch. | Must be `1` to `4` |
| `seller_id`  | Integer | The ID of the employee.     | Must be `1` to `4` |
| `total`      | Integer | Sum of all item prices.     | No decimals        |
| `items_data` | Array   | List of products sold.      | Minimum 1 item     |

### Service File Destructuring

When you receive the request in your backend service, you can destructure the keys like this:

```javascript
// Destructuring the two primary keys
const { sale_data, items_data } = req.body;

// Further destructuring for individual table inserts
const { selling_date, total, branch_id, seller_id } = sale_data;

// Loop through items_data directly (it is a raw array)
items_data.forEach((item) => {
  const { product_id, quantity, unit_price } = item;
  // logic to save...
});
```

---

## ⚠️ Notes

- **IDs** — Do not include `sale_id` or `item_id` in the request. These are handled by PostgreSQL's `SERIAL` type.
- **Validation** — The database will reject any `branch_id` or `seller_id` that falls outside the `1–4` range due to the `CHECK` constraint.
