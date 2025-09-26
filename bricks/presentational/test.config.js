// @ts-check
/** @type {import("@next-core/test-next").TestNextConfig} */
export default {
  transformModulePatterns: [
    "(?:hast|unist)-util-(?:[^/]+)/",
    "comma-separated-tokens/",
    "space-separated-tokens/",
    "devlop/",
    "estree-util-is-identifier-name/",
    "property-information/",
    "vfile-message/",
    "html-void-elements/",
    "zwitch/",
    "stringify-entities/",
    "character-entities-(?:[^/]+)/",
    "ccount/",
    "@shikijs/",
    "shiki/",
  ],
};
