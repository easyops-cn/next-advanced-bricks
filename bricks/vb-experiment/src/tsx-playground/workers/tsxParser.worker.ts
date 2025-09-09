// istanbul ignore file
import { parseTsx } from "@next-shared/tsx-parser";
import type { ParseTsxOptions } from "@next-shared/tsx-types";
import { expose } from "comlink";

class TsxParserWorker {
  parse(source: string, options?: ParseTsxOptions) {
    return parseTsx(source, options);
  }
}

expose(TsxParserWorker);
