// main/optimizer/workers/startupWorker.ts
import { parentPort } from 'worker_threads';
import { exec } from 'child_process';

function getStartupEntries(): Promise<any[]> {
  return new Promise((resolve) => {
    exec('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', (err, stdout) => {
      const entries: any[] = [];
      if (!err && stdout) {
        const lines = stdout.split(/\r?\n/).filter(l => l.trim());
        for (const line of lines) {
          if (line.includes('    ')) {
            const [name, type, value] = line.trim().split(/\s{2,}/);
            entries.push({ name, path: value, enabled: true, regPath: 'HKCU' });
          }
        }
      }
      // TODO: Dodaj HKLM i folder Startup
      resolve(entries);
    });
  });
}

(async () => {
  const entries = await getStartupEntries();
  parentPort?.postMessage({ entries });
})();
