import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Users, Trash2, Edit2, Download, Printer, UserPlus, 
  MapPin, Phone, Info, Search, X, CheckCircle, AlertCircle, Eye, EyeOff, ClipboardList, Trash, ShieldCheck, LogOut, Menu, Lock,
  ChevronDown, ChevronLeft, ChevronRight, Database, SlidersHorizontal
} from 'lucide-react';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, collection, where } from 'firebase/firestore';                
import { db } from '../firebase';
import { logAuditEvent } from '../services/auditLogService';
import { getTranslatedLabel } from '../lib/langUtils';
import { getPlanFeatures } from '../lib/appUtils';

interface WargaViewProps {
  wargaData: any[];
  currentTenant?: any;
  setWargaData: any;
  userRole: string;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  handleFileUpload: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUser: any;
  settings?: any;
  tenantsData?: any[];
}

const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  const parts = tglLahir.split('-');
  if (parts.length !== 3) return "-";
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getTenantGroup = (tId: string): string => {
  if (!tId) return "";
  const id = tId.toLowerCase();
  if (id.includes("berjuang")) return "berjuang";
  if (id.includes("trih")) return "trih";
  if (id.includes("rw26") || id.includes("rw_26")) return "rw26";
  return id;
};

// Check if a child tenant ID relates strictly to its parent tenant ID to prevent cross-RW leaks
const isBelongsToParent = (childId: string, parentId: string): boolean => {
  if (!childId || !parentId) return false;
  const child = childId.toLowerCase();
  const parent = parentId.toLowerCase();
  if (child === parent) return true;
  
  // Group check: they must belong to the exact same group
  const childGroup = getTenantGroup(child);
  const parentGroup = getTenantGroup(parent);
  if (childGroup !== parentGroup) return false;
  
  // Prefix/Suffix search to ensure it is actually a parent-child structure
  const isParentInChild = child.includes(parent) || parent.includes(child);
  
  return isParentInChild;
};

