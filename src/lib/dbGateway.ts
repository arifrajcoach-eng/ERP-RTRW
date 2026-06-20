import { 
  collection as fsCollection,
  getDocs as fsGetDocs,
  doc as fsDoc,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  query as fsQuery,
  getDoc as fsGetDoc,
  onSnapshot as fsOnSnapshot,
  where as fsWhere,
  orderBy as fsOrderBy,
  limit as fsLimit,
  writeBatch as fsWriteBatch,
  serverTimestamp as fsServerTimestamp,
  getDocFromServer as fsGetDocFromServer,
  addDoc as fsAddDoc,
  getCountFromServer as fsGetCountFromServer
} from "firebase/firestore";
import { getSupabaseClient, getSupabaseConfig } from "./supabase";

export function handleFirestoreError(err: any) {
  if (!err) return;
  const errStr = (err.message || err.toString() || "").toLowerCase();
  if (
    errStr.includes("quota") ||
    errStr.includes("resource-exhausted") ||
    errStr.includes("resource_exhausted") ||
    err.code === "resource-exhausted"
  ) {
    console.warn("Firestore Quota/Limit exhaustion intercepted by Gateway:", err);
    localStorage.setItem("firestore_quota_exceeded", "true");
    window.dispatchEvent(new CustomEvent("firestore_quota_exceeded"));
  }
}

// Translate collection names to Supabase compliant table names
export function mapCollectionToTable(colName: string): string {
  const map: { [key: string]: string } = {
    tenants: "tenants",
    users: "users",
    data_warga: "data_warga",
    keuangan: "keuangan",
    iuran: "iuran",
    surat: "surat",
    sos_alerts: "sos_alerts",
    buku_tamu: "buku_tamu",
    guest_book: "buku_tamu",
    toko_products: "toko_products",
    toko_orders: "toko_orders",
  };
  return map[colName] || colName;
}

// Check which database engine is currently preferred by the user
export function getActiveDbEngine(): "firestore" | "supabase" {
  const preferred = localStorage.getItem("preferred_db_engine");
  const config = getSupabaseConfig();
  const hasSupabaseKeys = !!config.url && !!config.anonKey;
  
  if (preferred === "supabase" && hasSupabaseKeys) {
    return "supabase";
  }
  
  const isQuotaExceeded = localStorage.getItem("firestore_quota_exceeded") === "true";
  if (isQuotaExceeded && hasSupabaseKeys) {
    return "supabase";
  }

  if (preferred === "supabase") {
    return "supabase";
  }

  return "firestore";
}

// Extracted query constraints
export interface QueryConstraintInfo {
  type: "where" | "orderBy" | "limit";
  field?: string;
  operator?: string;
  value?: any;
  direction?: "asc" | "desc";
  limitNum?: number;
}

