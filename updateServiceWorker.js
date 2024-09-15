import fs from "fs";
import path from "path";

const serviceWorkerPath = path.join(
  process.cwd(),
  "build",
  "service-worker.js",
);
const timestamp = Date.now();

fs.readFile(serviceWorkerPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading service-worker.js:", err);
    return;
  }

  const cacheNameRegex = /const\s+CACHE_NAME\s*=\s*["']([^"']+)["']/;
  const match = data.match(cacheNameRegex);

  if (match) {
    const currentCacheName = match[1];
    const newCacheName = `choobs-app-cache-v${timestamp}`;

    const updatedData = data.replace(
      cacheNameRegex,
      `const CACHE_NAME = "${newCacheName}"`,
    );

    fs.writeFile(serviceWorkerPath, updatedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing service-worker.js:", err);
        return;
      }
      console.log(`Service worker cache name set to "${newCacheName}".\n`);
    });
  } else {
    console.error("Could not find CACHE_NAME in service-worker.js");
  }
});
