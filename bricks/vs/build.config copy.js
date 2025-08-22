// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import webpack from "webpack";
// import CopyWebpackPlugin from "copy-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import _ from "lodash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const monacoEditorPath = path.resolve(require.resolve("monaco-editor/package.json"), "..");
const originalFilePath = path.join(
  monacoEditorPath,
  "esm/vs/editor/common/services/findSectionHeaders.js"
);

/** @type {import("@next-core/build-next-bricks").BuildNextBricksConfig} */
export default {
  moduleRules: [
    {
      // This file contains static initialization blocks which are not supported until Chrome 94
      test: /[\\/]node_modules[\\/]monaco-editor[\\/]esm[\\/]vs[\\/]language[\\/]typescript[\\/]tsMode\.js$/,
      loader: "babel-loader",
      options: {
        rootMode: "upward",
      },
    },
    {
      test: /\.txt$/,
      type: "asset/source",
    },
    {
      test: /\.wasm$/,
      type: "asset/resource",
    },
    {
      test: /\.ttf$/,
      type: "asset/resource",
    },
    {
      resourceQuery: /raw/,
      type: "asset/resource",
    },
  ],
  resolve: {
    fallback: {
      "path": false,
    }
  },
  entry: {
    main: "./src/index",
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: [
        // "javascript",
        // "typescript",
        // "json",
        // "shell",
        // "powershell",
        // "yaml",
        // "markdown",
        // "python",
        // "java",
        // "xml",
        // "mysql",
        // "go",
      ],
      // features: [
      //   // "!accessibilityHelp",
      //   "!codelens",
      //   "!colorPicker",
      //   "!documentSymbols",
      //   "!fontZoom",
      //   "!iPadShowKeyboard",
      //   "!inspectTokens",
      // ],
      // filename: `workers/[name].${
      //   process.env.NODE_ENV === "development" ? "bundle" : "[contenthash:8]"
      // }.worker.js`,
    }),
    new webpack.NormalModuleReplacementPlugin(
      new RegExp(`^${_.escapeRegExp(originalFilePath)}$`),
      // Refactor without 'd' flag of RegExp
      path.resolve(__dirname, "src/replaces/findSectionHeaders.js")
    ),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       context: monacoEditorPath,
    //       from: "min/vs/language/typescript/ts.worker.js",
    //       to: "workers",
    //     },
    //     {
    //       context: monacoEditorPath,
    //       from: "min/vs/editor/editor.worker.js",
    //       to: "workers",
    //     },
    //   ],
    // }),
  ],
};
