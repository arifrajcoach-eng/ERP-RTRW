import http from 'http';

console.log("Contacting running development background instance to request self-healing reload...");
http.get("http://localhost:3000/api/internal-restart", (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log(`Server responded with Status: ${res.statusCode}`);
    console.log(`Response Body: ${body}`);
    console.log("Success! Process instructed to abort. The supervisor will spawn a brand-new pristine server in a few seconds.");
    process.exit(0);
  });
}).on("error", (err) => {
  console.log(`Could not connect to localhost:3000 (maybe it's already booting or offline): ${err.message}`);
  process.exit(0);
});