// DB Gateway functions that match the original Firebase Firestore signature
export const dbGateway = {
  // 1. Get doc
  async getDoc(docRef: any): Promise<any> {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          const pathParts = docRef.path.split("/");
          const colName = pathParts[0];
          const docId = pathParts[1];
          const table = mapCollectionToTable(colName);
          
          const { data, error } = await client
            .from(table)
            .select("*")
            .eq("id", docId)
            .maybeSingle();

          if (error) throw error;
          
          return {
            exists: () => !!data,
            id: docId,
            ref: { id: docId, path: `${colName}/${docId}` },
            data: () => data,
            ...(data as any || {})
          };
        } catch (err) {
          console.error("Supabase getDoc failed:", err);
          throw err;
        }
      }
    }
    
    // Default fallback to standard Firestore
    try {
      return await fsGetDoc(docRef);
    } catch (err) {
      handleFirestoreError(err);
      throw err;
    }
  },

  // 2. Set doc (Insert / Upsert)
  async setDoc(docRef: any, data: any, options?: any): Promise<any> {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          const pathParts = docRef.path.split("/");
          const colName = pathParts[0];
          const docId = pathParts[1];
          const table = mapCollectionToTable(colName);

          // Clean up undefined values for PostgreSQL
          const cleanData = { ...data };
          Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === undefined) {
              cleanData[key] = null;
            }
          });

          const payload = { id: docId, ...cleanData };

          const { error } = await client
            .from(table)
            .upsert(payload);

          if (error) throw error;
          return;
        } catch (err) {
          console.error("Supabase setDoc failed:", err);
          throw err;
        }
      }
    }

    try {
      return await fsSetDoc(docRef, data, options);
    } catch (err) {
      handleFirestoreError(err);
      throw err;
    }
  },

  // 3. Update doc
  async updateDoc(docRef: any, data: any): Promise<any> {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          const pathParts = docRef.path.split("/");
          const colName = pathParts[0];
          const docId = pathParts[1];
          const table = mapCollectionToTable(colName);

          const { error } = await (client as any)
            .from(table)
            .update(data)
            .eq("id", docId);

          if (error) throw error;
          return;
        } catch (err) {
          console.error("Supabase updateDoc failed:", err);
          throw err;
        }
      }
    }

    try {
      return await fsUpdateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err);
      throw err;
    }
  },

  // 4. Delete doc
  async deleteDoc(docRef: any): Promise<any> {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          const pathParts = docRef.path.split("/");
          const colName = pathParts[0];
          const docId = pathParts[1];
          const table = mapCollectionToTable(colName);

          const { error } = await client
            .from(table)
            .delete()
            .eq("id", docId);

          if (error) throw error;
          return;
        } catch (err) {
          console.error("Supabase deleteDoc failed:", err);
          throw err;
        }
      }
    }

    try {
      return await fsDeleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err);
      throw err;
    }
  },

  // 5. Get docs (Execute queries)
  async getDocs(queryOrColRef: any): Promise<any> {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          let colName = "";
          let constraints: QueryConstraintInfo[] = [];

          if (queryOrColRef) {
            if (queryOrColRef.path) {
              colName = queryOrColRef.path;
              if (Array.isArray(queryOrColRef.constraints)) {
                constraints = queryOrColRef.constraints;
              }
            } else if (queryOrColRef._query) {
              colName = queryOrColRef._query.path?.segments?.[0] || "";
              const filters = queryOrColRef._query.filters || [];
              filters.forEach((f: any) => {
                constraints.push({
                  type: "where",
                  field: f.field?.split?.(".")?.[0] || f.field,
                  operator: f.op,
                  value: f.value?.internalValue
                });
              });
            }
          }

          if (colName) {
            const table = mapCollectionToTable(colName);
            let sQuery = client.from(table).select("*");

            sQuery = applyQueryConstraints(sQuery, constraints);

            const { data, error } = await sQuery;
            if (error) throw error;

            const docs = (data || []).map((row: any) => ({
              id: row.id,
              ref: { id: row.id, path: `${colName}/${row.id}` },
              exists: () => true,
              data: () => row,
              ...(row as any || {})
            }));

            return {
              docs,
              empty: docs.length === 0,
              size: docs.length,
              forEach: (cb: any) => docs.forEach(cb)
            };
          }
        } catch (err) {
          console.error("Supabase getDocs failed:", err);
          throw err;
        }
      }
    }

    try {
      return await fsGetDocs(queryOrColRef);
    } catch (err) {
      handleFirestoreError(err);
      throw err;
    }
  },

  // 6. Realtime Listener
  onSnapshot(queryOrDocRef: any, onNext: any, onError?: any): any {
    const engine = getActiveDbEngine();
    if (engine === "supabase") {
      const client = getSupabaseClient();
      if (client) {
        try {
          const isDoc = queryOrDocRef && queryOrDocRef.path && queryOrDocRef.path.includes("/");
          const pathParts = isDoc ? queryOrDocRef.path.split("/") : [];
          
          let colName = "";
          let constraints: QueryConstraintInfo[] = [];

          if (queryOrDocRef) {
            if (queryOrDocRef.path) {
              if (isDoc) {
                colName = pathParts[0];
              } else {
                colName = queryOrDocRef.path;
              }
              if (Array.isArray(queryOrDocRef.constraints)) {
                constraints = queryOrDocRef.constraints;
              }
            } else if (queryOrDocRef._query) {
              colName = queryOrDocRef._query.path?.segments?.[0] || "";
              const filters = queryOrDocRef._query.filters || [];
              filters.forEach((f: any) => {
                constraints.push({
                  type: "where",
                  field: f.field?.split?.(".")?.[0] || f.field,
                  operator: f.op,
                  value: f.value?.internalValue
                });
              });
            }
          }

          const table = mapCollectionToTable(colName);

          // Perform initial fetch
          if (isDoc) {
            const docId = pathParts[1];
            client.from(table).select("*").eq("id", docId).maybeSingle().then(({ data, error }) => {
              if (error) {
                if (onError) onError(error);
              } else {
                onNext({
                  exists: () => !!data,
                  ref: { id: docId, path: `${colName}/${docId}` },
                  id: docId,
                  data: () => data,
                  ...(data as any || {})
                });
              }
            });
          } else {
            let sQuery = client.from(table).select("*");
            sQuery = applyQueryConstraints(sQuery, constraints);
            sQuery.then(({ data, error }) => {
              if (error) {
                if (onError) onError(error);
              } else {
                const docs = (data || []).map((row: any) => ({
                  id: row.id,
                  ref: { id: row.id, path: `${colName}/${row.id}` },
                  exists: () => true,
                  data: () => row,
                  ...(row as any || {})
                }));
                onNext({
                  docs,
                  empty: docs.length === 0,
                  size: docs.length,
                  forEach: (cb: any) => docs.forEach(cb)
                });
              }
            });
          }

          // Setup real-time postgres listener with unique channel name to prevent "cannot add callbacks after subscribe" error
          const uniqueChannel = `realtime_${table}_${Math.random().toString(36).substring(2, 9)}`;
          const subscription = client
            .channel(uniqueChannel)
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: table },
              () => {
                if (isDoc) {
                  const docId = pathParts[1];
                  client.from(table).select("*").eq("id", docId).maybeSingle().then(({ data }) => {
                    onNext({
                      exists: () => !!data,
                      ref: { id: docId, path: `${colName}/${docId}` },
                      id: docId,
                      data: () => data,
                      ...(data as any || {})
                    });
                  });
                } else {
                  let sQuery = client.from(table).select("*");
                  sQuery = applyQueryConstraints(sQuery, constraints);
                  sQuery.then(({ data }) => {
                    const docs = (data || []).map((row: any) => ({
                      id: row.id,
                      ref: { id: row.id, path: `${colName}/${row.id}` },
                      exists: () => true,
                      data: () => row,
                      ...(row as any || {})
                    }));
                    onNext({
                      docs,
                      empty: docs.length === 0,
                      size: docs.length,
                      forEach: (cb: any) => docs.forEach(cb)
                    });
                  });
                }
              }
            )
            .subscribe();

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error("Supabase onSnapshot subscription setup failed:", err);
          if (onError) onError(err);
        }
      }
    }

    const wrappedOnError = (err: any) => {
      console.warn("Firestore listener error intercepted in gateway:", err);
      handleFirestoreError(err);
      if (onError) {
        try {
          onError(err);
        } catch (e) {
          console.error("Custom error callback execution failed:", e);
        }
      }
    };
    return fsOnSnapshot(queryOrDocRef, onNext, wrappedOnError);
  }
};

