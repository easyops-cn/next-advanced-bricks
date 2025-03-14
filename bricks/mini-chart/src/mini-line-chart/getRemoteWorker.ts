// istanbul ignore file
import { wrap } from "comlink";
import type { MiniLineChartOptions } from "./draw.js";

export interface RemoteWorker {
  init(id: string, canvas: OffscreenCanvas): Promise<void>;
  dispose(id: string): Promise<void>;
  drawMiniLineChart(id: string, options: MiniLineChartOptions): Promise<void>;
}

let remoteWorkerPromise: Promise<RemoteWorker> | undefined;

let worker: Worker | undefined;

export function getRemoteWorker() {
  if (!remoteWorkerPromise) {
    remoteWorkerPromise = (async () => {
      const Remote = wrap<{ new (): RemoteWorker }>(getWorker());
      return await new Remote();
    })();
  }
  return remoteWorkerPromise;
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./chart.worker.ts", import.meta.url));
  }
  return worker;
}
