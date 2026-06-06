# Security Specification: Kas Collection

## 1. Data Invariants
- Kas collection documents MUST belong to a valid tenant.
- Deletions in Kas collection are only authorized for tenant members or admins.

## 2. Dirty Dozen Payloads (Target: Kas Collection)
1. Delete as anonymous
2. Delete as standard user (wrong tenant)
3. Delete as admin (should succeed)
4. Delete as tenant member (should succeed)
5. Update Kas as anonymous
6. Update Kas as standard user (wrong tenant)
7. Create Kas with no tenantId
8. Create Kas as anonymous
9. List Kas as anonymous
... (remaining payloads to be defined)

## 3. Test Runner (firestore.rules.test.ts)
... (this file would verify the payloads)
