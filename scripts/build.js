import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("Starting SmaRtRw AI production build...");

try {
  const distPath = path.join(process.cwd(), "dist");
  
  // 1. Clean dist directory cleanly
  if (fs.existsSync(distPath)) {
    console.log("Cleaning older dist folder...");
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // 2. Run Vite build for front-end assets
  console.log("Compiling client-side application (Vite)...");
  execSync("vite build", { stdio: "inherit" });

  // 3. Bundling server.ts via esbuild
  console.log("Bundling full-stack backend module (esbuild)...");
  execSync("esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs", { stdio: "inherit" });

  console.log("SmaRtRw AI compilation successfully completed!");
} catch (error) {
  console.error("Compilation error caught:", error);
  process.exit(1);
}
