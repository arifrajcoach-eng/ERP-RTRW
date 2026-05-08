# Project Guidelines for Security and Data Segregation

To ensure data integrity and prevent cross-tenant data leakage, all developers MUST adhere to the following rules:

## Firestore Query Pattern
Any new Firestore query MUST include a filter for the current user's `tenantId`.

**Example:**
```typescript
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// WRONG: const q = query(collection(db, 'data_warga'));

// RIGHT: 
const q = query(
  collection(db, 'data_warga'), 
  where('tenantId', '==', currentUser.tenantId)
);
```

## Security Rules
All security rules MUST enforce `isTenantMember(resource.data.tenantId)` for read/write operations to ensure that users can only access data belonging to their specific tenant (RW/RT). Avoid `allow read, write: if true;` at all costs.
