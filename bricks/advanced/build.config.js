// @ts-check

import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";

/** @type {import("@next-core/build-next-bricks").BuildNextBricksConfig} */
export default {
  resolve: {
    alias: {
      "@rc-component/trigger": "@easyops-cn/rc-trigger",
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(
            "../../node_modules/pdfjs-dist/build/pdf.worker.min.js"
          ),
          to: "workers",
        },
      ],
    }),
  ],
};
