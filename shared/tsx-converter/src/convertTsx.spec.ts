import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseTsx } from "@next-shared/tsx-parser";
import { convertTsx } from "./convertTsx.js";

describe("convertTsx", () => {
  test("should work", async () => {
    const code = await readFile(
      path.join(__dirname, "../../tsx-parser/src/__fixtures__/logs.txt"),
      "utf-8"
    );

    const parseResult = parseTsx(code);
    const result = await convertTsx(parseResult, { rootId: "test-root" });
    expect(result).toMatchSnapshot();
  });
});
