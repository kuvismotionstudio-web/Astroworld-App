// main/optimizer/index.ts
import { ipcMain } from 'electron';
import type { Category, ScanResult } from '../../shared/types/optimizer';
import { runOptimizerWorker } from './runWorker';

const workerMap: Record<Category, string> = {
  temp: 'tempWorker.ts',
  recycleBin: 'recycleBinWorker.ts',
  browserCaches: 'browserCacheWorker.ts',
  appCaches: 'appCacheWorker.ts',
  startup: 'startupWorker.ts',
  registryOrphans: 'registryOrphansWorker.ts',
  servicesOrphans: 'servicesOrphansWorker.ts',
};

ipcMain.handle('optimizer:scan', async (_e, payload: { categories: Category[]; dryRun: boolean }) => {
  const { categories } = payload;
  const results = await Promise.all(
    categories.map(cat => runOptimizerWorker(workerMap[cat]))
  );
  // Zbierz issues
  const issues = results.flatMap(r => r.issues || []);
  const byCategory: Record<Category, { count: number; size: number }> = {} as any;
  let totalSize = 0;
  for (const cat of categories) {
    const catIssues = issues.filter(i => i.category === cat);
    const size = catIssues.reduce((a, b) => a + (b.size || 0), 0);
    byCategory[cat] = { count: catIssues.length, size };
    totalSize += size;
  }
  const result: ScanResult = { issues, totalSize, byCategory };
  return result;
});
ipcMain.handle('optimizer:dryRun', async (_e, plan: CleanPlan) => {
  // Dry-run czyszczenia (symulacja)
});
ipcMain.handle('optimizer:clean', async (_e, plan: CleanPlan) => {
  // Właściwe czyszczenie, z postępem i możliwością anulowania
});
ipcMain.handle('optimizer:cancel', async () => {
  // Anulowanie operacji
});
ipcMain.handle('optimizer:createRestorePoint', async () => {
  // Utwórz punkt przywracania (np. kopia rejestru, backup plików)
});
ipcMain.handle('optimizer:restore', async () => {
  // Przywróć z backupu
});
ipcMain.handle('optimizer:getLogs', async () => {
  // Zwróć logi z katalogu logs/
});
// Emitowanie postępu/logów do renderera przez eventy
// ...
