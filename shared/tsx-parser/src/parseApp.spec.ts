import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseApp } from "./parseApp.js";

describe("parseApp", () => {
  test("should work", async () => {
    const fileMap = new Map([
      ["/index.tsx", "app/index.txt"],
      ["/Pages/Layout.tsx", "app/Pages/Layout.txt"],
      ["/Pages/Layout.css", "app/Pages/Layout.css"],
      ["/Pages/Home.tsx", "app/Pages/Home.txt"],
      ["/Pages/About.tsx", "app/Pages/About.txt"],
      ["/Pages/Page404.tsx", "app/Pages/Page404.txt"],
      ["/Contexts/LayoutContext.ts", "app/Contexts/LayoutContext.txt"],
    ]);

    const files = await Promise.all(
      [...fileMap].map(async ([filePath, fixturePath]) => {
        const content = await readFile(
          path.join(__dirname, "./__fixtures__/", fixturePath),
          "utf-8"
        );
        return {
          filePath,
          content,
        };
      })
    );

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
