// main/optimizer/workers/tempWorker.ts
import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const tempDirs = [
  process.env.TEMP,
  process.env.WINDIR && path.join(process.env.WINDIR, 'Temp'),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Temp'),
].filter(Boolean) as string[];

const patterns = [/\.tmp$/i, /\.temp$/i, /^~.*$/, /\.log$/i, /\.dmp$/i];
const ignoreDirs = ['chocolatey'];
const maxAgeDays = 14;

async function isOldEnough(file: string, days: number) {
  try {
    const stat = await fs.stat(file);
    const age = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    return age > days;
  } catch { return false; }
}

async function scanDir(dir: string) {
  let issues: any[] = [];
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.isDirectory()) {
        if (ignoreDirs.includes(f.name.toLowerCase())) continue;
        issues = issues.concat(await scanDir(path.join(dir, f.name)));
      } else {
        const filePath = path.join(dir, f.name);
        if (patterns.some(p => p.test(f.name))) {
          if (await isOldEnough(filePath, maxAgeDays)) {
            issues.push({
              id: filePath,
              category: 'temp',
              path: filePath,
              size: (await fs.stat(filePath)).size,
              severity: 'info',
              description: 'Stary plik tymczasowy',
              safe: true
            });
          }
        }
      }
    }
  } catch {}
  return issues;
}

(async () => {
  let allIssues: any[] = [];
  for (const dir of tempDirs) {
    allIssues = allIssues.concat(await scanDir(dir));
  }
  parentPort?.postMessage({ issues: allIssues });
})();
