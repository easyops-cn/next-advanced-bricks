// @ts-check
import webpack from "webpack";

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
      test: /\.md$/,
      type: "asset/source",
    },
    {
      exclude: /\.[tj]sx?$/,
      resourceQuery: /raw/,
      type: "asset/source",
    },
  ],
  plugins: [
    new webpack.DefinePlugin({
      "process.env.BABEL_8_BREAKING": JSON.stringify(false),
      "process.env.BABEL_TYPES_8_BREAKING": JSON.stringify(false),
      "process.env.DEBUG": JSON.stringify(false),
    }),
  ],
};
