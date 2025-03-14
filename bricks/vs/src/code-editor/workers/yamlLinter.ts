// istanbul ignore file

let worker: Worker | undefined;

export function getYamlLinterWorker() {
  if (!worker) {
    worker = new Worker(new URL("./yamlLinter.worker.ts", import.meta.url));
  }
  return worker;
}
