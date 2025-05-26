import { describe, test, expect } from "@jest/globals";
import { getSourceCodeBySuites } from "./get-source-code-by-suites.js";
import { NodeItem } from "../interface.js";

describe("getSourceCodeBySuites", () => {
  test("should work", async () => {
    const suiteData = [
      {
        type: "suite",
        name: "new",
        label: "new",
        children: [
          {
            type: "block",
            name: "describe",
            label: "new",
            children: [
              {
                type: "block",
                name: "beforeEach",
                children: [
                  {
                    type: "command",
                    name: "setLanguage",
                    label: "test",
                    params: ["en"],
                    children: [],
                  },
                  {
                    type: "command",
                    name: "login",
                    children: [],
                  },
                ],
              },
              {
                type: "block",
                name: "it",
                label: "test",
                children: [
                  {
                    type: "command",
                    name: "get",
                    params: ["test"],
                    children: [
                      {
                        type: "command",
                        name: "should:be.empty",
                        children: [],
                      },
                      {
                        type: "command",
                        name: "contains",
                        params: ["test"],
                        children: [],
                      },
                    ],
                  },
                  {
                    type: "command",
                    name: "get",
                    params: ["test"],
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as NodeItem[];
    expect(await getSourceCodeBySuites(suiteData)).toMatchSnapshot();
  });
});
