# Security Specification - VetStock Pro

## Data Invariants
- A `Product` must always have a unique name and non-negative stock values.
- `currentStock` can only be updated by `admin` (manual edit) or during a `PurchaseInvoice` registration.
- `PurchaseInvoice` is immutable once created.
- `User` roles can only be managed by existing `admin` users.
- `updatedAt` and `createdAt` must be server-side timestamps.

## The Dirty Dozen (Payloads to Block)
1. **Identity Spoofing**: An `employee` trying to change their own role to `admin`.
2. **Negative Stock**: Trying to set `currentStock` to -5.
3. **Invalid Category**: Setting category to "Electronics".
4. **ID Poisoning**: Using a 2KB string as a product ID.
5. **Unauthorized Mutation**: An unauthenticated user reading the `products` list.
6. **Price Tampering**: `employee` trying to change `purchasePrice` without a purchase invoice.
7. **Ghost Fields**: Adding `isPromoted: true` to a product document.
8. **Orphaned Invoice**: Creating an invoice referring to a non-existent `UID`.
9. **Timestamp Manipulation**: Sending a client-side `updatedAt` from the future.
10. **Admin Escalation**: Creating a user document with `role: admin` without being an admin.
11. **Bulk Scrape**: Querying `users` without a specific UID filter (unauthorized list).
12. **Invoice Deletion**: Trying to delete a `purchaseInvoice` record to hide history.

## Test Strategy
The `firestore.rules` will be tested using `@firebase/rules-unit-testing`.
- `admin` can do anything.
- `employee` can read products, edit `currentStock`, and create invoices.
- `employee` CANNOT delete anything.
- `employee` CANNOT modify user roles.
