// @ts-check
/** @type {import("@next-core/build-next-bricks").BuildNextBricksConfig} */
export default {
  svgAsReactComponent: true,
  resolve: {
    alias: {
      "@rc-component/trigger": "@easyops-cn/rc-trigger",
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](?:@next-core[\\/](?:react-(?:element|runtime))|(?:react(?:-dom)?|scheduler))[\\/]/,
          priority: -10,
          name: "react",
        },
        default: {
          minChunks: 2,
          priority: -20,
        },
      },
    },
  },
};
