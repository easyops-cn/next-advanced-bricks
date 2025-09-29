// @ts-check
/** @type {import("@next-core/test-next").TestNextConfig} */
export default {
  moduleNameMapper: {
    "\\.txt\\?raw$": `<rootDir>/../../jest/__mocks__/js-raw.js`,
  },
};
