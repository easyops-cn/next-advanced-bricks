// istanbul ignore file
import { wrap } from "comlink";
import type { MiniLineChartOptions } from "./draw.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getChartWorker } from "./worker.mjs";

export interface RemoteWorker {
  init(id: string, canvas: OffscreenCanvas): Promise<void>;
  dispose(id: string): Promise<void>;
  drawMiniLineChart(id: string, options: MiniLineChartOptions): Promise<void>;
}

let remoteWorkerPromise: Promise<RemoteWorker> | undefined;

export function getRemoteWorker() {
  if (!remoteWorkerPromise) {
    remoteWorkerPromise = (async () => {
      const Remote = wrap(getChartWorker()) as any;
      return await new Remote();
    })();
  }
  return remoteWorkerPromise;
}
