import { describe, test, expect } from "@jest/globals";
import { getUsageMemberStatistics } from "./get-usage-member-statistics.js";

describe("getUsageMemberStatistics", () => {
  test("should return empty arrays when no data provided", async () => {
    const result = await getUsageMemberStatistics(null, {});
    expect(result).toEqual({
      functions: [],
      menus: [],
    });
  });

  test("should collect FN calls from expressions", async () => {
    const storyboardData = {
      properties: {
        title: "<% FN.getTitle() %>",
        content: "<% FN.processData(FN.getData()) %>",
        computed: "<% FN.calculate() %>",
      },
      events: {
        click: {
          action: "console.log",
          args: ["<% FN.handleClick() %>"],
        },
      },
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions.sort()).toEqual([
      "calculate",
      "getData",
      "getTitle",
      "handleClick",
      "processData",
    ]);
    expect(result.menus).toEqual([]);
  });

  test("should collect APP.getMenu calls from expressions", async () => {
    const storyboardData = {
      properties: {
        mainMenu: "<% APP.getMenu('main-menu') %>",
        sidebar: "<% APP.getMenu('sidebar-menu') %>",
        footer: "<% APP.getMenu('footer-menu') %>",
      },
      slots: {
        nav: {
          bricks: [
            {
              properties: {
                menu: "<% APP.getMenu('nav-menu') %>",
              },
            },
          ],
        },
      },
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions).toEqual([]);
    expect(result.menus.sort()).toEqual([
      "footer-menu",
      "main-menu",
      "nav-menu",
      "sidebar-menu",
    ]);
  });

  test("should collect both FN calls and APP.getMenu calls", async () => {
    const storyboardData = {
      properties: {
        title: "<% FN.getTitle() %>",
        menu: "<% APP.getMenu('main-menu') %>",
        data: "<% FN.processData() %>",
        sidebar: "<% APP.getMenu('sidebar') %>",
      },
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions.sort()).toEqual(["getTitle", "processData"]);
    expect(result.menus.sort()).toEqual(["main-menu", "sidebar"]);
  });

  test("should handle string literal access FN['method']", async () => {
    const storyboardData = {
      properties: {
        dynamic: '<% FN["dynamicMethod"] %>',
        quoted: "<% FN['quotedMethod'] %>",
        normal: "<% FN.normalMethod() %>",
      },
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions.sort()).toEqual([
      "dynamicMethod",
      "normalMethod",
      "quotedMethod",
    ]);
  });

  test("should ignore non-expression strings", async () => {
    const storyboardData = {
      properties: {
        staticText: "FN.notAnExpression",
        plainText: "APP.getMenu is not called here",
        expression: "<% FN.realCall() %>",
        menu: "<% APP.getMenu('real-menu') %>",
      },
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions).toEqual(["realCall"]);
    expect(result.menus).toEqual(["real-menu"]);
  });

  test("should handle complex nested structures", async () => {
    const storyboardData = {
      routes: [
        {
          bricks: [
            {
              properties: {
                title: "<% FN.getPageTitle() %>",
              },
              slots: {
                content: {
                  bricks: [
                    {
                      properties: {
                        menu: "<% APP.getMenu('nested-menu') %>",
                        data: "<% FN.fetchData() %>",
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
    };

    const result = await getUsageMemberStatistics(storyboardData, {});
    expect(result.functions.sort()).toEqual(["fetchData", "getPageTitle"]);
    expect(result.menus).toEqual(["nested-menu"]);
  });

  test("should collect function dependencies when includesFnDeps is true", async () => {
    const storyboardData = {
      properties: {
        title: "<% FN.getTitle() %>",
        data: "<% FN.processData() %>",
      },
    };

    const fnList = [
      {
        name: "getTitle",
        source: `
          function getTitle() {
            return FN.formatTitle(FN.getRawTitle());
          }
        `,
      },
      {
        name: "processData",
        source: `
          function processData() {
            return FN.validateData(FN.fetchData());
          }
        `,
      },
      {
        name: "formatTitle",
        source: `
          function formatTitle(title) {
            return title.toUpperCase();
          }
        `,
      },
      {
        name: "getRawTitle",
        source: `
          function getRawTitle() {
            return "Raw Title";
          }
        `,
      },
    ];

    const result = await getUsageMemberStatistics(storyboardData, {
      includesFnDeps: true,
      fnList,
    });

    // Should include original functions + their dependencies
    expect(result.functions.sort()).toEqual([
      "fetchData", // dependency of processData
      "formatTitle", // dependency of getTitle
      "getRawTitle", // dependency of getTitle
      "getTitle", // original
      "processData", // original
      "validateData", // dependency of processData
    ]);
  });

  test("should handle functions without dependencies", async () => {
    const storyboardData = {
      properties: {
        simple: "<% FN.simpleFunction() %>",
      },
    };

    const fnList = [
      {
        name: "simpleFunction",
        source: `
          function simpleFunction() {
            return "simple result";
          }
        `,
      },
    ];

    const result = await getUsageMemberStatistics(storyboardData, {
      includesFnDeps: true,
      fnList,
    });

    expect(result.functions).toEqual(["simpleFunction"]);
  });

  test("should handle functions with self-reference (recursive)", async () => {
    const storyboardData = {
      properties: {
        recursive: "<% FN.factorial() %>",
      },
    };

    const fnList = [
      {
        name: "factorial",
        source: `
          function factorial(n) {
            if (n <= 1) return 1;
            return n * FN.factorial(n - 1);
          }
        `,
      },
    ];

    const result = await getUsageMemberStatistics(storyboardData, {
      includesFnDeps: true,
      fnList,
    });

    // Should exclude self-reference due to filter
    expect(result.functions).toEqual(["factorial"]);
  });

  test("should work without options parameter", async () => {
    const storyboardData = {
      properties: {
        title: "<% FN.getTitle() %>",
      },
    };

    const result = await getUsageMemberStatistics(storyboardData);
    expect(result.functions).toEqual(["getTitle"]);
    expect(result.menus).toEqual([]);
  });
});
