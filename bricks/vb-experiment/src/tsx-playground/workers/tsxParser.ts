// istanbul ignore file
import type { ParsedApp, ParseOptions, SourceFile } from "@next-tsx/parser";
import { wrap } from "comlink";

export interface RemoteTsxParserWorker {
  parseView(source: string, options?: ParseOptions): Promise<ParsedApp>;
  parseApp(files: SourceFile[]): Promise<ParsedApp>;
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