export function applyQueryConstraints(sQuery: any, constraints: QueryConstraintInfo[]): any {
  let queryBuilder = sQuery;
  for (const c of constraints) {
    if (!c || !c.type) continue;
    if (c.type === "where" && c.field && c.operator) {
      const field = c.field;
      const val = c.value;
      switch (c.operator) {
        case "==":
          queryBuilder = queryBuilder.eq(field, val);
          break;
        case "!=":
          queryBuilder = queryBuilder.neq(field, val);
          break;
        case ">":
          queryBuilder = queryBuilder.gt(field, val);
          break;
        case ">=":
          queryBuilder = queryBuilder.gte(field, val);
          break;
        case "<":
          queryBuilder = queryBuilder.lt(field, val);
          break;
        case "<=":
          queryBuilder = queryBuilder.lte(field, val);
          break;
        case "in":
          if (Array.isArray(val) && val.length > 0) {
            queryBuilder = queryBuilder.in(field, val);
          }
          break;
        case "array-contains":
          queryBuilder = queryBuilder.contains(field, [val]);
          break;
        default:
          break;
      }
    } else if (c.type === "orderBy" && c.field) {
      queryBuilder = queryBuilder.order(c.field, { ascending: c.direction !== "desc" });
    } else if (c.type === "limit" && typeof c.limitNum === "number") {
      queryBuilder = queryBuilder.limit(c.limitNum);
    }
  }
  return queryBuilder;
}

