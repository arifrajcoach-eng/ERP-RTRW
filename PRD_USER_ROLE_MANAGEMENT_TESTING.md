# PRD: User Role & Security Integrity for SmartRW AI

## 1. Overview
This PRD outlines the requirements for implementing, validating, and securing user role management within the SmartRW AI multi-tenant ecosystem. The focus is to ensure robust Role-Based Access Control (RBAC) and strict data segregation between tenant hierarchies (RW/RT).

## 2. Core Goals
- **Strict Data Segregation**: Ensure that no user can access or modify data belonging to a different tenant unless they possess specific administrative authority (`SUPER_ADMIN`).
- **Granular RBAC**: Implement clearly defined permission sets for different roles (`SUPER_ADMIN`, `RW`, `RT`, `WARGA`, `VIEWER`).
- **Auditability**: All changes to user roles must be logged through the `auditLogService`.

## 3. Functional Requirements
- **User Role Management Interface**: A secure dashboard for `SUPER_ADMIN` and `RW/RT` administrators to manage user roles within their scope.
- **Tenant Scope Enforcement**: Functions that modify user roles must validate that the admin has the authority to manage the target user's tenant.
- **`SUPER_ADMIN` Bypass**: A special `SUPER_ADMIN` role that acts as a global administrator for maintenance and platform-wide configuration.

## 4. Integration & E2E Testing Strategy

To ensure security and functional integrity, the following test scenarios must be implemented.

### A. Integration Testing ([/src/lib/userManagement.ts])
- [ ] **Role Modification**: Verify `updateUserRoleInFirestore` updates both `role` and `isSuperAdmin` fields correctly.
- [ ] **Tenant Authorization**: Verify `updateUserRoleInFirestore` fails if an RW tries to modify a user from a completely disparate tenant structure without authorization.

### B. E2E Testing Scenarios
- [ ] **Test Case: Cross-Tenant Breach**: Login as `RT` of RT-A. Attempt to access/modify a record of `WARGA` in RT-B. Result: Must be denied (403/Error).
- [ ] **Test Case: Privilege Escalation**: Login as `WARGA`. Attempt to trigger the API path or UI action that updates another user's role. Result: Must be denied.
- [ ] **Test Case: Role View Filtering**:
  - Login as `WARGA`: Check the navigation menu. Items like "Verifikasi" or "Data Warga" must be hidden/filtered based on existing role rules in `/src/App.tsx`.
  - Login as `RT/RW`: Verify "Verifikasi" or "Data Warga" are accessible.
- [ ] **Test Case: SUPER_ADMIN Persistence**: Login as `SUPER_ADMIN`. Validate that all tenant data is accessible for maintenance, and audit logs correctly record the impersonation or administrative access.

## 5. Security & Governance Rules
- **Rule 1 (Data Segregation)**: Firestore queries MUST always include a `where('tenantId', '==', ...)` clause unless the user is a `SUPER_ADMIN`.
- **Rule 2 (Role Validation)**: Client-side UI must not be the only line of defense. Firestore security rules must match the role/tenant logic implemented in the backend.
- **Rule 3 (Audit)**: Any role changes must trigger an entry in the system logs.
