import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Users, Trash2, Edit2, Download, Printer, UserPlus, 
  MapPin, Phone, Info, Search, X, CheckCircle, AlertCircle, Eye, EyeOff, ClipboardList, Trash, ShieldCheck, LogOut, Menu, Lock,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, collection, where } from 'firebase/firestore';                
import { db } from '../firebase';

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
      settings 
  } = props;
  const isApt = settings?.themeMode === 'apartemen';
  const tenant = currentTenant || {};
  const isFree = !tenant.status || tenant.status === "TRIAL" || tenant.status === "FREE";
  // The plan limits are stored in tenant or we just use hardcoded checks / maxWarga from the object. This is a bit rough but works for trial
  const maxWargaLimit = isFree ? 50 : (tenant?.maxWarga || 5000);
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

  const displayedWarga = filteredWargaData;

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
        // Query ALL data_warga for the target tenant
        const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({id: d.id, ...(d.data() as any)}));
        
        console.log(`Analyzing ${docs.length} documents for duplicates in tenant: ${tenantId}...`);
        
        const map = new Map<string, any[]>();
        
        for (const doc of docs) {
            // Ensure nik exists and is normalized
            const nik = (doc.nik || '').toString().trim();
            if (!nik || nik === 'Belum Ada') continue;
            
            if (!map.has(nik)) map.set(nik, []);
            map.get(nik)!.push(doc);
        }
        
        console.log(`Processed ${map.size} unique NIKs.`);
        
        const toDelete: any[] = [];
        for (const [nik, items] of map.entries()) {
            if (items.length > 1) {
                console.log(`Found ${items.length} docs for NIK: '${nik}'`);
                // Sort to keep the "best" one. 
                // Currently sorting by total fields count (proxy for completeness)
                items.sort((a,b) => Object.keys(b).length - Object.keys(a).length);                
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
    console.log(`Starting bidirectional sync for RT "${detectedRT}" to/from parent RW...`);
    try {
        const potentialParentIDs = Array.from(new Set([
            currentTenant?.parentId,
            'RW_BERJUANG',
            'rw_berjuang',
            'trihprw26',
            'RW26_SMART',
            'rw26_smart'
        ].filter(Boolean) as string[]));

        console.log("Querying potential parent tenants:", potentialParentIDs);

        let allParentDocs: any[] = [];
        for (const pId of potentialParentIDs) {
            try {
                const q = query(
                    collection(db, 'data_warga'),
                    where('tenantId', '==', pId)
                );
                const snapshot = await getDocs(q);
                console.log(`Parent tenant "${pId}" returned ${snapshot.docs.length} citizen documents.`);
                snapshot.docs.forEach(docSnap => {
                    allParentDocs.push({ id: docSnap.id, data: docSnap.data(), parentId: pId });
                });
            } catch (err) {
                console.warn(`Query for parent tenant "${pId}" failed (possible rules constraint):`, err);
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
        const parentDocsToPull = allParentDocs.filter(item => {
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
        });

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
        if (parentDocsToPull.length > 0) {
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
        const primaryParentID = currentTenant?.parentId || potentialParentIDs[0] || 'RW_BERJUANG';
        if (localDocs.length > 0 && primaryParentID) {
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
            showNotification(`Sinkronisasi selesai! Data warga sudah sama sepenuhnya dengan RW.`, "success");
        } else {
            showNotification(`Sinkronisasi Dua Arah Sukses! Berhasil mengirim ${pushCount} warga ke RW, dan menarik ${pullCount} warga dari RW.`, 'success');
        }
    } catch (e: any) {
        console.error("Bidirectional sync error:", e);
        handleFirestoreError(e, 'write', 'data_warga');
    } finally {
        setIsLoadingDB(false);
    }
  };

  const syncWargaFromRTsToRW = async () => {
    setIsLoadingDB(true);
    console.log(`Starting reverse sync from RTs to RW tenant "${tenantId}"...`);
    try {
        let CHILD_TENANT_IDS = [
            "rt01_rw26", "rt02_rw26", "rt03_rw26", "rt04_rw26", "rt05_rw26",
            "rt01_rw_berjuang", "rt02_rw_berjuang", "rt03_rw_berjuang", "rt04_rw_berjuang", "rt05_rw_berjuang",
            "rt01_trihprw26", "rt02_trihprw26", "rt03_trihprw26", "rt04_trihprw26", "rt05_trihprw26",
            "RW26_RT01", "RW26_RT02", "RW26_RT03", "RW26_RT04", "RW26_RT05"
        ];

        try {
            const childTenantsSnapshot = await getDocs(
                query(collection(db, 'tenants'), where('parentId', '==', tenantId))
            );
            const dynamicChildren = childTenantsSnapshot.docs.map(doc => doc.id);
            if (dynamicChildren.length > 0) {
                CHILD_TENANT_IDS = Array.from(new Set([...CHILD_TENANT_IDS, ...dynamicChildren]));
            }
        } catch (err) {
            console.warn("Could not dynamically query child tenants:", err);
        }
        
        let allRTDocs: any[] = [];
        
        for (const childId of CHILD_TENANT_IDS) {
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
        
        console.log(`Found total of ${allRTDocs.length} citizens in all RTs.`);
        
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
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'data_warga', wargaToDelete.docId || wargaToDelete.nik));
      setWargaToDelete(null);
      showNotification("Data warga berhasil dihapus");
    } catch (error: any) {
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
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant">
              Kelola {isApt ? "Penghuni" : "Warga"}
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            Platform {currentTenant?.name || ''} • {filteredWargaData.length} Terdaftar
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {['SUPER_ADMIN', 'ADMIN', 'RW', 'RT'].includes(userRole) && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
              <button 
                onClick={cleanupWarga} 
                className="hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 p-2.5 rounded-2xl transition-all"
                title="Bersihkan Data Ganda"
              >
                <Trash2 size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              {detectedRT ? (
                <button 
                  onClick={syncWargaFromRW} 
                  className="hover:bg-white dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 p-2.5 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <ClipboardList size={18} /> Sync RW
                </button>
              ) : (
                <button 
                  onClick={syncWargaFromRTsToRW} 
                  className="hover:bg-white dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 p-2.5 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <ClipboardList size={18} /> Pull RT
                </button>
              )}
            </div>
          )}
          
          <AnimatePresence>
            {selectedWargaIds.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={promptBulkDelete} 
                className="bg-rose-50 text-rose-600 border border-rose-100 px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-rose-100 shadow-sm"
              >
                <Trash size={18} /> Hapus ({selectedWargaIds.length})
              </motion.button>
            )}
          </AnimatePresence>

          <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) processImport(e.target.files[0]); }} />
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading || limitReached} 
            className="group relative bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none shadow-sm disabled:opacity-50"
          >
            <Download size={18} className="translate-y-[1px] group-hover:-translate-y-1 transition-transform" />
            {isUploading ? 'Syncing...' : 'Import Data'}
          </button>

          <button 
            onClick={() => {
              if (limitReached) {
                showNotification(`Limit ${maxWargaLimit} tercapai. Mohon Upgrade.`, 'error');
                return;
              }
              setShowAddForm(true);
            }} 
            className="bg-gradient-to-tr from-brand-blue via-blue-600 to-indigo-700 hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] text-white px-8 py-4.5 rounded-2xl flex items-center gap-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-xl shadow-brand-blue/20 group"
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <UserPlus size={18} /> 
            </div>
            {limitReached ? 'Limit Penuh' : `Tambah ${isApt ? "Penghuni" : "Warga"}`}
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-3xl border border-white/20 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none transition-all">
         <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
            <div className="relative md:col-span-3 group">
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
            
            <div className="md:col-span-1 relative group/sel">
              <select 
                value={filterRT} 
                onChange={(e) => setFilterRT(e.target.value)} 
                disabled={!!detectedRT || isRTAdmin}
                className="w-full bg-white/80 dark:bg-slate-800/80 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-5 px-8 outline-none text-[12px] font-black text-slate-600 dark:text-slate-300 transition-all appearance-none cursor-pointer focus:border-brand-blue/30 hover:border-slate-200 uppercase tracking-wider"
              >
                {detectedRT || isRTAdmin ? (
                  <option value={detectedRT || myRT}>{`RT ${detectedRT || myRT}`}</option>
                ) : (
                  <>
                    <option value="Semua">RT: SEMUA</option>
                    {Array.from({length: 15}, (_, i) => String(i+1).padStart(2, '0')).map(rt => (
                      <option key={rt} value={rt}>{`RT ${rt}`}</option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover/sel:text-brand-blue transition-colors" />
            </div>

            <div className="md:col-span-1 relative group/sel">
              <select 
                value={filterRW} 
                onChange={(e) => setFilterRW(e.target.value)} 
                className="w-full bg-white/80 dark:bg-slate-800/80 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-5 px-8 outline-none text-[12px] font-black text-slate-600 dark:text-slate-300 transition-all appearance-none cursor-pointer focus:border-brand-blue/30 hover:border-slate-200 uppercase tracking-wider"
              >
                <option value="Semua">RW: SEMUA</option>
                {Array.from({length: 30}, (_, i) => String(i+1).padStart(2, '0')).map(rw => <option key={rw} value={rw}>{`RW ${rw}`}</option>)}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover/sel:text-brand-blue transition-colors" />
            </div>

            <button 
              onClick={handleExportExcel} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 py-5 shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500"
            > 
              <Printer size={18} /> EXCEL 
            </button>
         </div>

         <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <div className="overflow-x-auto">
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
                    <th className="py-8 px-6 font-black uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">Lokasi Rumah</th>
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
                                 <span className="text-2xl uppercase font-elegant">{w.nama.charAt(0)}</span>
                               )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg"></div>
                         </div>
                         <div className="space-y-1.5">
                            <p className="text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none group-hover:text-brand-blue transition-colors uppercase font-verdana">{w.nama}</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/50 dark:bg-white/5 rounded-full w-fit">
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono tracking-widest">{w.nik}</p>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="py-8 px-6">
                       <div className="flex flex-col gap-2">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/5 dark:bg-brand-blue/10 text-brand-blue rounded-xl text-[11px] font-black tracking-widest w-fit border border-brand-blue/10">
                           <MapPin className="w-4 h-4" />
                           RT {w.rt || '00'} / RW {w.rw || '00'}
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 max-w-[200px] truncate">{w.alamat || 'LOKASI TIDAK TERIDENTIFIKASI'}</p>
                       </div>
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
                        {(['SUPER_ADMIN', 'ADMIN', 'RW', 'RT'].includes(currentUser?.role) || currentUser?.isSuperAdmin) && (
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
    </div>

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
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        {showEditForm ? <Edit2 className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl font-elegant uppercase tracking-tight">
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
                
                <div className="p-10 overflow-y-auto custom-scrollbar">
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
                        } else {
                          await setDoc(doc(db, 'data_warga', docId), finalData);
                          setWargaData([...wargaData, finalData]);
                          showNotification('Warga baru berhasil ditambahkan', 'success');
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
                               <option value="SD">SD</option>
                               <option value="SMP">SMP</option>
                               <option value="SMA">SMA</option>
                               <option value="S1">S1</option>
                               <option value="S2">S2</option>
                               <option value="S3">S3</option>
                               <option value="DIPLOMA 1">DIPLOMA 1</option>
                               <option value="DIPLOMA 2">DIPLOMA 2</option>
                               <option value="DIPLOMA 3">DIPLOMA 3</option>
                               <option value="DIPLOMA 4">DIPLOMA 4</option>
                               <option value="BELUM SEKOLAH">BELUM SEKOLAH</option>
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
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end items-center">
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
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden p-6 relative">
                <button onClick={() => setViewWarga(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors z-10"><X size={20} /></button>
                <div className="flex flex-col items-center text-center mb-6 shrink-0">
                   <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-brand-blue text-4xl font-black shadow-inner mb-4 overflow-hidden">
                      {viewWarga.foto ? <img src={viewWarga.foto} className="w-full h-full object-cover" /> : viewWarga.nama.charAt(0)}
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">{viewWarga.nama}</h3>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RT / RW</span>
                        <span className="text-sm font-black text-slate-700">RT {viewWarga.rt || '-'} / RW {viewWarga.rw || '-'}</span>
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
