import * as monaco from "monaco-editor";

const conf: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: "#",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    offSide: true,
  },
  onEnterRules: [
    {
      beforeText: /:\s*$/,
      action: {
        indentAction: monaco.languages.IndentAction.Indent,
      },
    },
  ],
};

/**
 * Register the extended yaml language, with Brick Next expression syntax
 * highlighting supported.
 */
export function registerBrickNextYaml(Monaco: typeof monaco) {
  Monaco.languages.register({
    id: "brick_next_yaml",
    extensions: [".yaml", ".yml"],
    mimetypes: ["application/x-yaml", "text/x-yaml"],
  });
  Monaco.languages.setLanguageConfiguration("brick_next_yaml", conf);
}
