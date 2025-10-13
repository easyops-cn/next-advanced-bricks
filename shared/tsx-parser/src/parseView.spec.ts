import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseView } from "./parseView.js";

describe("parseView", () => {
  test("should work", async () => {
    const code = await readFile(
      path.join(__dirname, "./__fixtures__/logs.txt"),
      "utf-8"
    );

    const view = parseView(code);
    const simplifiedView = {
      ...view,
      files: undefined,
      entry: {
        ...view.entry!,
        source: undefined,
      },
      modules: [],
    };
    expect(simplifiedView).toMatchSnapshot();
  });
});
