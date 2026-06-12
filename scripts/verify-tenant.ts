import * as fs from "fs";
import * as path from "path";

/**
 * SmartRW AI — Security & Integrity Verification Engine v2
 * =========================================================
 * Dijalankan oleh: npm run verify  (dan GitHub Actions CI)
 * Exit 0 = PASSED | Exit 1 = FAILED
 */

const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

interface Finding { rule: string; file: string; line: number; snippet: string; }
const criticalFindings: Finding[] = [];
const highFindings: Finding[] = [];
let passed = 0;

const SRC = path.join(process.cwd(), "src");

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getAllFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...getAllFiles(full));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function read(p: string) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return ""; }
}

function rel(p: string) { return p.replace(process.cwd() + "/", ""); }

function ok(rule: string) {
  passed++;
  console.log(`${GREEN}✔${RESET} ${rule}`);
}

function critical(rule: string, file: string, line: number, snippet: string) {
  criticalFindings.push({ rule, file, line, snippet });
  console.log(`${RED}${BOLD}✘ [CRITICAL]${RESET} ${rule}`);
  console.log(`  ${YELLOW}${rel(file)}:${line}${RESET}`);
  console.log(`  ${snippet.trim().slice(0, 120)}`);
}

function high(rule: string, file: string, line: number, snippet: string) {
  highFindings.push({ rule, file, line, snippet });
  console.log(`${YELLOW}${BOLD}✘ [HIGH]${RESET} ${rule}`);
  console.log(`  ${rel(file)}:${line} — ${snippet.trim().slice(0, 100)}`);
}

