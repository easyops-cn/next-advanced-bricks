// istanbul ignore file
import { parseTsx, type ParseOptions } from "@next-shared/tsx-parser";
import { expose } from "comlink";

class TsxParserWorker {
  parse(source: string, options?: ParseOptions) {
    return parseTsx(source, options);
  }
}

expose(TsxParserWorker);