export function gatewayDoc(dbOrCol: any, pathOrId?: string, ...rest: string[]): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    if (rest.length > 0) {
      return { path: `${pathOrId}/${rest[0]}`, id: rest[0] };
    } else if (pathOrId) {
      const basePath = dbOrCol.path || dbOrCol._query?.path?.segments?.[0] || "";
      return { path: `${basePath}/${pathOrId}`, id: pathOrId };
    }
    return { path: dbOrCol };
  }
  
  if (rest.length > 0) {
    return fsDoc(dbOrCol, pathOrId!, ...rest);
  } else if (pathOrId) {
    return fsDoc(dbOrCol, pathOrId);
  }
  return fsDoc(dbOrCol);
}

export function gatewayCollection(db: any, path: string): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return { path: path };
  }
  return fsCollection(db, path);
}

export function gatewayWhere(field: string, op: string, value: any): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return { type: "where", field, operator: op, value };
  }
  return fsWhere(field, op as any, value);
}

export function gatewayLimit(num: number): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return { type: "limit", limitNum: num };
  }
  return fsLimit(num);
}

export function gatewayOrderBy(field: string, direction: "asc" | "desc" = "asc"): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return { type: "orderBy", field, direction };
  }
  return fsOrderBy(field, direction);
}

export function gatewayQuery(queryOrColRef: any, ...constraints: any[]): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    const basePath = queryOrColRef?.path || "";
    const existingConstraints = queryOrColRef?.constraints || [];
    return {
      path: basePath,
      constraints: [...existingConstraints, ...constraints.filter(Boolean)]
    };
  }
  return fsQuery(queryOrColRef, ...constraints);
}

export function gatewayWriteBatch(db?: any) {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    const operations: Array<{ type: "set" | "update" | "delete", ref: any, data?: any, options?: any }> = [];
    return {
      set(docRef: any, data: any, options?: any) {
        operations.push({ type: "set", ref: docRef, data, options });
      },
      update(docRef: any, data: any) {
        operations.push({ type: "update", ref: docRef, data });
      },
      delete(docRef: any) {
        operations.push({ type: "delete", ref: docRef });
      },
      async commit() {
        for (const op of operations) {
          if (op.type === "set") {
            await dbGateway.setDoc(op.ref, op.data, op.options);
          } else if (op.type === "update") {
            await dbGateway.updateDoc(op.ref, op.data);
          } else if (op.type === "delete") {
            await dbGateway.deleteDoc(op.ref);
          }
        }
      }
    };
  }
  return fsWriteBatch(db);
}

export function gatewayServerTimestamp(): any {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return new Date();
  }
  return fsServerTimestamp();
}

export async function gatewayGetDocFromServer(docRef: any): Promise<any> {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    return dbGateway.getDoc(docRef);
  }
  return fsGetDocFromServer(docRef);
}

export async function gatewayAddDoc(colRef: any, data: any): Promise<any> {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const docRef = gatewayDoc(colRef, id);
    await dbGateway.setDoc(docRef, data);
    return {
      id,
      ref: docRef,
      path: docRef.path
    };
  }
  return fsAddDoc(colRef, data);
}

export async function gatewayGetCountFromServer(queryRef: any): Promise<any> {
  const engine = getActiveDbEngine();
  if (engine === "supabase") {
    let table = "";
    if (typeof queryRef === "string") {
      table = queryRef;
    } else if (queryRef && typeof queryRef.path === "string") {
      table = queryRef.path;
    } else if (queryRef && queryRef._colName) {
      table = queryRef._colName;
    }

    if (!table) {
      return { data: () => ({ count: 0 }) };
    }

    try {
      const client = getSupabaseClient();
      if (client) {
        let builder = client.from(table).select("*", { count: 'exact', head: true });
        
        if (queryRef && Array.isArray(queryRef.constraints)) {
          for (const c of queryRef.constraints) {
            if (c.type === "where") {
              const { field, operator, value } = c;
              if (operator === "==") {
                builder = builder.eq(field, value);
              } else if (operator === "!=") {
                builder = builder.neq(field, value);
              } else if (operator === ">") {
                builder = builder.gt(field, value);
              } else if (operator === ">=") {
                builder = builder.gte(field, value);
              } else if (operator === "<") {
                builder = builder.lt(field, value);
              } else if (operator === "<=") {
                builder = builder.lte(field, value);
              }
            }
          }
        }

        const { count, error } = await builder;
        if (error) throw error;
        return {
          data: () => ({
            count: count || 0
          })
        };
      }
    } catch (err) {
      console.error("Supabase getCountFromServer failed:", err);
    }
    return { data: () => ({ count: 0 }) };
  }
  return fsGetCountFromServer(queryRef);
}