function WargaView(props: WargaViewProps) { 
  const { 
      wargaData, 
      currentTenant, 
      setWargaData, 
      userRole, 
      tenantId, 
      setIsLoadingDB, 
      handleFirestoreError, 
      handleFileUpload, 
      showNotification, 
      currentUser,
      settings,
      tenantsData
  } = props;

  // Restriction: WARGA cannot access Data Warga
  if (userRole?.toUpperCase() === 'WARGA') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-full mb-6">
          <Lock className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Akses Terbatas</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Mohon maaf, Anda tidak memiliki izin untuk mengakses data warga. 
          Hanya Admin dan Operator yang diperbolehkan melihat modul ini.
        </p>
      </div>
    );
  }
  const isApt = settings?.themeMode === 'apartemen';
  const tenant = currentTenant || {};
  
  // Use shared logic to calculate features (including maxWarga from add-ons)
  const planFeatures = getPlanFeatures(tenant);
  const maxWargaLimit = planFeatures.maxWarga;
  const limitReached = wargaData.length >= maxWargaLimit;

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);

  const isRTAdmin = currentUser?.role === 'RT';
  const myRT = currentUser?.rt || '01';

  // Auto-detect RT from tenant name (e.g. "RT 01 / RW 26") or from tenant identifier
  const detectedRT = useMemo(() => {
    if (!tenant?.name) return null;
    const match = tenant.name.match(/RT\s*(\d+)/i);
    if (match) {
      return match[1].padStart(2, '0');
    }
    return null;
  }, [tenant?.name]);

  const [filterRT, setFilterRT] = useState(isRTAdmin ? myRT : (detectedRT || "Semua"));

  useEffect(() => {
    if (isRTAdmin) {
      setFilterRT(myRT);
    } else if (detectedRT) {
      setFilterRT(detectedRT);
    } else {
      setFilterRT("Semua");
    }
  }, [isRTAdmin, myRT, detectedRT]);
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaIds, setSelectedWargaIds] = useState<string[]>([]);
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showSuiteMenu, setShowSuiteMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredWargaData = useMemo(() => {
    const uniqueMap: Record<string, any> = {};
    wargaData.forEach(w => {
      const id = w.docId || w.nik || w.id || Math.random().toString();
      const existing = uniqueMap[id];
      if (!existing || (w.terverifikasi && !existing.terverifikasi)) {
        uniqueMap[id] = w;
      }
    });

    const uniqueWarga = Object.values(uniqueMap);
    return uniqueWarga.filter((w: any) => {
      const normalize = (val: string) => val ? val.toString().replace(/^0+/, '') : "";
      const filterRTNormalized = filterRT === "Semua" ? "Semua" : filterRT.replace(/^0+/, '');
      const filterRWNormalized = filterRW === "Semua" ? "Semua" : filterRW.replace(/^0+/, '');
      const matchRT = filterRT === "Semua" || normalize(w.rt || "") === filterRTNormalized;
      const matchRW = filterRW === "Semua" || normalize(w.rw || "") === filterRWNormalized;
      
      let matchUmur = true;
      if (filterKategoriUmur !== "Semua") {
        const ageResult = calculateAge(w.tglLahir);
        const age = typeof ageResult === 'number' ? ageResult : -1;
        if (age !== -1) {
          if (filterKategoriUmur === "Balita") matchUmur = age <= 5;
          else if (filterKategoriUmur === "Remaja") matchUmur = age >= 6 && age <= 17;
          else if (filterKategoriUmur === "Dewasa") matchUmur = age >= 18 && age < 60;
          else if (filterKategoriUmur === "Lansia") matchUmur = age >= 60;
        } else matchUmur = false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return matchRT && matchRW && matchUmur && (searchQuery === "" || 
        w.nama?.toLowerCase().includes(searchLower) ||
        w.nik?.toLowerCase().includes(searchLower) ||
        w.kk?.toLowerCase().includes(searchLower));
    }).sort((a: any, b: any) => (a.nama || "").localeCompare(b.nama || ""));
  }, [wargaData, filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const canEdit = useMemo(() => {
    if (currentUser?.isSuperAdmin) return true;
    const role = (userRole || currentUser?.role || "").toUpperCase();
    return ["ADMIN", "RT", "RW", "SUPER_ADMIN", "BENDAHARA", "KADER"].includes(role);
  }, [userRole, currentUser]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const totalItems = filteredWargaData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayedWarga = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWargaData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWargaData, currentPage, itemsPerPage]);

  const startEdit = (warga: any) => {
    setEditingWarga(warga);
    setShowEditForm(true);
  };

  const promptBulkDelete = () => {
    if (selectedWargaIds.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = async () => {
    if (selectedWargaIds.length === 0) return;
    
    setIsDeletingWarga(true);
    try {
      const batch = writeBatch(db);
      selectedWargaIds.forEach(id => {
        batch.delete(doc(db, 'data_warga', id));
      });
      await batch.commit();
      setSelectedWargaIds([]);
      showNotification(`${selectedWargaIds.length} data warga berhasil dihapus`, 'success');
      setShowBulkDeleteModal(false);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', '/data_warga');
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const cleanupWarga = async () => {
    setIsLoadingDB(true);
    try {
        // Use exact same tenant list logic as the frontend query
        const tIdsToClean = [tenantId];
        const tId = tenantId;
        if (tId === "rw26_berjuang" || tId.endsWith("_rw26_berjuang")) {
          // Strictly isolate developer master tenant and its sub-tenants to prevent cross-tenant leakage
        } else if (
          tId === "rw26_berjuang" ||
          tId === "trihprw26" ||
          tId.toLowerCase().includes("berjuang") ||
          tId.toLowerCase().includes("trih") ||
          tId.toLowerCase().includes("rw26")
        ) {
          if (!tId.toLowerCase().includes("rt")) {
             tIdsToClean.push(
               "rw26_berjuang", "trihprw26",
               "rt01_rw26_berjuang", "rt02_rw26_berjuang", "rt03_rw26_berjuang", "rt04_rw26_berjuang",
               "MASTER"
             );
          } else {
             tIdsToClean.push("rw26_berjuang", "trihprw26");
          }
        } else if (tId.toLowerCase().includes("rt")) {
          tIdsToClean.push("rw26_berjuang", "trihprw26");
        }
        
        if (currentTenant?.parentId && (tId !== "rw26_berjuang" && !tId.endsWith("_rw26_berjuang"))) {
          tIdsToClean.push(currentTenant.parentId);
          if (
            currentTenant.parentId === "rw26_berjuang" ||
            currentTenant.parentId === "trihprw26"
          ) {
            tIdsToClean.push("rw26_berjuang", "trihprw26");
          }
        }
        let uniqueTids = Array.from(new Set([...wargaData.map(w => w.tenantId), tenantId].filter(Boolean))).filter(id => {
            return id === tenantId || 
                   id === currentTenant?.parentId || 
                   isBelongsToParent(id, tenantId) || 
                   (currentTenant?.parentId && isBelongsToParent(id, currentTenant.parentId));
        });

        // Strict isolation: if we are an RT tenant, we are absolutely forbidden from loading/modifying keys outside our own RT tenantId
        const lowerTenantId = tenantId.toLowerCase();
        const isRT = lowerTenantId.startsWith("rt") || lowerTenantId.includes("_rt") || !!detectedRT;
        if (isRT) {
            uniqueTids = uniqueTids.filter(id => id === tenantId);
        }

        if (uniqueTids.length === 0) return;

        let docs: any[] = [];
        // Firestore limits 'in' queries to 10 elements
        for (let i = 0; i < uniqueTids.length; i += 10) {
            const chunk = uniqueTids.slice(i, i + 10);
            const q = query(collection(db, 'data_warga'), where('tenantId', 'in', chunk));
            const snapshot = await getDocs(q);
            docs = docs.concat(snapshot.docs.map(d => ({id: d.id, ...(d.data() as any)})));
        }
        
        console.log(`Analyzing ${docs.length} documents for duplicates across tenants: ${uniqueTids.join(', ')}...`);
        
        const map = new Map<string, any[]>();
        
        for (const doc of docs) {
            // Group by strict NIK first, fallback to Name
            let nik = (doc.nik || '').toString().trim();
            const nama = (doc.nama || '').toString().trim().toLowerCase();
            
            if (!nik || nik === 'Belum Ada' || nik === '-' || nik === '0') {
               if (!nama || nama === '-') continue;
               nik = `NAMA:${nama}`; // Group by name if NIK is invalid/missing
            }
            
            if (!map.has(nik)) map.set(nik, []);
            map.get(nik)!.push(doc);
        }
        
        console.log(`Processed ${map.size} unique NIKs.`);
        
        const toDelete: any[] = [];
        for (const [nik, items] of map.entries()) {
            if (items.length > 1) {
                console.log(`Found ${items.length} docs for NIK: '${nik}'`);
                // Sort to keep the "best" one. 
                // Priorities:
                // 1. the one that matches current tenantId directly
                // 2. the one with the most fields
                items.sort((a,b) => {
                    const aMatches = a.tenantId === tenantId ? 1 : 0;
                    const bMatches = b.tenantId === tenantId ? 1 : 0;
                    if (aMatches !== bMatches) return bMatches - aMatches;
                    return Object.keys(b).length - Object.keys(a).length;
                });                
                toDelete.push(...items.slice(1));
            }
        }
        
        if (toDelete.length === 0) {
            showNotification(`Tidak ditemukan data duplikat (analisis ${docs.length} data).`, 'info');
            return;
        }
        
        console.log(`Preparing to delete ${toDelete.length} documents.`);
        
        // Batch delete
        const CHUNK_SIZE = 450; 
        for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
            const chunk = toDelete.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach(d => {
                batch.delete(doc(db, 'data_warga', d.id));
            });
            await batch.commit();
            console.log(`Deleted chunk ${Math.floor(i / CHUNK_SIZE) + 1}`);
        }
        
        showNotification(`Berhasil menghapus ${toDelete.length} data duplikat.`, 'success');
        
    } catch (e: any) {
        console.error("Cleanup error:", e);
        handleFirestoreError(e, 'delete', 'data_warga');
    } finally {
        setIsLoadingDB(false);
    }
  };

  const syncWargaFromRW = async () => {
    if (!detectedRT) {
        showNotification("Tidak dapat mendeteksi RT tujuan sinkronisasi.", "error");
        return;
    }
    
    setIsLoadingDB(true);
    const currentSyncMode = currentTenant?.syncMode || tenantsData?.find(t => t.id === tenantId)?.syncMode || "two_way";
    const allowPull = currentSyncMode === "two_way" || currentSyncMode === "rw_to_rt";
    const allowPush = currentSyncMode === "two_way" || currentSyncMode === "rt_to_rw";
    
    console.log(`Starting sync for RT "${detectedRT}" to/from parent RW with mode: "${currentSyncMode}"`);
    try {
        const potentialParentIDs = [currentTenant?.parentId]
            .filter(Boolean)
            .filter(pId => isBelongsToParent(tenantId, pId)) as string[];

        console.log("Querying potential parent tenants:", potentialParentIDs);

        let allParentDocs: any[] = [];
        if (allowPull) {
            for (const pId of potentialParentIDs) {
                const cleanRTNum = parseInt(detectedRT, 10);
                const rtQueries = [detectedRT];
                if (!isNaN(cleanRTNum) && cleanRTNum.toString() !== detectedRT) {
                    rtQueries.push(cleanRTNum.toString());
                }

                for (const rtVal of rtQueries) {
                    try {
                        const q = query(
                            collection(db, 'data_warga'),
                            where('tenantId', '==', pId),
                            where('rt', '==', rtVal)
                        );
                        const snapshot = await getDocs(q);
                        console.log(`Parent tenant "${pId}" (RT filter "${rtVal}") returned ${snapshot.docs.length} citizen documents.`);
                        snapshot.docs.forEach(docSnap => {
                            allParentDocs.push({ id: docSnap.id, data: docSnap.data(), parentId: pId });
                        });
                    } catch (err) {
                        console.warn(`Query for parent tenant "${pId}" with rt condition "${rtVal}" failed:`, err);
                    }
                }
            }
        }

        console.log(`Found total ${allParentDocs.length} potential parent documents across all queried tenants.`);
        
        const cleanNumberNode = (val: any): string => {
            if (val === null || val === undefined) return "";
            return val.toString().replace(/[^0-9]/g, '').replace(/^0+/, '');
        };
        
        const targetRTCode = cleanNumberNode(detectedRT);
        console.log(`Normalized target RT code to match is "${targetRTCode}" (from raw "${detectedRT}")`);

        // Filter parent documents with lenient and comprehensive matching rules
        const parentDocsToPull = allowPull ? allParentDocs.filter(item => {
            const docRT = item.data.rt;
            if (!docRT) return false;
            
            const normalizedDocRT = cleanNumberNode(docRT);
            const looseDocRT = docRT.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            const looseTargetRT = detectedRT.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            
            return (
                normalizedDocRT === targetRTCode || 
                looseDocRT.includes(looseTargetRT) || 
                looseTargetRT.includes(looseDocRT)
            );
        }) : [];

        // B. Fetch local citizens in this RT tenant
        const localQuery = query(
            collection(db, 'data_warga'),
            where('tenantId', '==', tenantId)
        );
        const localSnapshot = await getDocs(localQuery);
        const localDocs = localSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
        console.log(`Found ${localDocs.length} local citizens in tenant "${tenantId}".`);

        let pullCount = 0;
        let pushCount = 0;

        // Perform Pull (Write from RW parent into this RT child tenant)
        if (allowPull && parentDocsToPull.length > 0) {
            const localNIKs = new Set(localDocs.map(d => (d.nik || '').toString().trim()).filter(Boolean));
            const docsToPull = parentDocsToPull.filter(item => {
                const nik = (item.data.nik || '').toString().trim();
                return !nik || !localNIKs.has(nik);
            });

            if (docsToPull.length > 0) {
                const CHUNK_SIZE = 450;
                for (let i = 0; i < docsToPull.length; i += CHUNK_SIZE) {
                    const chunk = docsToPull.slice(i, i + CHUNK_SIZE);
                    const batch = writeBatch(db);
                    chunk.forEach(item => {
                        const data = item.data;
                        const newId = `${tenantId}_${data.nik || new Date().getTime() + Math.random()}`;
                        batch.set(doc(db, 'data_warga', newId), {
                            ...data,
                            tenantId: tenantId,
                            docId: newId
                        }, { merge: true });
                    });
                    await batch.commit();
                    pullCount += chunk.length;
                }
            }
        }

        // Perform Push (Write local citizens from this RT child tenant up to the parent RW)
        const primaryParentID = currentTenant?.parentId || (potentialParentIDs.length > 0 ? potentialParentIDs[0] : null);
        if (allowPush && localDocs.length > 0 && primaryParentID) {
            const parentNIKs = new Set(allParentDocs.map(item => (item.data.nik || '').toString().trim()).filter(Boolean));
            const docsToPush = localDocs.filter(d => {
                const nik = (d.nik || '').toString().trim();
                return !nik || !parentNIKs.has(nik);
            });

            if (docsToPush.length > 0) {
                const CHUNK_SIZE = 450;
                for (let i = 0; i < docsToPush.length; i += CHUNK_SIZE) {
                    const chunk = docsToPush.slice(i, i + CHUNK_SIZE);
                    const batch = writeBatch(db);
                    chunk.forEach(localWarga => {
                        const { id, docId, tenantId: oldTenantId, ...rest } = localWarga;
                        const newId = `${primaryParentID}_${localWarga.nik || new Date().getTime() + Math.random()}`;
                        batch.set(doc(db, 'data_warga', newId), {
                            ...rest,
                            tenantId: primaryParentID,
                            docId: newId
                        }, { merge: true });
                    });
                    await batch.commit();
                    pushCount += chunk.length;
                }
            }
        }

        if (pullCount === 0 && pushCount === 0) {
            if (!allowPull) {
                showNotification(`Sinkronisasi selesai! Sinkronisasi satu arah (RT ke RW saja) berhasil diproses.`, "success");
            } else if (!allowPush) {
                showNotification(`Sinkronisasi selesai! Sinkronisasi satu arah (RW ke RT saja) berhasil diproses.`, "success");
            } else {
                showNotification(`Sinkronisasi selesai! Data warga sudah sama sepenuhnya dengan RW.`, "success");
            }
        } else {
            let msg = "";
            if (currentSyncMode === "rw_to_rt") {
                msg = `Sinkronisasi Satu Arah Sukses! Berhasil menarik ${pullCount} warga dari RW ke RT.`;
            } else if (currentSyncMode === "rt_to_rw") {
                msg = `Sinkronisasi Satu Arah Sukses! Berhasil mengirim ${pushCount} warga dari RT ke RW.`;
            } else {
                msg = `Sinkronisasi Dua Arah Sukses! Berhasil mengirim ${pushCount} warga ke RW, dan menarik ${pullCount} warga dari RW.`;
            }
            showNotification(msg, 'success');
        }
    } catch (e: any) {
        console.error("Sync error:", e);
        handleFirestoreError(e, 'write', 'data_warga');
    } finally {
        setIsLoadingDB(false);
    }
  };

  const syncWargaFromRTsToRW = async () => {
    // SECURITY GUARD: Check if current tenant is actually an RT, and block if so to prevent cross-RT leakage
    const lowerTenantId = tenantId.toLowerCase();
    const isRT = lowerTenantId.startsWith("rt") || lowerTenantId.includes("_rt") || !!detectedRT;
    if (isRT) {
        showNotification("Akses ditolak: Tenant RT tidak diperkenankan melakukan sinkronisasi massal seluruh RT.", "error");
        return;
    }

    setIsLoadingDB(true);
    console.log(`Starting reverse sync from RTs to RW tenant "${tenantId}"...`);
    try {
        const fallbackChildIds = [
            "rt01_rw26", "rt02_rw26", "rt03_rw26", "rt04_rw26",
            "rt01_rw_berjuang", "rt02_rw_berjuang", "rt03_rw_berjuang", "rt04_rw_berjuang",
            "rt01_trihprw26", "rt02_trihprw26", "rt03_trihprw26", "rt04_trihprw26",
            "RW26_RT01", "RW26_RT02", "RW26_RT03", "RW26_RT04"
        ];

        // Filter fallbackChildIds to only include child IDs that belong to the current parent tenantId
        let CHILD_TENANT_IDS = fallbackChildIds.filter(id => isBelongsToParent(id, tenantId));

        if (tenantId === "rw26_berjuang" || tenantId.endsWith("_rw26_berjuang")) {
            CHILD_TENANT_IDS = [];
        }

        const childSyncModes = new Map<string, string>();
        try {
            const childTenantsSnapshot = await getDocs(
                query(collection(db, 'tenants'), where('parentId', '==', tenantId))
            );
            const dynamicChildren = childTenantsSnapshot.docs.map(docSnap => {
                const data = docSnap.data();
                childSyncModes.set(docSnap.id, data.syncMode || "two_way");
                return docSnap.id;
            });
            if (dynamicChildren.length > 0) {
                CHILD_TENANT_IDS = Array.from(new Set([...CHILD_TENANT_IDS, ...dynamicChildren]));
            }
        } catch (err) {
            console.warn("Could not dynamically query child tenants:", err);
        }

        // Apply strict safety fence: eliminate any child tenant ID that is not genuinely related to this RW parent
        CHILD_TENANT_IDS = CHILD_TENANT_IDS.filter(childId => isBelongsToParent(childId, tenantId));

        const getChildSyncMode = (childId: string): string => {
            if (childSyncModes.has(childId)) {
                return childSyncModes.get(childId)!;
            }
            const found = tenantsData?.find(t => t.id === childId);
            return found?.syncMode || "two_way";
        };

        // Filter allowed child tenants based on directional settings
        const allowedChildIDs = CHILD_TENANT_IDS.filter(childId => {
            const mode = getChildSyncMode(childId);
            const isAllowed = mode === "two_way" || mode === "rt_to_rw";
            if (!isAllowed) {
                console.log(`Child RT "${childId}" has syncMode "${mode}". Skipping citizen pull to RW parent.`);
            }
            return isAllowed;
        });
        
        let allRTDocs: any[] = [];
        
        for (const childId of allowedChildIDs) {
            console.log(`Fetching citizens from RT child: "${childId}"`);
            try {
                const q = query(
                    collection(db, 'data_warga'),
                    where('tenantId', '==', childId)
                );
                const snapshot = await getDocs(q);
                snapshot.docs.forEach(d => {
                    allRTDocs.push({ id: d.id, ...d.data() });
                });
            } catch (err) {
                console.warn(`Could not read citizens from RT child "${childId}":`, err);
            }
        }
        
        console.log(`Found total of ${allRTDocs.length} citizens in all allowed RTs.`);
        
        if (allRTDocs.length === 0) {
            showNotification("Tidak ada data warga ditemukan di tenant-tenant RT anggota.", "info");
            setIsLoadingDB(false);
            return;
        }

        const currentWargaMap = new Map<string, any>();
        wargaData.forEach(w => {
            const nik = (w.nik || '').toString().trim();
            if (nik) {
                currentWargaMap.set(nik, w);
            }
        });

        const docsToSync: any[] = [];
        allRTDocs.forEach(rtWarga => {
            const nik = (rtWarga.nik || '').toString().trim();
            if (!nik) return;
            
            if (!currentWargaMap.has(nik)) {
                docsToSync.push(rtWarga);
            }
        });

        if (docsToSync.length === 0) {
            showNotification("Semua data warga dari RT sudah tersinkron dengan RW ini. Tidak ada data baru.", "info");
            setIsLoadingDB(false);
            return;
        }

        console.log(`Syncing ${docsToSync.length} new records from RTs to RW tenant.`);
        
        const CHUNK_SIZE = 450;
        for (let i = 0; i < docsToSync.length; i += CHUNK_SIZE) {
            const chunk = docsToSync.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach(docSnap => {
                const data = docSnap;
                const newId = `${tenantId}_${data.nik || new Date().getTime() + Math.random()}`;
                
                const { id, ...dataToSave } = data;
                batch.set(doc(db, 'data_warga', newId), {
                    ...dataToSave,
                    tenantId: tenantId,
                    docId: newId
                });
            });
            await batch.commit();
        }
        showNotification(`Berhasil menarik ${docsToSync.length} data warga baru dari RT anggota ke RW.`, 'success');
    } catch (e: any) {
        console.error("Reverse sync error:", e);
        handleFirestoreError(e, 'write', 'data_warga');
    } finally {
        setIsLoadingDB(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedWargaIds.length === displayedWarga.length && displayedWarga.length > 0) {
      setSelectedWargaIds([]);
    } else {
      setSelectedWargaIds(displayedWarga.map((w: any) => w.docId || w.nik || w.id));
    }
  };

  const toggleSelectWarga = (id: string) => {
    setSelectedWargaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const processImport = (file: File) => {
    setIsUploading(true);
    
    // Fallback handler if not CSV or if we're using FileReader
    const handleParsedData = async (parsedData: any[]) => {
      try {
        let successCount = 0;
        let duplicateCount = 0;
        const CHUNK_SIZE = 450; // Firestore limit is 500, use 450 to be safe
        const uniqueIds = new Set();
        
        // Split data into chunks of 450
        for (let i = 0; i < parsedData.length; i += CHUNK_SIZE) {
          const chunk = parsedData.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          let opsInBatch = 0;

          chunk.forEach((row: any) => {
            const rawNik = (row.nik || row.NIK || row['No. KTP'] || row['NIK/No. KTP'] || row['NOMOR KTP'] || row['Nomor KTP'] || row['No KTP'] || row['NIK '] || row['nik '] || row['N.I.K'] || '')?.toString()?.trim();
            const nama = row.nama || row.Nama || row['Nama Lengkap'] || row['NAMA'] || row['Nama Warga'] || row['NAMA LENGKAP'];
            
            if (nama) {
              let nik = rawNik.replace(/[^0-9]/g, ''); 
              
              // STABLE ID: Use tenantId + NIK if available (>= 5 digits), 
              // otherwise use tenantId + sanitized Name + short NIK to maintain stability across imports.
              const cleanNama = nama.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              const id = nik && nik.length >= 5 
                ? `${tenantId}_${nik}` 
                : `${tenantId}_STABLE_${cleanNama}_${nik}`;
              
              if (!nik) nik = 'Belum Ada'; // Visual marker for missing NIK

              if (uniqueIds.has(id)) {
                duplicateCount++;
              }
              uniqueIds.add(id);

              const docRef = doc(db, 'data_warga', id);
              batch.set(docRef, {
                nik: nik,
                docId: id,
                nama: nama,
                kk: (row.kk || row['No. KK'] || row.KK || row['No KK'] || row['Nomor KK'] || row['KODE KK'] || '')?.toString()?.trim() || '',
                rt: (row.rt || row.RT || row['RT.'] || '')?.toString()?.padStart(2, '0') || '01',
                rw: (row.rw || row.RW || row['RW.'] || '')?.toString()?.padStart(2, '0') || '26',
                status: row.status || row.Status || 'Warga Tetap',
                tenantId: tenantId,
                tglLahir: row.tglLahir || row['Tanggal Lahir'] || row['Tanggal Lahir '] || '',
                tempatLahir: row.tempatLahir || row['Tempat Lahir'] || '',
                jenisKelamin: row.jenisKelamin || row['Jenis Kelamin'] || row.jk || row.JK || 'Laki-laki',
                agama: row.agama || row.Agama || 'Islam',
                pekerjaan: row.pekerjaan || row.Pekerjaan || row['Profesi/ Pekerjaan'] || '',
                pendidikan: row.pendidikan || row.Pendidikan || row['Pendidikan Terakhir'] || '',
                statusKawin: row.statusKawin || row['Status Kawin'] || row.pernikahan || '',
                posisiKeluarga: row.posisiKeluarga || row['Posisi Dalam Keluarga'] || row.posisi || '',
                kewarganegaraan: row.kewarganegaraan || row['WNi/ WNA'] || row.kwn || 'WNI',
                telepon: row.telepon || row.Telepon || row['No. Hp'] || row.hp || row.phone || '',
                email: row.email || row.Email || '',
                alamat: row.alamat || row.Alamat || row.blok || '',
                kelurahan: row.kelurahan || row.Kelurahan || '',
                kecamatan: row.kecamatan || row.Kecamatan || '',
                kabupaten: row.kabupaten || row.kota || row['Kabupaten/ Kota'] || row.kota_kab || ''
              }, { merge: true });
              successCount++;
              opsInBatch++;
            }
          });

          if (opsInBatch > 0) {
            await batch.commit();
          }
        }
        
        if (successCount > 0) {
          const finalCount = uniqueIds.size;
          if (duplicateCount > 0) {
            showNotification(`${finalCount} warga unik diimpor (${duplicateCount} data duplikat dilewati/diupdate)`, 'success');
          } else {
            showNotification(`${successCount} data berhasil diimpor`, 'success');
          }
        } else {
          showNotification('Tidak ada data valid yang ditemukan', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Gagal memproses file', 'error');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          handleParsedData(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          showNotification('Gagal memparsing CSV', 'error');
          setIsUploading(false);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          handleParsedData(parsedData);
        } catch (err) {
          console.error(err);
          showNotification('Gagal memproses file Excel', 'error');
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    
    // Construct the correct Firestore ID if docId is missing
    let deleteId = wargaToDelete.docId || wargaToDelete.id;
    
    if (!deleteId && wargaToDelete.nik) {
        // If NIK exists, try constructing the expected ID: tenantId_nik
        deleteId = `${tenantId}_${wargaToDelete.nik}`;
    }
    
    console.log("Deleting warga with ID:", deleteId);
    
    if (!deleteId) {
        showNotification("Gagal: ID tidak ditemukan.", 'error');
        return;
    }
    
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'data_warga', deleteId));
      await logAuditEvent(currentUser?.uid || 'system', currentUser?.name || 'Aplikasi', 'DELETE_WARGA', 'data_warga', `Menghapus warga: ${wargaToDelete.nama || wargaToDelete.nik}`, tenantId);
      setWargaToDelete(null);
      showNotification("Data warga berhasil dihapus", 'success');
    } catch (error: any) {
      console.error("Delete error:", error);
      handleFirestoreError(error, 'delete', `/data_warga`);
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredWargaData.map((w: any) => ({
      'NIK': w.nik || '-',
      'Nama': w.nama || '-',
      'No. KK': w.kk || w.kodeKeluarga || '-',
      'Jenis Kelamin': w.jenisKelamin || w.jk || '-',
      'Kelurahan': w.kelurahan || '-',
      'Kecamatan': w.kecamatan || '-',
      'Kabupaten/ Kota': w.kabupaten || w.kota || w.kota_kab || '-',
      'No. Hp': w.telepon || w.phone || w.hp || w.noHp || '-',
      'Email': w.email || '-',
      'Foto KTP': w.ktpUrl || '-',
      'Foto KK': w.kkUrl || '-',
      'Agama': w.agama || '-',
      'Alamat': w.alamat || w.blok || '-',
      'RT': w.rt || '-',
      'RW': w.rw || '-',
      'Profesi/ Pekerjaan': w.pekerjaan || w.profesi || '-',
      'Posisi Dalam Keluarga': w.posisi || w.posisiKeluarga || '-',
      'Pendidikan Terakhir': w.pendidikan || w.pendidikanTerakhir || '-',
      'Status Kawin': w.statusKawin || w.pernikahan || '-',
      'Tempat Lahir': w.tempatLahir || '-',
      'Tanggal Lahir': w.tglLahir || '-',
      'WNi/ WNA': w.kewarganegaraan || w.kwn || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
    XLSX.writeFile(workbook, `Data_Warga_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-brand-blue/10 p-2.5 rounded-2xl">
              <Users className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-3xl font-bold italic text-slate-800 dark:text-slate-100 tracking-tight uppercase font-outfit">
              DATA WARGA
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            Platform {currentTenant?.name || ''} • {filteredWargaData.length} {getTranslatedLabel("Warga", settings?.themeMode)} Terdaftar
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) processImport(e.target.files[0]); }} />
          
          
          {/* PREMIUM RESIDENT & DOCUMENT SUITE DROP-DOWN MENU */}
          <div className="relative">
            <button 
              id="resident-document-suite-btn"
              onClick={() => setShowSuiteMenu(!showSuiteMenu)}
              className="px-6 py-4.5 bg-[#0d1527] dark:bg-slate-900 hover:bg-[#121c33] text-white border-2 border-indigo-500/30 hover:border-indigo-500 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center gap-3 shadow-lg shadow-indigo-500/10 active:scale-95 cursor-pointer relative group overflow-hidden"
            >
              <Database className="w-4.5 h-4.5 text-[#fffefe] group-hover:rotate-12 transition-transform duration-300 border border-[#8181c1]" />
              <span>Menu Kelola Warga & Ekspor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showSuiteMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSuiteMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowSuiteMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-3 w-88 bg-slate-950/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-2xl z-40 text-left space-y-4"
                  >
                    {/* Popover Header */}
                    <div className="border-b border-indigo-500/10 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-[10px] font-black tracking-widest text-[#5eead4] uppercase flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
                          RESIDENT & DOCUMENT SUITE
                        </h4>
                        <p className="text-[10px] text-emerald-200/50 font-sans tracking-normal mt-0.5">
                          Pengelolaan arsip, data dan singkronisasi wilayah
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-mono font-black animate-pulse">
                        ONLINE STATUS
                      </span>
                    </div>

                    {/* Capacity indicators */}
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-emerald-500/10 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase">
                        <span>Slot Kependudukan</span>
                        <span className="font-mono text-emerald-400">{wargaData.length} / {maxWargaLimit}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${limitReached ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'}`}
                          style={{ width: `${Math.min((wargaData.length / maxWargaLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Core action routes */}
                    <div className="space-y-2">
                      {canEdit && (
                        <>
                          {/* Tambah Warga Action btn */}
                          <button
                            onClick={() => {
                              setShowSuiteMenu(false);
                              if (limitReached) {
                                showNotification(`Limit ${maxWargaLimit} tercapai. Mohon Upgrade.`, 'error');
                                return;
                              }
                              setShowAddForm(true);
                            }}
                            className="w-full text-left p-2.5 rounded-xl bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/20 transition-all flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:scale-115 transition-transform">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                {limitReached ? 'Kapasitas Penuh' : `Tambah ${isApt ? "Penghuni" : "Warga"} Manual`}
                              </div>
                              <div className="text-[8px] text-slate-400 normal-case font-sans">
                                Enrolment data kependudukan perorangan
                              </div>
                            </div>
                          </button>

                          {/* Import Database via Excel */}
                          <button
                            onClick={() => {
                              setShowSuiteMenu(false);
                              fileInputRef.current?.click();
                            }}
                            disabled={isUploading}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500 group-hover:scale-115 transition-transform">
                              <Download className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                {isUploading ? 'Sedang Sinkron...' : 'Impor Database Excel/CSV'}
                              </div>
                              <div className="text-[8px] text-slate-400 normal-case font-sans">
                                Unggah struktur data warga dalam format spreadsheet
                              </div>
                            </div>
                          </button>

                          {/* Sinkronisasi Pull RT or Sync RW */}
                          <button
                            onClick={() => {
                              setShowSuiteMenu(false);
                              if (detectedRT) {
                                syncWargaFromRW();
                              } else {
                                syncWargaFromRTsToRW();
                              }
                            }}
                            className="w-full text-left p-2.5 rounded-xl bg-[#0a1e36]/40 hover:bg-[#0088cc]/10 border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 group-hover:scale-115 transition-transform">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                {detectedRT ? 'Sinkronisasi RW Induk' : 'Pull RT (Tarik Data RT Semua)'}
                              </div>
                              <div className="text-[8px] text-slate-400 normal-case font-sans">
                                {detectedRT ? 'Sinkronasikan pembaruan langsung dari database RW' : 'Konsolidasikan seluruh data RT ke basis RW Semua'}
                              </div>
                            </div>
                          </button>

                          {/* Cleanup Ganda duplicates */}
                          <button
                            onClick={() => {
                              setShowSuiteMenu(false);
                              cleanupWarga();
                            }}
                            className="w-full text-left p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/10 hover:border-rose-500/30 transition-all flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 group-hover:scale-115 transition-transform">
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                Pembersihan Data Ganda
                              </div>
                              <div className="text-[8px] text-slate-400 normal-case font-sans">
                                Cari dan eliminasi record NIK atau nama ganda otomatis
                              </div>
                            </div>
                          </button>
                        </>
                      )}

                      {/* Export Database button */}
                      <button
                        onClick={() => {
                          setShowSuiteMenu(false);
                          handleExportExcel();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 hover:border-emerald-500/30 transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-115 transition-transform">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-wider">
                            Ekspor Database Excel (Maks RW Semua)
                          </div>
                          <div className="text-[8px] text-slate-400 normal-case font-sans">
                            Kompilasi dan download arsip kependudukan wilayah
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Integrated Modern Filter Controls */}
                    <div className="border-t border-indigo-500/10 pt-4 space-y-3">
                      <h5 className="text-[10px] font-black tracking-widest text-[#5eead4] uppercase flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                        KONFIGURASI WILAYAH (FILTER DATA)
                      </h5>

                      <div className="grid grid-cols-2 gap-3">
                        {/* RT Selector */}
                        <div className="space-y-1 text-left">
                          <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">RT Saring:</label>
                          <div className="relative">
                            <select
                              value={filterRT}
                              onChange={(e) => setFilterRT(e.target.value)}
                              disabled={!!detectedRT || isRTAdmin}
                              className="w-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-300 rounded-lg p-2.5 outline-none appearance-none cursor-pointer focus:border-indigo-500/50 tracking-wider uppercase"
                            >
                              {detectedRT || isRTAdmin ? (
                                <option value={detectedRT || myRT}>{`RT ${detectedRT || myRT}`}</option>
                              ) : (
                                <>
                                  <option value="Semua">RT SEMUA</option>
                                  {Array.from({length: 100}, (_, i) => String(i+1).padStart(2, '0')).map(rt => (
                                    <option key={rt} value={rt}>{`RT ${rt}`}</option>
                                  ))}
                                </>
                              )}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* RW Selector */}
                        <div className="space-y-1 text-left">
                          <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">RW Saring:</label>
                          <div className="relative">
                            <select
                              value={filterRW}
                              onChange={(e) => setFilterRW(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-300 rounded-lg p-2.5 outline-none appearance-none cursor-pointer focus:border-indigo-500/50 tracking-wider uppercase"
                            >
                              <option value="Semua">RW SEMUA</option>
                              {Array.from({length: 100}, (_, i) => String(i+1).padStart(2, '0')).map(rw => (
                                <option key={rw} value={rw}>{`RW ${rw}`}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-4 sm:p-10 rounded-3xl border border-white/20 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none transition-all">
         <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
            <div className="relative md:col-span-4 group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="text-slate-300 group-focus-within:text-brand-blue transition-all duration-500 w-6 h-6" />
              </div>
              <input 
                type="text" 
                placeholder="Cari Identitas, Nama atau NIK..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/80 dark:bg-slate-800/80 border-2 border-slate-100 dark:border-slate-700 focus:border-brand-blue/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-5 pl-16 pr-8 outline-none text-[15px] font-bold text-slate-800 dark:text-slate-200 transition-all shadow-sm focus:shadow-2xl focus:shadow-brand-blue/10 placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]" 
              />
            </div>
            
            <div className="md:col-span-2 flex items-center justify-end gap-3 bg-slate-100/50 dark:bg-slate-800/30 px-5 py-4.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mr-auto pl-1">Saringan Wilayah:</span>
              
              {filterRT !== "Semua" ? (
                <button
                  onClick={() => setFilterRT("Semua")}
                  className="px-3 py-2 bg-indigo-500/15 border border-indigo-500/20 hover:border-rose-400 hover:bg-rose-500/10 text-indigo-400 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer group"
                  title="Klik untuk reset filter RT"
                >
                  <span>RT {filterRT}</span>
                  <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                </button>
              ) : (
                <span className="px-3 py-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider">RT Semua</span>
              )}

              {filterRW !== "Semua" ? (
                <button
                  onClick={() => setFilterRW("Semua")}
                  className="px-3 py-2 bg-[#0088cc]/15 border border-[#0088cc]/20 hover:border-rose-400 hover:bg-rose-500/10 text-[#0088cc] hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer group"
                  title="Klik untuk reset filter RW"
                >
                  <span>RW {filterRW}</span>
                  <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                </button>
              ) : (
                <span className="px-3 py-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider">RW Semua</span>
              )}
            </div>
         </div>

         <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            {/* DESKTOP VIEW: Sleek Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-8 px-8 w-20 text-center">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedWargaIds.length === displayedWarga.length && displayedWarga.length > 0} 
                          onChange={toggleSelectAll} 
                          className="w-6 h-6 rounded-xl text-brand-blue border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-brand-blue transition-all cursor-pointer shadow-sm" 
                        />
                      </div>
                    </th>
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">Profil Identitas</th>
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">Alamat Rumah</th>
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">RT</th>
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">RW</th>
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">Status & Profesi</th>
                    <th className="py-8 px-8 text-center font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">Opsi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {displayedWarga.map((w: any, idx: number) => {
                  const idWarga = w.docId || w.id || w.nik || `w-idx-${idx}`;
                  const isSelected = selectedWargaIds.includes(idWarga);
                  return (
                  <motion.tr 
                    key={`wg-row-${idWarga}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 1.2), duration: 0.5 }}
                    className={`group transition-all hover:bg-slate-50/80 dark:hover:bg-brand-blue/5 ${isSelected ? 'bg-brand-blue/[0.05] dark:bg-brand-blue/10 border-l-4 border-l-brand-blue' : 'bg-white dark:bg-slate-900'}`}
                  >
                    <td className="py-8 px-8 text-center">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelectWarga(idWarga)} 
                          className="w-6 h-6 rounded-xl text-brand-blue border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-brand-blue transition-all cursor-pointer shadow-sm" 
                        />
                      </div>
                    </td>
                    <td className="py-8 px-6">
                      <div className="flex items-center gap-6">
                         <div className="relative group/photo">
                            <div className="absolute inset-0 bg-brand-blue blur-xl opacity-0 group-hover/photo:opacity-30 transition-opacity rounded-full"></div>
                            <div className="relative w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue font-black shadow-inner border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 transition-transform group-hover/photo:scale-110">
                               {w.foto ? (
                                 <img src={w.foto} className="w-full h-full object-cover" />
                               ) : (
                                 <span className="text-2xl uppercase font-elegant" style={{ marginLeft: '0px', marginRight: '0px', marginBottom: '-28px' }}>{w.nama.charAt(0)}</span>
                               )}
                            </div>
                            {w.terverifikasi && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg flex items-center justify-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                         </div>
                         <div className={`space-y-1.5 ${idx === 7 ? 'hidden' : ''}`}>
                            <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none group-hover:text-brand-blue transition-colors uppercase font-verdana">{w.nama}</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/50 dark:bg-white/5 rounded-full w-fit">
                              <ShieldCheck className={`w-3.5 h-3.5 ${w.terverifikasi ? 'text-emerald-500' : 'text-slate-300'}`} />
                              <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 font-mono tracking-widest">{w.nik}</p>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="py-8 px-6">
                       <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                           <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                           <p className="text-[12px] font-bold uppercase tracking-wider truncate max-w-[180px]" title={w.alamat || '-'}>
                             {w.alamat || w.blok || 'LOKASI TIDAK TERIDENTIFIKASI'}
                           </p>
                         </div>
                       </div>
                    </td>
                    <td className="py-8 px-6">
                       <span className="inline-flex items-center justify-center px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[11px] font-black tracking-wider border border-indigo-100 dark:border-indigo-900/30">
                         RT {w.rt || '00'}
                       </span>
                    </td>
                    <td className="py-8 px-6">
                       <span className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-[11px] font-black tracking-wider border border-blue-100 dark:border-blue-900/30">
                         RW {w.rw || '00'}
                       </span>
                    </td>
                    <td className="py-8 px-6">
                       <div className="flex flex-col gap-2.5">
                         <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit shadow-lg ${
                           w.status === 'Warga Tetap' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
                         }`}>
                           {w.status}
                         </span>
                         {w.pekerjaan && (
                           <div className="flex items-center gap-2 ml-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{w.pekerjaan}</p>
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="py-8 px-8">
                      <div className="flex items-center justify-center gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 1)', color: 'white' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewWarga(w)} 
                          className="p-3.5 text-brand-blue bg-brand-blue/5 border border-brand-blue/10 rounded-2xl transition-all shadow-sm"
                          title="Lihat Profil Lengkap"
                        > 
                          <Eye size={20} /> 
                        </motion.button>
                        {canEdit && (
                          <>
                            <motion.button 
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 1)', color: 'white' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEdit(w)} 
                              className="p-3.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl transition-all shadow-sm"
                              title="Update Informasi"
                            > 
                              <Edit2 size={20} /> 
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 1)', color: 'white' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setWargaToDelete(w)} 
                              className="p-3.5 text-rose-500 bg-rose-50 border border-rose-100 rounded-2xl transition-all shadow-sm"
                              title="Hapus Data"
                            > 
                              <Trash2 size={20} /> 
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Horizontal sliding deck grouped per 10 or 20 citizens */}
            <div className="block md:hidden p-4 space-y-6">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Tampilkan:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-1 px-2.5 rounded-xl text-[11px] font-black text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value={10}>10 Orang</option>
                    <option value={20}>20 Orang</option>
                    <option value={50}>50 Orang</option>
                    <option value={100}>100 Orang</option>
                    <option value={999999}>Semua Orang</option>
                  </select>
                </div>
                <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                  Total: {filteredWargaData.length} Warga
                </div>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {displayedWarga.map((w: any, idx: number) => {
                  const idWarga = w.docId || w.id || w.nik || `w-idx-${idx}`;
                  const isSelected = selectedWargaIds.includes(idWarga);
                  return (
                    <div 
                      key={`wg-mob-card-${idWarga}-${idx}`}
                      className={`w-[260px] shrink-0 snap-center p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-brand-blue/[0.04] border-brand-blue shadow-lg shadow-brand-blue/10 dark:bg-brand-blue/5' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 shadow-md'
                      }`}
                    >
                      {/* Top actions line */}
                      <div className="flex items-center justify-between mb-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelectWarga(idWarga)} 
                          className="w-5 h-5 rounded-lg text-brand-blue border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-brand-blue transition-all cursor-pointer shadow-sm" 
                        />
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewWarga(w)} 
                            className="p-2 text-brand-blue bg-brand-blue/5 border border-brand-blue/10 rounded-xl transition-all dark:bg-white/5"
                            title="Lihat Profil"
                          > 
                            <Eye size={16} /> 
                          </button>
                           {canEdit && (
                            <>
                              <button 
                                onClick={() => startEdit(w)} 
                                className="p-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl transition-all dark:bg-white/5"
                                title="Edit"
                              > 
                                <Edit2 size={16} /> 
                              </button>
                              <button 
                                onClick={() => setWargaToDelete(w)} 
                                className="p-2 text-rose-500 bg-rose-50 border border-rose-100 rounded-xl transition-all dark:bg-white/5"
                                title="Hapus"
                              > 
                                <Trash2 size={16} /> 
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Middle: Profile Image, Name, NIK */}
                      <div className="flex flex-col items-center text-center space-y-3 my-2">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue font-black shadow-inner border border-slate-100 dark:border-slate-700 overflow-hidden">
                             {w.foto ? (
                               <img src={w.foto} className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-xl uppercase font-elegant" style={{ marginLeft: '0px', marginRight: '0px', marginBottom: '-28px' }}>{w.nama ? w.nama.charAt(0) : "W"}</span>
                             )}
                          </div>
                          {w.terverifikasi && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg flex items-center justify-center">
                               <ShieldCheck className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1 w-full px-1">
                          <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tracking-tight uppercase truncate" title={w.nama}>
                            {w.nama}
                          </p>
                          <p className="text-[13px] font-black text-slate-400 dark:text-slate-500 font-mono tracking-widest bg-slate-100/50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full w-auto mx-auto inline-block">
                            {w.nik}
                          </p>
                        </div>
                      </div>

                      {/* Bottom: House Location, RT, RW, Status, Pekerjaan */}
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Alamat:</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-305 truncate max-w-[140px] uppercase">{w.alamat || w.blok || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">RT:</span>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg text-[10px] font-black tracking-wider border border-indigo-100/30">RT {w.rt || '00'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">RW:</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg text-[10px] font-black tracking-wider border border-blue-100/30">RW {w.rw || '00'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            w.status === 'Warga Tetap' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-900 text-white border-slate-700'
                          }`}>
                            {w.status}
                          </span>
                        </div>

                        {w.pekerjaan && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Profesi:</span>
                            <span className="text-[9px] font-black text-slate-500 dark:text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg truncate max-w-[120px]" title={w.pekerjaan}>
                              {w.pekerjaan}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Swipe prompt hint on sliding list */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 py-2.5 rounded-xl">
                <span>GESER KANAN UNTUK LAINNYA</span>
                <ChevronRight className="w-4 h-4 text-brand-blue animate-bounceHorizontal" />
              </div>
            </div>

            {/* SHARED PAGINATION CONTROLS */}
            {filteredWargaData.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Menampilkan {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} Dari {totalItems} {isApt ? "Penghuni" : "Warga"}
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 whitespace-nowrap">Batas Tampilan:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-1 px-2.5 rounded-xl text-[11px] font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-brand-blue/50 transition-all shadow-sm"
                    >
                      <option value={10}>10 Orang</option>
                      <option value={20}>20 Orang</option>
                      <option value={50}>50 Orang</option>
                      <option value={100}>100 Orang</option>
                      <option value={999999}>Semua Orang</option>
                    </select>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-[150px] sm:max-w-xs scrollbar-hide">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                        if (totalPages > 5 && Math.abs(pg - currentPage) > 1 && pg !== 1 && pg !== totalPages) {
                          return null;
                        }
                        return (
                          <button
                            key={`pg-btn-${pg}`}
                            onClick={() => setCurrentPage(pg)}
                            className={`w-9 h-9 shrink-0 rounded-xl text-[11px] font-black transition-all ${
                              currentPage === pg
                                ? 'bg-gradient-to-tr from-brand-blue to-blue-600 text-white shadow-md shadow-brand-blue/25 scale-110'
                                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                      title="Halaman Selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {displayedWarga.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-slate-800 shadow-xl">
                 <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pencarian Tidak Ditemukan</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto text-sm">Coba sesuaikan kata kunci atau filter RT/RW untuk menemukan data yang dicari.</p>
            </div>
          )}
      </div>

      {/* FLOATING BULK ACTION BANNER */}
      <AnimatePresence>
        {selectedWargaIds.length > 0 && canEdit && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-rose-500/30 flex items-center gap-6 z-[90] min-w-[280px] sm:min-w-[420px] justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[11px] font-black tracking-wider text-rose-400 uppercase">Tindakan Massal</p>
                <p className="text-xs text-white font-medium">{selectedWargaIds.length} Data Terpilih</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedWargaIds([])}
                className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={promptBulkDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-rose-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Sekaligus</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT WARGA MODAL */}
      <AnimatePresence>
        {(showAddForm || showEditForm) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }} 
               className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 dark:border-slate-800"
             >
                <div className="px-8 pt-0 pb-0 h-[100px] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        {showEditForm ? <Edit2 className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-[18px] font-elegant uppercase tracking-tight">
                          {showEditForm ? 'Pembaruan Data' : 'Registrasi Penduduk'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Entri Administrasi Kependudukan</p>
                      </div>
                   </div>
                   <motion.button 
                     whileHover={{ rotate: 90, scale: 1.1 }}
                     onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingWarga(null); }} 
                     className="p-3 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                   >
                     <X className="w-6 h-6" />
                   </motion.button>
                </div>
                
                <div className="px-10 pt-[12px] pb-[12px] h-[320px] overflow-y-auto custom-scrollbar">
                   <form id="wargaForm" className="space-y-10" onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as HTMLFormElement);
                      setIsLoadingDB(true);
                      
                      try {
                        let fotoKTPUrl = editingWarga?.fotoKTP || '';
                        let fotoKKUrl = editingWarga?.fotoKK || '';

                        const fileKTP = fd.get('fileKTP') as File;
                        const fileKK = fd.get('fileKK') as File;

                        if (fileKTP && fileKTP.size > 0) {
                          fotoKTPUrl = await handleFileUpload(fileKTP, `warga_docs/KTP_${fd.get('nik')}`);
                        }
                        if (fileKK && fileKK.size > 0) {
                          fotoKKUrl = await handleFileUpload(fileKK, `warga_docs/KK_${fd.get('nik')}`);
                        }

                        const data = {
                          nik: fd.get('nik'),
                          nama: fd.get('nama'),
                          kk: fd.get('kk'),
                          tempatLahir: fd.get('tempatLahir'),
                          tglLahir: fd.get('tglLahir'),
                          jenisKelamin: fd.get('jenisKelamin'),
                          kewarganegaraan: fd.get('kewarganegaraan'),
                          agama: fd.get('agama'),
                          statusKawin: fd.get('statusKawin'),
                          pendidikan: fd.get('pendidikan'),
                          pekerjaan: fd.get('pekerjaan'),
                          posisiKeluarga: fd.get('posisiKeluarga'),
                          alamat: fd.get('alamat'),
                          rt: fd.get('rt'),
                          rw: fd.get('rw'),
                          kelurahan: fd.get('kelurahan'),
                          kecamatan: fd.get('kecamatan'),
                          kabupaten: fd.get('kabupaten'),
                          telepon: fd.get('telepon'),
                          email: fd.get('email'),
                          status: fd.get('status'),
                          terverifikasi: fd.get('terverifikasi') === 'on',
                          fotoKTP: fotoKTPUrl,
                          fotoKK: fotoKKUrl,
                          tenantId,
                          role: 'WARGA'
                        };
                        
                        const rawNik = (data.nik as string || '').trim();
                        const nik = rawNik.replace(/[^0-9]/g, '');
                        const cleanNama = (data.nama as string || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        
                        // Use consistent ID logic with import process
                        const docId = nik && nik.length >= 5 
                          ? `${tenantId}_${nik}` 
                          : `${tenantId}_STABLE_${cleanNama}_${nik}`;
                        
                        const finalData = { ...data, docId, nik: nik || 'Belum Ada' };
                        
                        if (showEditForm && editingWarga) {
                          const targetId = editingWarga.docId || editingWarga.id || `${tenantId}_${editingWarga.nik}`;
                          await updateDoc(doc(db, 'data_warga', targetId), finalData);
                          setWargaData(wargaData.map((w: any) => (w.docId || w.id || `${tenantId}_${w.nik}`) === targetId ? { ...w, ...finalData } : w));
                          showNotification('Data warga berhasil diubah', 'success');
                          await logAuditEvent(currentUser?.uid || 'system', currentUser?.name || 'Aplikasi', 'UPDATE_WARGA', 'data_warga', `Mengubah data warga: ${finalData.nama}`, tenantId);
                        } else {
                          const { autoDeduplicate } = await import('../services/dataService');
                          const isDup = await autoDeduplicate('data_warga', 'nik', finalData.nik);
                          if (isDup && finalData.nik !== 'Belum Ada' && finalData.nik !== '') {
                              showNotification('Data Warga dengan NIK tersebut sudah terdaftar.', 'error');
                              setIsLoadingDB(false);
                              return;
                          }
                          await setDoc(doc(db, 'data_warga', docId), finalData);
                          setWargaData([...wargaData, finalData]);
                          showNotification('Warga baru berhasil ditambahkan', 'success');
                          await logAuditEvent(currentUser?.uid || 'system', currentUser?.name || 'Aplikasi', 'CREATE_WARGA', 'data_warga', `Menambahkan warga: ${finalData.nama}`, tenantId);
                        }
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setEditingWarga(null);
                      } catch (err) {
                        handleFirestoreError(err, 'write', 'data_warga');
                      } finally {
                        setIsLoadingDB(false);
                      }
                   }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIK <span className="text-red-500">*</span></label>
                            <input required name="nik" defaultValue={editingWarga?.nik} readOnly={!!showEditForm} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sesuai KTP: Nama Lengkap <span className="text-red-500">*</span></label>
                            <input required name="nama" defaultValue={editingWarga?.nama} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Kartu Keluarga (KK)</label>
                            <input name="kk" defaultValue={editingWarga?.kk} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telepon/WhatsApp</label>
                            <input name="telepon" defaultValue={editingWarga?.telepon} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempat Lahir</label>
                            <input name="tempatLahir" defaultValue={editingWarga?.tempatLahir} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                            <input type="date" name="tglLahir" defaultValue={editingWarga?.tglLahir} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                            <select name="jenisKelamin" defaultValue={editingWarga?.jenisKelamin || 'Laki-laki'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Laki-laki">Laki-laki</option>
                               <option value="Perempuan">Perempuan</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">kewarganegaraan <span className="text-red-500">*</span></label>
                            <select name="kewarganegaraan" defaultValue={editingWarga?.kewarganegaraan || 'WNI'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="WNI">WNI (Warga Negara Indonesia)</option>
                               <option value="WNA">WNA (Warga Negara Asing)</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap KTP</label>
                            <textarea name="alamat" defaultValue={editingWarga?.alamat} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue"></textarea>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-left">
                           <div className="flex flex-col">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RT KTP/Domisili <span className="text-red-500">*</span></label>
                              <input required name="rt" defaultValue={editingWarga?.rt || (isRTAdmin ? myRT : (detectedRT || '01'))} readOnly={!!detectedRT || isRTAdmin} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-blue read-only:bg-slate-100 read-only:text-slate-500" />
                           </div>
                           <div className="flex flex-col">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RW KTP/Domisili <span className="text-red-500">*</span></label>
                              <input required name="rw" defaultValue={editingWarga?.rw || '26'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                           </div>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kelurahan</label>
                            <input name="kelurahan" defaultValue={editingWarga?.kelurahan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kecamatan</label>
                            <input name="kecamatan" defaultValue={editingWarga?.kecamatan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kabupaten/Kota</label>
                            <input name="kabupaten" defaultValue={editingWarga?.kabupaten} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2"></div>
                         
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agama</label>
                            <select name="agama" defaultValue={editingWarga?.agama || 'Islam'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Islam">Islam</option>
                               <option value="Kristen">Kristen</option>
                               <option value="Katolik">Katolik</option>
                               <option value="Hindu">Hindu</option>
                               <option value="Buddha">Buddha</option>
                               <option value="Konghucu">Konghucu</option>
                               <option value="Lainnya">Lainnya</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Kawin</label>
                            <select name="statusKawin" defaultValue={editingWarga?.statusKawin || 'Belum Kawin'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Belum Kawin">Belum Kawin</option>
                               <option value="Kawin">Kawin</option>
                               <option value="Cerai Hidup">Cerai Hidup</option>
                               <option value="Cerai Mati">Cerai Mati</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pendidikan Terakhir</label>
                            <select name="pendidikan" defaultValue={editingWarga?.pendidikan || 'SMA'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="BELUM SEKOLAH">BELUM SEKOLAH</option>
                               <option value="SD">SD</option>
                               <option value="SMP">SMP</option>
                               <option value="SMA">SMA</option>
                               <option value="DIPLOMA 1">DIPLOMA 1</option>
                               <option value="DIPLOMA 2">DIPLOMA 2</option>
                               <option value="DIPLOMA 3">DIPLOMA 3</option>
                               <option value="DIPLOMA 4">DIPLOMA 4</option>
                               <option value="S1">S1</option>
                               <option value="S2">S2</option>
                               <option value="S3">S3</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posisi Dalam Keluarga</label>
                            <select name="posisiKeluarga" defaultValue={editingWarga?.posisiKeluarga || 'Anak'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Kepala Keluarga">Kepala Keluarga</option>
                               <option value="Istri">Istri</option>
                               <option value="Suami">Suami</option>
                               <option value="Anak">Anak</option>
                               <option value="Mertua">Mertua</option>
                               <option value="Famili Lain">Famili Lain</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profesi/Pekerjaan</label>
                            <input name="pekerjaan" defaultValue={editingWarga?.pekerjaan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" name="email" defaultValue={editingWarga?.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Tinggal</label>
                            <select name="status" defaultValue={editingWarga?.status || 'Warga Tetap'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Warga Tetap">Warga Tetap (Milik Sendiri)</option>
                               <option value="Warga Kontrakan">Warga Kontrakan/Kost</option>
                            </select>
                         </div>
                         
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Verifikasi ID</label>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm border-emerald-100 dark:border-emerald-900/30">
                               <input 
                                 type="checkbox" 
                                 name="terverifikasi" 
                                 defaultChecked={editingWarga?.terverifikasi} 
                                 className="w-5 h-5 rounded-lg border-emerald-200 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer" 
                               />
                               <div className="flex flex-col">
                                 <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Terverifikasi Admin</span>
                                 <span className="text-[9px] text-slate-400 font-bold">Identitas warga dinyatakan sah</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2"></div>

                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Foto KTP</label>
                            <input type="file" name="fileKTP" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90" />
                            {editingWarga?.fotoKTP && <p className="text-xs text-emerald-600 font-bold mt-2 truncate">File tersimpan: {editingWarga.fotoKTP.substring(0,25)}...</p>}
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Foto KK</label>
                            <input type="file" name="fileKK" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90" />
                            {editingWarga?.fotoKK && <p className="text-xs text-emerald-600 font-bold mt-2 truncate">File tersimpan: {editingWarga.fotoKK.substring(0,25)}...</p>}
                         </div>
                      </div>
                   </form>
                </div>
                <div className="px-6 pt-0 pb-0 h-[80px] border-t border-slate-100 bg-slate-50 flex gap-3 justify-end items-center">
                   <button onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingWarga(null); }} className="px-6 py-3 font-black text-slate-400 bg-slate-200 border border-slate-300 rounded-xl hover:bg-slate-300 transition-colors uppercase text-[10px] tracking-widest">Batal</button>
                   <button form="wargaForm" type="submit" className="px-6 py-3 font-black text-white bg-brand-blue rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/30 transition-all uppercase text-[10px] tracking-widest">Simpan Data</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW WARGA MODAL */}
      <AnimatePresence>
        {viewWarga && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden p-6 relative h-[545px] mb-[-46px]">
                <button onClick={() => setViewWarga(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors z-10"><X size={20} /></button>
                <div className="flex flex-col items-center text-center mb-6 shrink-0">
                   <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-brand-blue text-4xl font-black shadow-inner mb-4 overflow-hidden">
                      {viewWarga.foto ? <img src={viewWarga.foto} className="w-full h-full object-cover" /> : viewWarga.nama.charAt(0)}
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
                      {viewWarga.nama}
                      {viewWarga.terverifikasi && (
                        <div className="bg-emerald-500 p-1 rounded-full text-white shadow-lg">
                           <ShieldCheck size={12} />
                        </div>
                      )}
                   </h3>
                   <p className="text-sm font-bold text-slate-400 font-mono tracking-widest">{viewWarga.nik}</p>
                   {viewWarga.kk && <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest mt-1">KK: {viewWarga.kk}</p>}
                   <div className="flex gap-2 mt-2">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                       viewWarga.status === 'Warga Tetap' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                       {viewWarga.status}
                     </span>
                     {viewWarga.kewarganegaraan && (
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100`}>
                         {viewWarga.kewarganegaraan}
                       </span>
                     )}
                   </div>
                </div>
                <div className="overflow-y-auto pr-2 space-y-4 pt-4 border-t border-slate-100 flex-1">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. KK</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kk || viewWarga.kodeKeluarga || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempat, Tanggal Lahir</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.tempatLahir || '-'}, {viewWarga.tglLahir || '-'} ({calculateAge(viewWarga.tglLahir)}Th)</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Kelamin</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.jenisKelamin || viewWarga.jk || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agama</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.agama || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Kawin</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.statusKawin || viewWarga.pernikahan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendidikan Terakhir</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.pendidikan || viewWarga.pendidikanTerakhir || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profesi/Pekerjaan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.pekerjaan || viewWarga.profesi || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posisi Dalam Keluarga</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.posisiKeluarga || viewWarga.posisi || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.email || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Hp</span>
                        <span className="text-sm font-black text-slate-700 font-mono">{viewWarga.telepon || viewWarga.phone || viewWarga.hp || viewWarga.noHp || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RT</span>
                        <span className="text-sm font-black text-slate-700">RT {viewWarga.rt || '-'}</span>
                      </div>
                      <div className="flex flex-col py-2 border-b border-slate-50">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RW</span>
                         <span className="text-sm font-black text-slate-700">RW {viewWarga.rw || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WNI / WNA</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kewarganegaraan || viewWarga.kwn || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Lengkap</span>
                        <span className="text-sm font-black text-slate-700 leading-relaxed">{viewWarga.alamat || viewWarga.blok || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelurahan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kelurahan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kecamatan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kecamatan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kabupaten/Kota</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kabupaten || viewWarga.kota || viewWarga.kota_kab || '-'}</span>
                     </div>
                   </div>

                   {(viewWarga.fotoKTP || viewWarga.ktpUrl || viewWarga.fotoKK || viewWarga.kkUrl) && (
                     <div className="pt-4 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Dokumen Lampiran</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {(viewWarga.fotoKTP || viewWarga.ktpUrl) && (
                             <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-600">Foto KTP</span>
                                <a href={viewWarga.fotoKTP || viewWarga.ktpUrl} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-slate-200 block">
                                   <img src={viewWarga.fotoKTP || viewWarga.ktpUrl} alt="KTP" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                                </a>
                             </div>
                           )}
                           {(viewWarga.fotoKK || viewWarga.kkUrl) && (
                             <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-600">Foto KK</span>
                                <a href={viewWarga.fotoKK || viewWarga.kkUrl} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-slate-200 block">
                                   <img src={viewWarga.fotoKK || viewWarga.kkUrl} alt="KK" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                                </a>
                             </div>
                           )}
                        </div>
                     </div>
                   )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE WARGA MODAL */}
      <AnimatePresence>
        {wargaToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Hapus Warga?</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">Yakin ingin menghapus data <b>{wargaToDelete.nama}</b> secara permanen? Data yang dihapus tidak dapat dipulihkan.</p>
                <div className="flex gap-2 justify-center">
                   <button onClick={() => setWargaToDelete(null)} className="px-6 py-3 font-black text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest flex-1">Batal</button>
                   <button onClick={handleDeleteWarga} disabled={isDeletingWarga} className="px-6 py-3 font-black text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors uppercase text-[10px] tracking-widest flex-1">
                     {isDeletingWarga ? 'Menghapus...' : 'Hapus'}
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* BULK DELETE MODAL */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Hapus Sekaligus?</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">Yakin ingin menghapus <b>{selectedWargaIds.length} data warga</b> terpilih secara permanen? Data yang dihapus tidak dapat dipulihkan.</p>
                <div className="flex gap-2 justify-center">
                   <button onClick={() => setShowBulkDeleteModal(false)} className="px-6 py-3 font-black text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest flex-1">Batal</button>
                   <button onClick={executeBulkDelete} disabled={isDeletingWarga} className="px-6 py-3 font-black text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors uppercase text-[10px] tracking-widest flex-1">
                     {isDeletingWarga ? 'Menghapus...' : 'Hapus'}
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WargaView;
