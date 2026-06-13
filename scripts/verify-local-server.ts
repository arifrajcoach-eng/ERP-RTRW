import http from 'http';

function getUrl(url: string): Promise<{ statusCode?: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Origin': 'https://ai.studio'
      }
    };
    http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).end();
  });
}

async function runDiagnostics() {
  console.log("=== STARTING LOCAL SERVER DIAGNOSTICS ===");
  try {
    // 1. Check Root
    console.log("Fetching http://localhost:3000/ ...");
    const rootRes = await getUrl("http://localhost:3000/");
    console.log(`Root Status Code: ${rootRes.statusCode}`);
    console.log("Root Headers:", JSON.stringify(rootRes.headers, null, 2));
    console.log(`Root Content-Type: ${rootRes.headers['content-type']}`);
    console.log(`Root HTML Length: ${rootRes.body.length} bytes`);
    console.log(`Root HTML preview (first 500 chars):\n${rootRes.body.slice(0, 500)}\n...`);

    // 1b. Check API Health
    console.log("Fetching http://localhost:3000/api/health ...");
    try {
      const healthRes = await getUrl("http://localhost:3000/api/health");
      console.log(`Api Health Status: ${healthRes.statusCode}`);
      console.log("Api Health Headers:", JSON.stringify(healthRes.headers, null, 2));
      console.log(`Api Health Body: ${healthRes.body}`);
    } catch (e: any) {
      console.log(`Api Health Fetch Failed: ${e.message}`);
    }

    // 2. Check if there are script paths in HTML
    const scriptMatches = rootRes.body.match(/<script[^>]+src="([^"]+)"/g);
    console.log(`Script tags found in HTML:`, scriptMatches);

    // 3. Test script paths if found
    if (scriptMatches) {
      for (const tag of scriptMatches) {
        const srcMatch = tag.match(/src="([^"]+)"/);
        if (srcMatch) {
          const srcPath = srcMatch[1];
          const fullUrl = `http://localhost:3000${srcPath.startsWith('http') ? srcPath : srcPath}`;
          console.log(`Fetching script: ${fullUrl} ...`);
          try {
            const scriptRes = await getUrl(fullUrl);
            console.log(`  Status: ${scriptRes.statusCode}`);
            console.log(`  Content-Type: ${scriptRes.headers['content-type']}`);
            console.log(`  Length: ${scriptRes.body.length} bytes`);
            console.log(`  Preview (first 150 chars):\n${scriptRes.body.slice(0, 150)}\n...`);
          } catch (err: any) {
            console.log(`  FAILED to fetch script: ${err.message}`);
          }
        }
      }
    }

    // 4. Test dev path /src/main.tsx directly if dev mode loader
    console.log("Fetching dev path http://localhost:3000/src/main.tsx ...");
    try {
      const devRes = await getUrl("http://localhost:3000/src/main.tsx");
      console.log(`  Status: ${devRes.statusCode}`);
      console.log(`  Content-Type: ${devRes.headers['content-type']}`);
      console.log(`  Length: ${devRes.body.length} bytes`);
    } catch (e: any) {
      console.log(`  Failed dev fetch: ${e.message}`);
    }

    // 5. Test dev path /src/App.tsx directly
    console.log("Fetching dev path http://localhost:3000/src/App.tsx ...");
    try {
      const appRes = await getUrl("http://localhost:3000/src/App.tsx");
      console.log(`  Status: ${appRes.statusCode}`);
      console.log(`  Content-Type: ${appRes.headers['content-type']}`);
      console.log(`  Length: ${appRes.body.length} bytes`);
      if (appRes.statusCode !== 200) {
        console.log(`  ERROR BODY:\n${appRes.body}`);
      } else {
        console.log(`  App.tsx compiled successfully! (Preview first 150 chars):\n${appRes.body.slice(0, 150)}...`);
      }
    } catch (e: any) {
      console.log(`  Failed App.tsx fetch: ${e.message}`);
    }

    // 6. Test dev path /src/index.css directly
    console.log("Fetching dev path http://localhost:3000/src/index.css ...");
    try {
      const cssRes = await getUrl("http://localhost:3000/src/index.css");
      console.log(`  Status: ${cssRes.statusCode}`);
      console.log(`  Content-Type: ${cssRes.headers['content-type']}`);
      console.log(`  Length: ${cssRes.body.length} bytes`);
      if (cssRes.statusCode !== 200) {
        console.log(`  ERROR BODY:\n${cssRes.body}`);
      } else {
        console.log(`  index.css compiled successfully! (Preview first 150 chars):\n${cssRes.body.slice(0, 150)}...`);
      }
    } catch (e: any) {
      console.log(`  Failed index.css fetch: ${e.message}`);
    }

  } catch (err: any) {
    console.error("Diagnostics Exception:", err.message);
  }
}

runDiagnostics();
