// istanbul ignore file
import { parseView, type ParseOptions } from "@next-tsx/parser";
import { expose } from "comlink";

class TsxParserWorker {
  parseView(source: string, options?: ParseOptions) {
    return parseView(source, options);
  }
}

expose(TsxParserWorker);
