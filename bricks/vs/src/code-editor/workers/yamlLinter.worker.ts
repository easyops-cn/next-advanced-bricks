// istanbul ignore file
import { expose } from "comlink";
import { lintYaml, type LintRequest } from "./lintYaml";

class YamlLinterWorker {
  lint(req: LintRequest) {
    return lintYaml(req);
  }
}

expose(YamlLinterWorker);
