// main/optimizer/workers/recycleBinWorker.ts
import { parentPort } from 'worker_threads';
import { exec } from 'child_process';


function getRecycleBinInfo(): Promise<{ size: number; count: number }> {
  return new Promise((resolve) => {
    exec('PowerShell -Command "(Get-ChildItem -Path $env:Recycle.Bin -Recurse | Measure-Object -Property Length -Sum).Sum"', (err, stdout) => {
      const size = parseInt(stdout) || 0;
      exec('PowerShell -Command "(Get-ChildItem -Path $env:Recycle.Bin -Recurse).Count"', (err2, stdout2) => {
        const count = parseInt(stdout2) || 0;
        resolve({ size, count });
      });
    });
  });
}

function clearRecycleBin(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('PowerShell -Command "Clear-RecycleBin -Force"', (err) => {
      resolve(!err);
    });
  });
}

(async () => {
  const info = await getRecycleBinInfo();
  parentPort?.postMessage({ issues: [{
    id: 'recycleBin',
    category: 'recycleBin',
    size: info.size,
    severity: info.size > 0 ? 'warn' : 'info',
    description: `Kosz: ${info.count} plików, ${Math.round(info.size/1024/1024)} MB`,
    safe: true
  }] });

  // Jeśli worker uruchomiony z trybem "clean", wyczyść kosz
  if (process.env.CLEAN === '1') {
    await clearRecycleBin();
    parentPort?.postMessage({ cleaned: true });
  }
})();
