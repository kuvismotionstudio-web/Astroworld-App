// main/optimizer/workers/appCacheWorker.ts
import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';

const appCaches = [
  // Discord
  path.join(process.env.APPDATA || '', 'discord', 'Cache'),
  // Steam
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Steam', 'logs'),
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Steam', 'appcache', 'httpcache'),
  // Epic
  path.join(process.env.LOCALAPPDATA || '', 'EpicGamesLauncher', 'Saved', 'Logs'),
  // Unreal DDC
  path.join(process.env.LOCALAPPDATA || '', 'UnrealEngine', 'Common', 'DerivedDataCache'),
];

async function getDirSize(dir: string): Promise<number> {
  let size = 0;
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const f of files) {
      const fpath = path.join(dir, f.name);
      if (f.isDirectory()) size += await getDirSize(fpath);
      else size += (await fs.stat(fpath)).size;
    }
  } catch {}
  return size;
}

(async () => {
  let issues: any[] = [];
  for (const cachePath of appCaches) {
    try {
      const stat = await fs.stat(cachePath);
      if (stat.isDirectory()) {
        const size = await getDirSize(cachePath);
        if (size > 0) {
          issues.push({
            id: cachePath,
            category: 'appCaches',
            path: cachePath,
            size,
            severity: 'info',
            description: `Cache aplikacji: ${cachePath}`,
            safe: true
          });
        }
      }
    } catch {}
  }
  parentPort?.postMessage({ issues });
})();
