// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import webpack from "webpack";
// import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import _ from "lodash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const monacoEditorPath = path.resolve(
  require.resolve("monaco-editor/package.json"),
  ".."
);
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
      generator: {
        filename: "[name].[hash][ext]",
      },
    },
    {
      resourceQuery: /raw/,
      type: "asset/resource",
    },
  ],
  resolve: {
    fallback: {
      path: false,
    },
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      new RegExp(`^${_.escapeRegExp(originalFilePath)}$`),
      // Refactor without 'd' flag of RegExp
      path.resolve(__dirname, "src/replaces/findSectionHeaders.js")
    ),
  ],
};
