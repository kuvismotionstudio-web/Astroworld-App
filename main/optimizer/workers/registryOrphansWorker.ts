// main/optimizer/workers/registryOrphansWorker.ts
import { parentPort } from 'worker_threads';
import { exec } from 'child_process';
import fs from 'fs';

function checkPathExists(p: string): boolean {
  try { return fs.existsSync(p); } catch { return false; }
}

function parseUninstallEntries(): Promise<any[]> {
  return new Promise((resolve) => {
    exec('reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall" /s', (err, stdout) => {
      const issues: any[] = [];
      if (!err && stdout) {
        const blocks = stdout.split(/\r?\n\r?\n/);
        for (const block of blocks) {
          const lines = block.split(/\r?\n/);
          let displayIcon = '', installLocation = '', key = '';
          for (const line of lines) {
            if (line.includes('DisplayIcon')) displayIcon = line.split('    ').pop()?.trim() || '';
            if (line.includes('InstallLocation')) installLocation = line.split('    ').pop()?.trim() || '';
            if (line.startsWith('HKEY')) key = line.trim();
          }
          if (key && ((displayIcon && !checkPathExists(displayIcon)) || (installLocation && !checkPathExists(installLocation)))) {
            issues.push({
              id: key,
              category: 'registryOrphans',
              regPath: key,
              severity: 'warn',
              description: 'Sierota w rejestrze (Uninstall)',
              safe: true
            });
          }
        }
      }
      resolve(issues);
    });
  });
}

(async () => {
  const issues = await parseUninstallEntries();
  parentPort?.postMessage({ issues });
})();