// ─── RULE 1: Hardcoded tenant fallback ──────────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 1: Hardcoded Tenant Fallback ──${RESET}`);
{
  const pattern = /\|\|\s*['"`]rw\d+_[a-z_]+['"`]/;
  let found = false;
  for (const file of getAllFiles(SRC)) {
    read(file).split("\n").forEach((line, i) => {
      if (pattern.test(line)) {
        found = true;
        critical("Hardcoded tenant fallback", file, i + 1, line);
      }
    });
  }
  if (!found) ok("Tidak ada hardcoded tenant fallback");
}

// ─── RULE 2: addDoc tanpa tenantId ──────────────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 2: addDoc() tanpa tenantId ──${RESET}`);
{
  let found = false;
  for (const file of getAllFiles(SRC)) {
    const lines = read(file).split("\n");
    lines.forEach((line, i) => {
      if (/addDoc\(/.test(line) && !/^\s*\/\//.test(line)) {
        const block = lines.slice(i, i + 15).join("\n");
        // Skip: pembuatan tenant baru (collection tenants) - memang tidak butuh tenantId
        if (/collection\(db,\s*['\"\`]tenants['\"\`]\)/.test(block)) return;
        // Skip: pakai ...data spread (tenantId dibawa via spread dari parameter)
        if (/\.\.\.data/.test(block)) return;
        if (!/tenantId/.test(block)) {
          found = true;
          critical("addDoc() tanpa tenantId dalam payload", file, i + 1, line);
        }
      }
    });
  }
  if (!found) ok("Semua addDoc() memiliki tenantId");
}

// ─── RULE 3: localStorage.clear() berbahaya ─────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 3: localStorage.clear() berbahaya ──${RESET}`);
{
  let found = false;
  for (const file of getAllFiles(SRC)) {
    const lines = read(file).split("\n");
    lines.forEach((line, i) => {
      if (/localStorage\.clear\(\)/.test(line)) {
        const ctx = lines.slice(Math.max(0, i - 3), i + 3).join("\n");
        if (!/safe|SAFE|ErrorBoundary/.test(ctx)) {
          found = true;
          critical("localStorage.clear() tanpa proteksi — menghapus kunci auth & tenant", file, i + 1, line);
        }
      }
    });
  }
  if (!found) ok("Tidak ada localStorage.clear() berbahaya");
}

// ─── RULE 4: API Key literal ─────────────────────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 4: API Key literal di source ──${RESET}`);
{
  let found = false;
  for (const file of getAllFiles(SRC)) {
    read(file).split("\n").forEach((line, i) => {
      if (/AIza[0-9A-Za-z_-]{35}/.test(line) || /sk-[a-zA-Z0-9]{48}/.test(line)) {
        found = true;
        critical("API Key ditemukan dalam source code", file, i + 1, "***REDACTED***");
      }
    });
  }
  if (!found) ok("Tidak ada API Key literal");
}

// ─── RULE 5: useEffect dependency array ──────────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 5: useEffect dependency kosong ──${RESET}`);
{
  let found = false;
  for (const file of getAllFiles(SRC)) {
    const lines = read(file).split("\n");
    lines.forEach((line, i) => {
      if (/useEffect\(/.test(line)) {
        const block = lines.slice(i, i + 20).join("\n");
        // Hanya flag jika tenantId dipakai dalam BODY useEffect (bukan hanya deklarasi var)
        // dan dependency array benar-benar kosong
        const hasEmptyDep = /},\s*\[\]\)/.test(block);
        const usesTenantInQuery = /where.*tenantId|tenantId.*==|onSnapshot.*tenantId|getDocs.*tenantId/.test(block);
        if (hasEmptyDep && usesTenantInQuery) {
          found = true;
          high("useEffect pakai tenantId dalam query tapi dependency array kosong []", file, i + 1, line);
        }
      }
    });
  }
  if (!found) ok("Semua useEffect dependency array sudah benar");
}

// ─── RULE 6: ErrorBoundary melindungi kunci tenant ───────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 6: ErrorBoundary protection ──${RESET}`);
{
  const ebPath = path.join(SRC, "components", "ErrorBoundary.tsx");
  const content = read(ebPath);
  const keys = ["impersonatedTenantId", "currentTenant", "parentTenant", "firebase:auth"];
  const missing = keys.filter(k => !content.includes(k));
  if (missing.length > 0) {
    critical("ErrorBoundary tidak melindungi kunci tenant: " + missing.join(", "), ebPath, 1, "");
  } else {
    ok("ErrorBoundary melindungi semua kunci tenant");
  }
}

// ─── RULE 7: Global ErrorBoundary di main.tsx ────────────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 7: Global ErrorBoundary ──${RESET}`);
{
  const mainPath = path.join(SRC, "main.tsx");
  const content = read(mainPath);
  if (!content.includes("<ErrorBoundary>") || !content.includes("</ErrorBoundary>")) {
    critical("Global <ErrorBoundary> tidak ada di main.tsx", mainPath, 1, "");
  } else {
    ok("Global ErrorBoundary ada di main.tsx");
  }
}

// ─── RULE 8: Firestore rules tidak ada 'allow if true' ───────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 8: Firestore Rules keamanan ──${RESET}`);
{
  const rulesPath = path.join(process.cwd(), "firestore.rules");
  const content = read(rulesPath);
  // Cek hanya allow read/write yang benar-benar berbahaya (bukan allow create untuk registration)
  const dangerousRules = content.split("\n").filter((line, i) => {
    if (/allow\s+read.*if\s+true/.test(line)) return true;
    if (/allow\s+write.*if\s+true/.test(line)) return true;
    if (/allow\s+read,\s*write.*if\s+true/.test(line)) return true;
    return false;
  });
  if (dangerousRules.length > 0) {
    critical("firestore.rules memiliki 'allow read/write if true' — data terbuka publik!", rulesPath, 1, dangerousRules[0]);
  } else {
    ok("Firestore Rules tidak ada allow read/write if true");
  }
}

// ─── RULE 9: parentId + tenantId konsistensi App.tsx ────────────────────────
console.log(`\n${CYAN}${BOLD}── RULE 9: Konsistensi parentId/tenantId ──${RESET}`);
{
  const appPath = path.join(SRC, "App.tsx");
  const content = read(appPath);
  if (!content.includes("parentId") || !content.includes("tenantId")) {
    high("parentId atau tenantId tidak ditemukan di App.tsx — hierarki tenant bisa rusak", appPath, 1, "");
  } else {
    ok("parentId dan tenantId ada di App.tsx");
  }
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(50)}`);
console.log(`${BOLD}SMARTRW AI — VERIFICATION SUMMARY${RESET}`);
console.log(`${"═".repeat(50)}`);
console.log(`${GREEN}  PASSED   : ${passed}${RESET}`);
console.log(`${YELLOW}  HIGH     : ${highFindings.length}${RESET}`);
console.log(`${RED}  CRITICAL : ${criticalFindings.length}${RESET}`);
console.log(`${"═".repeat(50)}`);

// Tulis JSON output untuk dikonsumsi GitHub Actions
const report = {
  timestamp: new Date().toISOString(),
  summary: { passed, high: highFindings.length, critical: criticalFindings.length },
  critical: criticalFindings,
  high: highFindings,
};
fs.writeFileSync("audit-report.json", JSON.stringify(report, null, 2));

if (criticalFindings.length > 0 || highFindings.length > 0) {
  console.error(`\n${RED}${BOLD}STATUS: FAILED — ${criticalFindings.length} CRITICAL, ${highFindings.length} HIGH${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}STATUS: PASSED — Sistem aman ✅${RESET}`);
  process.exit(0);
}
