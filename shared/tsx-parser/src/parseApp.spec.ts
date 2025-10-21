import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseApp } from "./parseApp.js";

describe("parseApp", () => {
  test("should work", async () => {
    const indexContent = await readFile(
      path.join(__dirname, "./__fixtures__/app/index.txt"),
      "utf-8"
    );
    const testContent = await readFile(
      path.join(__dirname, "./__fixtures__/app/Pages/Test.txt"),
      "utf-8"
    );

    const files = [
      {
        filePath: "/index.tsx",
        content: indexContent,
      },
      {
        filePath: "/Pages/Test.tsx",
        content: testContent,
      },
    ];

    const app = parseApp(files);
    const simplifiedApp = {
      ...app,
      files: undefined,
      entry: app.entry
        ? {
            ...app.entry,
            source: undefined,
          }
        : app.entry,
      modules: new Map(
        Array.from(app.modules.entries()).map(([k, v]) => [
          k,
          v
            ? {
                ...v,
                source: undefined,
              }
            : v,
        ])
      ),
    };
    expect(simplifiedApp).toMatchSnapshot();
  });
});
