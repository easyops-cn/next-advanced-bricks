import { postProcessByDiff } from "./postProcessByDiff";

describe("postProcessByDiff", () => {
  test.each(
    [
      ["empty start", "map()", "", "", "map()"],
      ["add new line", "abc:\n  map()", "abc:", "", "\n  map()"],
      [
        "add new line with a blank line (only)",
        "\n  map()",
        "\n",
        "",
        "  map()",
      ],
      ["added only with whitespace omitted", "map()", " ", " ", "map()"],
      [
        "change inline with whitespaces",
        " map( a => 1 ) ",
        " map( ",
        " )\t",
        "a => 1",
      ],
      [
        "change inline with whitespaces omitted",
        " map(a => 1) ",
        " map( ",
        " )\t",
        "a => 1",
      ],
      ["added only with whitespace merged", " map() ", " ", " ", "map()"],
      [
        "added only with whitespace merged variation",
        " map() ",
        "  ",
        " ",
        "map()",
      ],
      [
        "added only with whitespace merged variation",
        " map() ",
        " ",
        "  ",
        "map()",
      ],
      [
        "added only with whitespace merged variation",
        "  map() ",
        " ",
        " ",
        "map()",
      ],
      [
        "added only with whitespace merged variation",
        " map()  ",
        " ",
        " ",
        "map()",
      ],
      ["multi-line addition", "map(\n  a => 1\n)", "map(", ")", "\n  a => 1\n"],
      [
        "multi-line original source code",
        "map(\n    a => 1\n  )",
        "# before omitted\nabc:\n  map(",
        ")\n# after omitted",
        "\n    a => 1\n  ",
      ],
      [
        "multi-line original source code with lots of prefix and suffix",
        "map(\n    a => 1\n  )",
        "# 1 omitted\n# 2 omitted\n# 3 omitted\nabc:\n  map(",
        ")\n# after 1 omitted\n# after 2 omitted\n# after 3 omitted",
        "\n    a => 1\n  ",
      ],
      [
        "multi-line original source code with unchanged",
        "# 3 omitted\nmap(\n    a => 1\n  )\n# after 1 omitted",
        "# 1 omitted\n# 2 omitted\n# 3 omitted\nabc:\n  map(",
        ")\n# after 1 omitted\n# after 2 omitted\n# after 3 omitted",
        "\n    a => 1\n  ",
      ],
    ].filter(([desc]) => desc.includes("(only)"))
  )("%s", (_desc, response, prefix, suffix, expected) => {
    const result = postProcessByDiff(response, prefix, suffix);
    expect(result).toBe(expected);
  });
});
