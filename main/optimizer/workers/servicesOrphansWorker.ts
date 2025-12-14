// main/optimizer/workers/servicesOrphansWorker.ts
import { parentPort } from 'worker_threads';
import { exec } from 'child_process';
import fs from 'fs';

function checkPathExists(p: string): boolean {
  try { return fs.existsSync(p); } catch { return false; }
}

function parseServices(): Promise<any[]> {
  return new Promise((resolve) => {
    exec('reg query "HKLM\\SYSTEM\\CurrentControlSet\\Services"', (err, stdout) => {
      const issues: any[] = [];
      if (!err && stdout) {
        const lines = stdout.split(/\r?\n/).filter(l => l.trim().startsWith('HKEY'));
        for (const line of lines) {
          const key = line.trim();
          exec(`reg query "${key}" /v ImagePath`, (err2, stdout2) => {
            if (!err2 && stdout2) {
              const match = stdout2.match(/ImagePath\s+REG_\w+\s+(.+)/);
              if (match && match[1] && !checkPathExists(match[1])) {
                issues.push({
                  id: key,
                  category: 'servicesOrphans',
                  regPath: key,
                  severity: 'warn',
                  description: 'Sierota w usługach (ImagePath nie istnieje)',
                  safe: false
                });
              }
            }
          });
        }
      }
      setTimeout(() => resolve(issues), 2000); // Czekaj na podprocesy
    });
  });
}

(async () => {
  const issues = await parseServices();
  parentPort?.postMessage({ issues });
})();
