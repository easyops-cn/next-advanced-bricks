// 在构建时预生成词汇表。
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const dictDir = path.join(
  require.resolve("typo-js/package.json"),
  "../dictionaries/en_US"
);
const dictTargetPath = path.join(__dirname, "../src/generated-dictionary.js");

const [aff, dic] = await Promise.all(
  ["aff", "dic"].map((ext) =>
    readFile(path.join(dictDir, `en_US.${ext}`), "utf-8")
  )
);

await writeFile(
  dictTargetPath,
  [
    `export const aff = ${JSON.stringify(aff)};`,
    `export const dic = ${JSON.stringify(dic)};`,
  ].join("\n")
);
