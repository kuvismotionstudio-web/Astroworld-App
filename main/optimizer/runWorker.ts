// main/optimizer/runWorker.ts
import { Worker } from 'worker_threads';
import path from 'path';

export function runOptimizerWorker(workerName: string, opts: Record<string, any> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'workers', workerName), { env: { ...process.env, ...opts } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => { if (code !== 0) reject(new Error(`Worker ${workerName} exited with code ${code}`)); });
  });
}
