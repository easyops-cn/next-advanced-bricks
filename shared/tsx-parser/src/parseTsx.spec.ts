import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseTsx } from "./parseTsx.js";

describe("parseTsx", () => {
  test("should work", async () => {
    const code = await readFile(
      path.join(__dirname, "./__fixtures__/logs.txt"),
      "utf-8"
    );

    const { source, ...result } = parseTsx(code);
    expect(result).toMatchSnapshot();
  });
});
