// istanbul ignore file
import { wrap } from "comlink";
import type { LintRequest, LintResponse } from "./lintYaml";

export interface RemoteYamlLinterWorker {
  lint(req: LintRequest): Promise<LintResponse>;
}

let remoteWorkerPromise: Promise<RemoteYamlLinterWorker> | undefined;

let worker: Worker | undefined;

export function getRemoteYamlLinterWorker() {
  if (!remoteWorkerPromise) {
    remoteWorkerPromise = (async () => {
      const Remote = wrap<{ new (): RemoteYamlLinterWorker }>(getWorker());
      return await new Remote();
    })();
  }
  return remoteWorkerPromise;
}

export function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./yamlLinter.worker.ts", import.meta.url));
  }
  return worker;
}
