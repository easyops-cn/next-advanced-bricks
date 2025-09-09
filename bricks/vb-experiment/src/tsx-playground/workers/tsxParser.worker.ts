// istanbul ignore file
import { parseTsx, type ParseTsxOptions } from "@next-shared/jsx-storyboard";
import { expose } from "comlink";

class TsxParserWorker {
  parse(source: string, options?: ParseTsxOptions) {
    return parseTsx(source, options);
  }
}

expose(TsxParserWorker);
