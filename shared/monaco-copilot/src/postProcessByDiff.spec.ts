import { postProcessByDiff } from "./postProcessByDiff";

describe("postProcessByDiff", () => {
  test.each(
    [
      ["empty start", "map()", "", "", "map()"],
      ["add new line", "abc:\n  map()", "abc:", "", "\n  map()"],
      ["add new line with a blank line", "map()", "", "", "map()"],
      [
        "change inline with whitespaces",
        "map( a => 1 )",
        "map( ",
        " )",
        "a => 1",
      ],
      [
        "change inline with whitespaces surrounding",
        "map( a => 1 )",
        " map( ",
        " )\n",
        "a => 1",
      ],
      [
        "change inline with whitespaces surrounding 2",
        "  map( a => 1 )",
        " map( ",
        " )\n",
        "a => 1",
      ],
      ["multi-line addition", "map(\n  a => 1\n)", "map(", ")", "\n  a => 1\n"],
      [
        "multi-line original source code",
        "map(\n  a => 1\n)",
        "# before omitted\nabc:\n  map(",
        ")\n# after omitted",
        "\n    a => 1\n  ",
      ],
      [
        "multi-line partial original source code",
        `map(
  a => 1 +
  2 +
  3 +
  4 +
  5 +
  6 +
  7
)
# after omitted`,
        "# before omitted\n# another before omitted\nabc:\n  map(",
        ")\n# after omitted\n# another after omitted",
        `
    a => 1 +
    2 +
    3 +
    4 +
    5 +
    6 +
    7
  `,
      ],
      [
        "multi-line original source code with insertion only",
        `
    a => 1 +
    2 +
    3 +
    4 +
    5 +
    6 +
    7
  `,
        "# before omitted\n# another before omitted\nabc:\n  map(",
        ")\n# after omitted\n# another after omitted",
        `a => 1 +
      2 +
      3 +
      4 +
      5 +
      6 +
      7
    `,
      ],
      [
        "multi-line original source code with lots of prefix and suffix",
        "map(\n  a => 1\n)",
        "# 1 omitted\n# 2 omitted\n# 3 omitted\nabc:\n  map(",
        ")\n# after 1 omitted\n# after 2 omitted\n# after 3 omitted",
        "\n    a => 1\n  ",
      ],
      [
        "multi-line original source code with unchanged",
        "# 3 omitted\nmap(\n  a => 1\n)\n# after 1 omitted",
        "# 1 omitted\n# 2 omitted\n# 3 omitted\nabc:\n  map(",
        ")\n# after 1 omitted\n# after 2 omitted\n# after 3 omitted",
        "\n    a => 1\n  ",
      ],
      [
        "added unrelated lines",
        "# before comment\n# unrelated\nabc: 123",
        "# before comment\nabc: ",
        "\n# after comment",
        "123",
      ],
      [
        "indentation",
        "name: tom\nage: 18\ngender: male",
        "  \tname: ",
        "\n  end",
        "tom\n  \tage: 18\n  \tgender: male",
      ],
      [
        "indentation started with blank line",
        `function refineMetricGroups(
  groups: Group[] | undefined,
  metrics: Metric[]
): Group[] | undefined {
  // 忽略指标数量不大于 1 的分组
  if (!groups || groups.length === 0) return [];

  const metricSet = new Set(metrics.map(metric => metric.name));

  return groups.filter(group => {
    const validMetricsCount = group.metrics.filter(metric => metricSet.has(metric)).length;
    return validMetricsCount >= 2;
  });
}`,
        `function refineMetricGroups(
  groups: Group[] | undefined,
  metrics: Metric[]
): Group[] | undefined {
  // 忽略指标数量不大于 1 的分组
  const metricSet = new Set(metrics.map(metric => metric.name));
  `,
        `
}

interface Group {
  group: string;
  metrics: string[];
}

interface Metric {
  name: string;
}`,
        `\n  return groups.filter(group => {
    const validMetricsCount = group.metrics.filter(metric => metricSet.has(metric)).length;
    return validMetricsCount >= 2;
  });`,
      ],
      [
        "insertion only",
        `{
  title: "路由",
  sort: 1,
},
_category_functions: {
  title: "函数",
  sort: 2,
},
_category_templates: {
  title: "模板",
  sort: 3,
},
_category_i18n: {
  title: "国际化",
  sort: 4,
},
_category_images: {
  title: "图片",
  sort: 5,
}`,
        `  let discussionsMap: Map<string, boolean> = new Map<string, boolean>();

  discussions?.forEach((d) => {
    discussionsMap[d.relatedInstanceId] =
      !!discussionsMap[d.relatedInstanceId] || d.resolved !== true;
  });
  const sortTreeNode = (i, j: any): number => {
    return (i.sort ?? 9999) - (j.sort ?? 9999);
  };

  const categoryMap: Record<string, any> = {
    _category_basic_info: {
      title: "基本信息",
      sort: 0,
    },
    _category_routes: {`,
        `
  };

  const iconsMap: Record<string, any> = {
    menus: {
      lib: "antd",
      icon: "unordered-list",
      theme: "outlined",
      color: "var(--theme-cyan-color)",
    },
    routes: {
      lib: "antd",
      icon: "copy",
      theme: "outlined",
      color: "var(--theme-cyan-color)",
    },
    functions: {
      lib: "antd",
      icon: "function",
      theme: "outlined",
      color: "var(--theme-cyan-color)",
    },
    templates: {
      lib: "easyops",
      category: "default",
      icon: "event-type",
      color: "var(--theme-cyan-color)",
    },
  };`,
        `{
      title: "路由",
      sort: 1,
    },
    _category_functions: {
      title: "函数",
      sort: 2,
    },
    _category_templates: {
      title: "模板",
      sort: 3,
    },
    _category_i18n: {
      title: "国际化",
      sort: 4,
    },
    _category_images: {
      title: "图片",
      sort: 5,
    }`,
      ],
      [
        "no indentation with insertion only",
        "123,\ndef: 456,",
        "x: 7,\ny: 8,\nz:,\nabc:",
        "\nr: 9,\ns: 0,\nt: 1",
        "123,\ndef: 456,",
      ],
    ]
    // .filter(([desc]) => desc.includes("(only)"))
  )("%s", (_desc, response, prefix, suffix, expected) => {
    // console.log(_desc);
    const result = postProcessByDiff(response, prefix, suffix);
    expect(result).toBe(expected);
  });
});
