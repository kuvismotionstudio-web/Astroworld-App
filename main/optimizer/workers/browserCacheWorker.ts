// main/optimizer/workers/browserCacheWorker.ts
import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

const browserProfiles = [
  // Chrome
  path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data'),
  // Edge
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'User Data'),
  // Firefox
  path.join(process.env.APPDATA || '', 'Mozilla', 'Firefox', 'Profiles'),
];

const cacheDirs = ['Cache', 'Code Cache', 'GPUCache', 'cache2'];

function isProcessRunning(name: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`tasklist /FI "IMAGENAME eq ${name}"`, (err, stdout) => {
      resolve(stdout && stdout.toLowerCase().includes(name.toLowerCase()));
    });
  });
}

async function scanBrowserCaches() {
  let issues: any[] = [];
  for (const profileRoot of browserProfiles) {
    try {
      const profiles = await fs.readdir(profileRoot).catch(() => []);
      for (const prof of profiles) {
        for (const cache of cacheDirs) {
          const cachePath = path.join(profileRoot, prof, cache);
          try {
            const stat = await fs.stat(cachePath);
            if (stat.isDirectory()) {
              const files = await fs.readdir(cachePath);
              let size = 0;
              for (const f of files) {
                const fpath = path.join(cachePath, f);
                try { size += (await fs.stat(fpath)).size; } catch {}
              }
              if (size > 0) {
                issues.push({
                  id: cachePath,
                  category: 'browserCaches',
                  path: cachePath,
                  size,
                  severity: 'info',
                  description: `Cache przeglądarki: ${cachePath}`,
                  safe: true
                });
              }
            }
          } catch {}
        }
      }
    } catch {}
  }
  return issues;
}

(async () => {
  // Sprawdź czy przeglądarki są uruchomione
  const running = await Promise.all([
    isProcessRunning('chrome.exe'),
    isProcessRunning('msedge.exe'),
    isProcessRunning('firefox.exe'),
  ]);
  if (running.some(Boolean)) {
    parentPort?.postMessage({ warning: 'Przeglądarki są uruchomione. Zamknij je przed czyszczeniem cache.' });
  }
  const issues = await scanBrowserCaches();
  parentPort?.postMessage({ issues });
})();
