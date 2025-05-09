import { describe, test, expect } from "@jest/globals";
import { lintYaml } from "./lintYaml";

describe("lintYaml", () => {
  test("plain with no expressions", async () => {
    const result = await lintYaml({
      source: "a",
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [],
    });
  });

  test("plain with not string value", async () => {
    const result = await lintYaml({
      source: "1",
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [],
    });
  });

  test("plain with correct expression", async () => {
    const result = await lintYaml({
      source: "<% a %>",
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [],
    });
  });

  test("plain with incorrect expression", async () => {
    const result = await lintYaml({
      source: "<% a. %>",
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 5,
          end: 6,
          message: "Unexpected token (1:2)",
          severity: "Error",
        },
      ],
      lintDecorations: [],
    });
  });

  test("block with CTX of links", async () => {
    const result = await lintYaml({
      source: "|\n  <%\n    STATE.b,\n    CTX.abc\n    %>\n",
      links: ["CTX"],
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [
        {
          start: 24,
          end: 31,
          options: {
            inlineClassName: "highlight",
          },
        },
      ],
    });
  });

  test("block with STATE of markers", async () => {
    const result = await lintYaml({
      source: "|-\n  <%\n    STATE.b,\n    CTX.abc\n    %>\n",
      markers: [
        {
          token: "STATE",
          // level: "warn",
          message: "No STATE here",
        },
      ],
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 12,
          end: 17,
          message: "No STATE here",
          severity: "Warning",
        },
      ],
      lintDecorations: [],
    });
  });

  test("single-quote with non-expressions", async () => {
    const result = await lintYaml({
      source: "'CTX.a'",
      links: ["CTX"],
      markers: [
        {
          token: "STATE",
          // level: "warn",
          message: "No STATE here",
        },
      ],
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [],
    });
  });

  test("single-quote with CTX", async () => {
    const result = await lintYaml({
      source: "'<% CTX(), CTX.b, STATE.c %>'",
      links: ["CTX"],
      markers: [
        {
          token: "STATE",
          // level: "warn",
          message: "No STATE here",
        },
      ],
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 18,
          end: 23,
          message: "No STATE here",
          severity: "Warning",
        },
      ],
      lintDecorations: [
        {
          start: 11,
          end: 16,
          options: {
            inlineClassName: "highlight",
          },
        },
      ],
    });
  });

  test("single-quote incorrect expression", async () => {
    const result = await lintYaml({
      source: "'<% CTX[''a''], CTX'' %>'",
      links: ["CTX"],
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 19,
          end: 21,
          message: "Unterminated string constant. (1:13)",
          severity: "Error",
        },
      ],
      lintDecorations: [],
    });
  });

  test("double-quote with CTX", async () => {
    const result = await lintYaml({
      source: '"<% CTX[\\"a\\"], CTX.b, CTX[\\"c\\"] %>"',
      links: ["CTX"],
    });
    expect(result).toEqual({
      lintMarkers: [],
      lintDecorations: [
        {
          start: 16,
          end: 21,
          options: {
            inlineClassName: "highlight",
          },
        },
      ],
    });
  });

  test("double-quote incorrect expression", async () => {
    const result = await lintYaml({
      source: '"<% CTX[\\"a\\"], CTX) %>"',
      links: ["CTX"],
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 19,
          end: 20,
          message: "Unexpected token (1:13)",
          severity: "Error",
        },
      ],
      lintDecorations: [],
    });
  });

  test("forgot to quote expression which contains a colon", async () => {
    const result = await lintYaml({
      source: " <%= a ? b : c %>\n\n",
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 1,
          end: 4,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
        {
          start: 11,
          end: 12,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
        {
          start: 15,
          end: 17,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
      ],
      lintDecorations: [],
    });
  });

  test("forgot to quote expression which contains a colon and line breaks", async () => {
    const result = await lintYaml({
      source: " <%= a ? b :\n  c %>\n\n",
    });
    expect(result).toEqual({
      lintMarkers: [
        {
          start: 1,
          end: 4,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
        {
          start: 11,
          end: 12,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
        {
          start: 17,
          end: 19,
          message:
            "You need to quote the expression when it contains a colon ':'",
          severity: "Warning",
        },
      ],
      lintDecorations: [],
    });
  });
});
