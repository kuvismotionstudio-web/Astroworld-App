// preload/optimizer.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { Category, Issue, ScanResult, CleanPlan, OptimizerLog } from '../shared/types/optimizer';

contextBridge.exposeInMainWorld('optimizer', {
  scan: (categories: string[]) => ipcRenderer.invoke('optimizer:scan', categories),
  dryRun: (plan: CleanPlan) => ipcRenderer.invoke('optimizer:dryRun', plan),
  clean: (plan: CleanPlan) => ipcRenderer.invoke('optimizer:clean', plan),
  cancel: () => ipcRenderer.invoke('optimizer:cancel'),
  createRestorePoint: () => ipcRenderer.invoke('optimizer:createRestorePoint'),
  restore: () => ipcRenderer.invoke('optimizer:restore'),
  getLogs: () => ipcRenderer.invoke('optimizer:getLogs'),
  onProgress: (cb: (progress: number, current: string) => void) => {
    ipcRenderer.on('optimizer:progress', (_e, progress, current) => cb(progress, current));
  },
  onLog: (cb: (log: OptimizerLog) => void) => {
    ipcRenderer.on('optimizer:log', (_e, log) => cb(log));
  }
});
