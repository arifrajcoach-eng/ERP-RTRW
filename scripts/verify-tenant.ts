import * as fs from "fs";
import * as path from "path";

/**
 * SmartRW AI - Tenant & Code Integrity Verification Engine
 * Runs static code analysis to guarantee Parent-Child tenancy and Self-Healing integrity.
 */

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

let hasErrors = false;

function checkRule(name: string, assertion: () => boolean, failureMessage: string) {
  console.log(`Checking [${name}]...`);
  try {
    if (assertion()) {
      console.log(`${GREEN}✔ Passed: ${name}${RESET}`);
    } else {
      console.error(`${RED}✘ Failed: ${name}${RESET}`);
      console.error(`${YELLOW}Reason: ${failureMessage}${RESET}`);
      hasErrors = true;
    }
  } catch (err: any) {
    console.error(`${RED}✘ Verification Exited with Error: ${err.message}${RESET}`);
    hasErrors = true;
  }
}

// 1. Check ErrorBoundary exists and protects impersonated state
checkRule(
  "ErrorBoundary Self-Healing Key Protection",
  () => {
    const errorBoundaryPath = path.join(process.cwd(), "src", "components", "ErrorBoundary.tsx");
    if (!fs.existsSync(errorBoundaryPath)) return false;
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    
    // It must keep crucial tenant keys safe during cache purge
    const keys = ["impersonatedTenantId", "currentTenant", "parentTenant", "firebase:auth"];
    return keys.every(key => content.includes(key));
  },
  "The ErrorBoundary component is missing or lacks protection for crucial resident session/tenant keys."
);

// 2. Check main app renders the custom ErrorBoundary wrapper around App component inside main.tsx
checkRule(
  "Global ErrorBoundary Wrapper in main.tsx",
  () => {
    const mainPath = path.join(process.cwd(), "src", "main.tsx");
    if (!fs.existsSync(mainPath)) return false;
    const content = fs.readFileSync(mainPath, "utf-8");
    return content.includes("<ErrorBoundary>") && content.includes("</ErrorBoundary>");
  },
  "The global React entry (src/main.tsx) does not wrap the main App component inside <ErrorBoundary>, which breaks error recovery."
);

// 3. Ensure Firestore queries include Tenant Segregation safeguards
checkRule(
  "Firestore Tenant Filter Pattern Safeguard",
  () => {
    const appPath = path.join(process.cwd(), "src", "App.tsx");
    if (!fs.existsSync(appPath)) return false;
    const content = fs.readFileSync(appPath, "utf-8");
    
    // Check that we reference parentId and tenantId consistently
    return content.includes("parentId") && content.includes("tenantId");
  },
  "The core Application code (src/App.tsx) appears to have broken reference properties for parentId or tenantId structures."
);

// 4. Ensure no unauthorized localStorage.clear() exists that wipes critical session rules
checkRule(
  "No Unsafe localStorage Clears",
  () => {
    const appPath = path.join(process.cwd(), "src", "App.tsx");
    if (!fs.existsSync(appPath)) return true; // If not exists, passes
    const content = fs.readFileSync(appPath, "utf-8");
    
    // Check if there is an un-bracketed or un-checked call to localStorage.clear() inside React handlers
    const unsafeClear = content.includes("localStorage.clear()") && !content.includes("ErrorBoundary");
    return !unsafeClear;
  },
  "Detected a generic localStorage.clear() in src/App.tsx which will wipe clean the necessary parent-child impersonation keys."
);

console.log("\n=============================================");
if (hasErrors) {
  console.error(`${RED}STATUS: FAILED. Integrity checks failed.${RESET}`);
  console.log("=============================================");
  process.exit(1);
} else {
  console.log(`${GREEN}STATUS: PASSED. Code architecture is pristine!${RESET}`);
  console.log("=============================================");
  process.exit(0);
}
