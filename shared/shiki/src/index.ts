// istanbul ignore file

/*
npx shiki-codegen \
  --langs json,javascript,typescript,html,html-derivative,xml,css,markdown,mermaid,jsx,tsx,shellscript,python,go,sql \
  --themes light-plus,dark-plus \
  --engine oniguruma \
  ./shared/shiki/src/bundle.ts
*/

import lightPlus from "@shikijs/themes/light-plus";
import darkPlus from "@shikijs/themes/dark-plus";

/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  HighlighterGeneric,
  ThemeInput,
} from "@shikijs/types";
import {
  createSingletonShorthands,
  createdBundledHighlighter,
} from "@shikijs/core";
import { createOnigurumaEngine } from "@shikijs/engine-oniguruma";

type BundledLanguage =
  | "json"
  | "javascript"
  | "js"
  | "typescript"
  | "ts"
  | "html"
  | "html-derivative"
  | "xml"
  | "css"
  | "markdown"
  | "md"
  | "mermaid"
  | "mmd"
  | "jsx"
  | "tsx"
  | "shellscript"
  | "bash"
  | "sh"
  | "shell"
  | "zsh"
  | "python"
  | "py"
  | "go"
  | "sql";
type BundledTheme = "light-plus" | "dark-plus";
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const bundledLanguages = {
  json: () => import("@shikijs/langs/json"),
  javascript: () => import("@shikijs/langs/javascript"),
  js: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  ts: () => import("@shikijs/langs/typescript"),
  html: () => import("@shikijs/langs/html"),
  "html-derivative": () => import("@shikijs/langs/html-derivative"),
  xml: () => import("@shikijs/langs/xml"),
  css: () => import("@shikijs/langs/css"),
  markdown: () => import("@shikijs/langs/markdown"),
  md: () => import("@shikijs/langs/markdown"),
  mermaid: () => import("@shikijs/langs/mermaid"),
  mmd: () => import("@shikijs/langs/mermaid"),
  jsx: () => import("@shikijs/langs/jsx"),
  tsx: () => import("@shikijs/langs/tsx"),
  shellscript: () => import("@shikijs/langs/shellscript"),
  bash: () => import("@shikijs/langs/shellscript"),
  sh: () => import("@shikijs/langs/shellscript"),
  shell: () => import("@shikijs/langs/shellscript"),
  zsh: () => import("@shikijs/langs/shellscript"),
  python: () => import("@shikijs/langs/python"),
  py: () => import("@shikijs/langs/python"),
  go: () => import("@shikijs/langs/go"),
  sql: () => import("@shikijs/langs/sql"),
  yaml: () => import("@shikijs/langs/yaml"),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>;

const bundledThemes = {
  "light-plus": lightPlus,
  "dark-plus": darkPlus,
} as Record<BundledTheme, ThemeInput>;

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createOnigurumaEngine(import("shiki/wasm")),
});

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter,
  {
    guessEmbeddedLanguages(code, lang) {
      if (lang === "markdown" || lang === "md") {
        return ["mermaid"];
      }
    },
  }
);

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  getLastGrammarState,
  getSingletonHighlighter,
};
export type { BundledLanguage, BundledTheme, Highlighter };
