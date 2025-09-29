import webpack from "webpack";

// @ts-check
/** @type {import("@next-core/build-next-bricks").BuildNextBricksConfig} */
export default {
  oneOfRulesForBabel: [
    {
      test: /\.[tj]sx?$/,
      resourceQuery: /raw/,
      type: "asset/source",
    },
  ],
  moduleRules: [
    {
      test: /\.txt$/,
      type: "asset/source",
    },
    {
      exclude: /\.[tj]sx?$/,
      resourceQuery: /raw/,
      type: "asset/source",
    },
  ],
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
