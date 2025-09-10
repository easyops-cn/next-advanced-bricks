import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import lightPlus from "@shikijs/themes/light-plus";
import darkPlus from "@shikijs/themes/dark-plus";
import json from "@shikijs/langs/json";
import javascript from "@shikijs/langs/javascript";
import typescript from "@shikijs/langs/typescript";
import html from "@shikijs/langs/html";
import htmlDerivative from "@shikijs/langs/html-derivative";
import xml from "@shikijs/langs/xml";
import css from "@shikijs/langs/css";
import markdown from "@shikijs/langs/markdown";
import mermaid from "@shikijs/langs/mermaid";
import jsx from "@shikijs/langs/jsx";
import tsx from "@shikijs/langs/tsx";
import shellscript from "@shikijs/langs/shellscript";
import python from "@shikijs/langs/python";
import go from "@shikijs/langs/go";
import sql from "@shikijs/langs/sql";
import shikiWasm from "shiki/wasm";

export const highlighter = await createHighlighterCore({
  themes: [lightPlus, darkPlus],
  langs: [
    json,
    javascript,
    typescript,
    jsx,
    tsx,
    html,
    htmlDerivative,
    xml,
    css,
    markdown,
    mermaid,
    shellscript,
    python,
    go,
    sql,
  ],
  engine: createOnigurumaEngine(shikiWasm),
});
