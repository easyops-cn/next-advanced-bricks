// istanbul ignore file
import {
  parseApp,
  parseView,
  type ParseOptions,
  type SourceFile,
} from "@next-tsx/parser";
import { expose } from "comlink";

class TsxParserWorker {
  parseView(source: string, options?: ParseOptions) {
    return parseView(source, options);
  }

  parseApp(files: SourceFile[]) {
    return parseApp(files);
  }
}

expose(TsxParserWorker);
