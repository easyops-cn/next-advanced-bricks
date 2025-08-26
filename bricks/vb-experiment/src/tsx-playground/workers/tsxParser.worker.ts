// istanbul ignore file
import { parseTsx, type ParseJsxOptions } from "@next-shared/jsx-storyboard";
import { expose } from "comlink";

class TsxParserWorker {
  parse(source: string, options?: ParseJsxOptions) {
    return parseTsx(source, options);
  }
}

expose(TsxParserWorker);
