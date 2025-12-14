
export type Category =
  | 'temp'
  | 'recycleBin'
  | 'browserCaches'
  | 'appCaches'
  | 'startup'
  | 'registryOrphans'
  | 'servicesOrphans';

export interface Issue {
  id: string;
  category: Category;
  path?: string;
  regPath?: string;
  size?: number;
  severity: 'info' | 'warn' | 'critical';
  description: string;
  safe: boolean;
}

export interface ScanResult {
  issues: Issue[];
  totalSize: number;
  byCategory: Record<Category, { count: number; size: number }>;
}

export interface CleanPlan {
  jobId: string;
  issues: string[];
  backup: boolean;
  createRestorePoint: boolean;
  timestamp: number;
}

export interface ProgressEvent {
  jobId: string;
  progress: number;
  current?: string;
}

export interface StartupEntry {
  name: string;
  path: string;
  exists: boolean;
  enabled: boolean;
  publisher?: string;
  regPath?: string;
}

export interface OptimizerStats {
  lastScan: number;
  lastClean: number;
  totalCleaned: number;
  runs: number;
}
