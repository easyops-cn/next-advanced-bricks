import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseTemplate } from "./parseTemplate.js";

describe("parseTemplate", () => {
  test("should work", async () => {
    const code = await readFile(
      path.join(__dirname, "./__fixtures__/tpl.txt"),
      "utf-8"
    );

    const view = parseTemplate(code);
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
