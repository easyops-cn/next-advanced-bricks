// istanbul ignore file
import { parseView, type ParseOptions } from "@next-shared/tsx-parser";
import { expose } from "comlink";

class TsxParserWorker {
  parseView(source: string, options?: ParseOptions) {
    return parseView(source, options);
  }
}

expose(TsxParserWorker);
