# CLAUDE.md

This file defines build, test, and structural guidelines for **SmartRW AI**. Adhere strictly to these standards.

## Build and Code Quality Commands
- **Install Dependencies**: `npm install`
- **Lint & Type Check**: `npm run lint` (`tsc --noEmit`)
- **Build Server & Client**: `npm run build`
- **Start Application**: `npm run start`
- **Automated Verification**: `npm run verify` (`tsx scripts/verify-tenant.ts`)
- **Full Test Suite**: `npm run test`

---

## 🚨 ABSOLUTE CANONS (MUST ALWAYS FOLLOW)

### 1. Parent & Child Tenant Integrity (RT & RW Relationship)
The application relies on a multi-tenant hierarchy consisting of **Parent Tenants (RW / Main Region)** and **Child Tenants (RT / Sub-Region)**. These relations must **NEVER** be altered, severed, or bypassed:
- **`parentId` Field**: Each Child (RT) Tenant must define and maintain a `parentId` referencing its Parent (RW). Never ignore this field as doing so disables essential iuran (fees), news, and data synchronization.
- **Impersonation Sessions**: Parent admins can inspect/access Child Tenants using `impersonatedTenantId` stored in `localStorage`. 
- **Protected Storage Keys**: The keys `currentTenant`, `parentTenant`, `impersonatedTenantId`, `firebase:auth`, and `firebaseLocalStorageDb` are sacred. Automated cleanups or recovery triggers must **NEVER** clear them.

### 2. Firestore Data Segregation
- **Always Filter queries**: Every Firestore query must filter records by the active tenant ID (`currentTenant.id` or `currentUser.tenantId`).
```typescript
// Correct Segregation Query Pattern:
const q = query(
  collection(db, 'data_warga'), 
  where('tenantId', '==', currentUser.tenantId)
);
```
- **Security Rules**: Firestore rules (`firestore.rules`) must execute membership verification (e.g., `isTenantMember(resource.data.tenantId)`) rather than generic `allow read, write: if true;`.

### 3. Self-Healing & Fault Tolerance (No Blank Screens)
- **Global & Local Error boundaries**: All key display matrices must be wrapped by the `ErrorBoundary` component. Small constituent card/chart errors must never fail the entire landing viewport.
- **Safeguarded Local Clear**: Any local storage or database state parsing exception must be enclosed in `try-catch` blocks and leverage white-listed keys (`["firebase:auth", "impersonatedTenantId", "currentTenant", "parentTenant", "firebaseLocalStorageDb"]`) to prune corrupted state without kicking out user sessions.

---

## Code Styling & Guidelines
- **Language**: Strict TypeScript. Always declare types and return types. Avoid the `any` keyword.
- **Components**: Functional React components with state hooks. Avoid state updates directly in the component body.
- **Imports**: Named imports only. Always place type-safe declarations at the top.
- **Styling**: Tailwind CSS exclusively (`@import "tailwindcss";` in `src/index.css`). Never introduce secondary `.css` files.
- **Icons**: Sourced from `lucide-react` exclusively.
