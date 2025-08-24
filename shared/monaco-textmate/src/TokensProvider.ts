import * as monaco from "monaco-editor";
import * as vsctm from "vscode-textmate";
import { loadWASM, OnigScanner, OnigString } from "vscode-oniguruma";
import wasm from "vscode-oniguruma/release/onig.wasm";
import { registerBrickNextYaml } from "./brick_next_yaml.js";

const languageToScope = new Map();
languageToScope.set("javascript", "source.js.jsx");
languageToScope.set("typescript", "source.tsx");
languageToScope.set("html", "text.html.basic");
languageToScope.set("markdown", "text.html.markdown");
languageToScope.set("xml", "text.xml");
languageToScope.set("css", "source.css");
languageToScope.set("json", "source.json");
languageToScope.set("python", "source.python");
languageToScope.set("go", "source.go");
languageToScope.set("java", "source.java");
languageToScope.set("shell", "source.shell");
languageToScope.set("powershell", "source.powershell");
languageToScope.set("yaml", "source.yaml");
languageToScope.set("brick_next_yaml", "source.brick_next_yaml");

registerBrickNextYaml(monaco);

const grammars = new Map([
  ["source.js", "JavaScript.tmLanguage"],
  ["source.js.jsx", "JavaScriptReact.tmLanguage"],
  ["source.ts", "TypeScript.tmLanguage"],
  ["source.tsx", "TypeScriptReact.tmLanguage"],
  ["text.html.basic", "html.tmLanguage"],
  ["text.html.derivative", "html-derivative.tmLanguage"],
  ["text.html.markdown", "markdown.tmLanguage"],
  ["text.xml", "xml.tmLanguage"],
  ["source.css", "css.tmLanguage"],
  ["source.json", "JSON.tmLanguage"],
  ["source.python", "MagicPython.tmLanguage"],
  ["source.go", "go.tmLanguage"],
  ["source.java", "java.tmLanguage"],
  ["source.shell", "shell-unix-bash.tmLanguage"],
  ["source.powershell", "powershell.tmLanguage"],
  ["source.yaml", "yaml.tmLanguage"],
  ["source.yaml.1.0", "yaml-1.0.tmLanguage"],
  ["source.yaml.1.1", "yaml-1.1.tmLanguage"],
  ["source.yaml.1.2", "yaml-1.2.tmLanguage"],
  ["source.yaml.1.3", "yaml-1.3.tmLanguage"],
  ["source.yaml.embedded", "yaml-embedded.tmLanguage"],
  ["source.brick_next_yaml", "yaml.tmLanguage"],
  ["placeholder.injection.string.unquoted", "brick-next/injection-unquoted"],
  [
    "placeholder.injection.string.quoted.double",
    "brick-next/injection-quoted-double",
  ],
  [
    "placeholder.injection.string.quoted.single",
    "brick-next/injection-quoted-single",
  ],
  ["builtin.entity.injection.string", "brick-next/builtin-entity"],
]);

const wasmPromise = fetch(wasm)
  .then((response) => response.arrayBuffer())
  .then((buffer) => loadWASM({ data: buffer }));

const registry = new vsctm.Registry({
  onigLib: wasmPromise.then(() => {
    return {
      createOnigScanner: (sources) => new OnigScanner(sources),
      createOnigString: (str) => new OnigString(str),
    };
  }),
  async loadGrammar(scopeName) {
    const grammarFile = grammars.get(scopeName);
    if (grammarFile) {
      const grammar = (await import(`./grammars/${grammarFile}.json`)).default;
      if (scopeName === "source.brick_next_yaml") {
        return {
          ...grammar,
          scopeName,
        };
      }
      return grammar;
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`No grammar found for scope: ${scopeName}`);
    }
    return null;
  },
  getInjections(scopeName) {
    if (scopeName === "source.brick_next_yaml") {
      return [
        "placeholder.injection.string.unquoted",
        "placeholder.injection.string.quoted.double",
        "placeholder.injection.string.quoted.single",
        "builtin.entity.injection.string",
      ];
    }
    return [];
  },
});

const providers = new Map<string, Promise<monaco.languages.TokensProvider>>();

const initializedLanguages = new Set<string>();

export function initializeTokensProvider(language: string) {
  if (initializedLanguages.has(language)) {
    return;
  }
  initializedLanguages.add(language);

  const scopeName = languageToScope.get(language);
  if (scopeName) {
    monaco.languages.setTokensProvider(
      language,
      createTokensProvider(scopeName)
    );
  }
}

function createTokensProvider(
  scopeName: string
): Promise<monaco.languages.TokensProvider> {
  let provider = providers.get(scopeName);
  if (!provider) {
    provider = doCreateTokensProvider(scopeName);
    providers.set(scopeName, provider);
  }
  return provider;
}

async function doCreateTokensProvider(
  scopeName: string
): Promise<monaco.languages.TokensProvider> {
  const grammar = await registry.loadGrammar(scopeName);
  if (!grammar) {
    throw new Error("Failed to load grammar");
  }
  return {
    getInitialState() {
      return vsctm.INITIAL;
    },
    tokenize(line, state: vsctm.StateStack) {
      const lineTokens = grammar.tokenizeLine(line, state);
      const tokens: monaco.languages.IToken[] = [];
      for (const token of lineTokens.tokens) {
        tokens.push({
          startIndex: token.startIndex,
          // Monaco doesn't support an array of scopes
          scopes: token.scopes[token.scopes.length - 1],
        });
      }
      return { tokens, endState: lineTokens.ruleStack };
    },
  };
}
