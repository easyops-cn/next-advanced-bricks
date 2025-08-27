// istanbul ignore file
import type {
  ConstructResult,
  ParseJsxOptions,
} from "@next-shared/jsx-storyboard";
import { wrap } from "comlink";

export interface RemoteTsxParserWorker {
  parse(source: string, options?: ParseJsxOptions): Promise<ConstructResult>;
}

let remoteWorkerPromise: Promise<RemoteTsxParserWorker> | undefined;

let worker: Worker | undefined;

export function getRemoteTsxParserWorker() {
  if (!remoteWorkerPromise) {
    remoteWorkerPromise = (async () => {
      const Remote = wrap<{ new (): RemoteTsxParserWorker }>(getWorker());
      return await new Remote();
    })();
  }
  return remoteWorkerPromise;
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./tsxParser.worker.ts", import.meta.url));
  }
  return worker;
}
