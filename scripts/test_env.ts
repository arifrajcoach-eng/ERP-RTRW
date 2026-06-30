console.log("=== ENVIRONMENT VARIABLES ===");
for (const key of Object.keys(process.env)) {
  if (key.includes("FIREBASE") || key.includes("KEY") || key.includes("SECRET") || key.includes("CRED") || key.includes("AUTH") || key.includes("SA_")) {
    console.log(`${key}: ${process.env[key] ? "DEFINED (length: " + process.env[key].length + ")" : "UNDEFINED"}`);
  }
}
