import { describe, expect } from "@jest/globals";
import { parseSuiteAst } from "./parseSuiteAst.js";
import { transformFromAst } from "@babel/standalone";
import * as t from "@babel/types";
import { NodeItem } from "../interface.js";

describe("parseSuiteAst", () => {
  it("should work", () => {
    const suiteData = {
      type: "suite",
      name: "create-new-route",
      label: "test login",
      params: null,
      children: [
        {
          type: "block",
          name: "describe",
          label: "test route create",
          params: null,
          flag: "only",
          appId: "cmdb",
          suiteName: "test-suite",
          children: [
            {
              type: "block",
              name: "it",
              label: "should work",
              params: null,
              children: [
                {
                  type: "command",
                  name: "get",
                  label: null,
                  params: ["#username"],
                  children: [
                    {
                      type: "command",
                      name: "type",
                      label: null,
                      params: ["easyops"],
                      children: [],
                    },
                  ],
                },
                {
                  type: "command",
                  name: "get",
                  label: null,
                  params: ["#password"],
                  children: [
                    {
                      type: "command",
                      name: "type",
                      label: null,
                      params: ["easyops"],
                      children: [],
                    },
                  ],
                },
                {
                  type: "command",
                  name: "get",
                  label: null,
                  params: ["提交"],
                  children: [
                    {
                      type: "command",
                      name: "click",
                      label: null,
                      params: [
                        {
                          force: true,
                        },
                      ],
                      children: [],
                    },
                  ],
                },
                {
                  type: "command",
                  name: "code",
                  label: null,
                  params: ['cy.get(".tips").should("have.class", "success")'],
                  children: [],
                },
                {
                  type: "command",
                  name: "get",
                  label: null,
                  params: [".tips"],
                  children: [
                    {
                      type: "command",
                      name: "should:include.text",
                      label: null,
                      params: ["成功"],
                      children: [],
                    },
                  ],
                },
              ],
            },
            {
              type: "block",
              name: "it",
              flag: "skip",
              label: "test",
              params: null,
              children: [
                {
                  type: "command",
                  name: "findByTestId",
                  label: null,
                  params: ["card-item"],
                  children: [
                    {
                      name: "code",
                      params: [],
                    },
                    {
                      name: "code",
                      params: ["find('.wrapper').find('.search')"],
                    },
                    {
                      name: "code",
                      params: ["then(() => {console.log('test code')})"],
                    },
                    {
                      type: "command",
                      name: "type",
                      label: null,
                      params: ["easyops"],
                    },
                    {
                      name: "code",
                      params: ["as('@input').click()"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "block",
          name: "describe",
          label: "includes tags",
          tags: ["@smokenull", "@cmdb"],
          creator: "easyops",
          children: [
            {
              type: "block",
              name: "code",
              label: null,
              params: ["const a = 'test'"],
            },
            {
              type: "block",
              name: "it",
              label: "should work",
              params: null,
              children: [
                {
                  type: "command",
                  name: "get",
                  label: null,
                  params: ["#username"],
                  children: [
                    {
                      type: "command",
                      name: "click",
                      label: null,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as any as NodeItem;

    const suiteAst = parseSuiteAst(suiteData);

    const program = t.program(suiteAst, undefined, "module");

    const generatedCode = transformFromAst(program, undefined, {}).code;

    expect(generatedCode).toMatchInlineSnapshot(`
"describe.only("cmdb@test-suite@test route create", () => {
  it("should work", () => {
    cy.get("#username").type("easyops");
    cy.get("#password").type("easyops");
    cy.get("提交").click({
      "force": true
    });
    cy.get(".tips").should("have.class", "success");
    cy.get(".tips").should("include.text", "成功");
  });
  it.skip("test", () => {
    cy.findByTestId("card-item").find('.wrapper').find('.search').then(() => {
      console.log('test code');
    }).type("easyops").as('@input').click();
  });
});
describe("includes tags", {
  tags: ["@smokenull", "@cmdb"],
  author: "easyops"
}, () => {
  const a = 'test';
  it("should work", () => {
    cy.get("#username").click();
  });
});"
`);
  });

  it("should throw error when the children of describe is not block or code", () => {
    const suiteData = {
      type: "suite",
      name: "create-new-route",
      label: "test login",
      params: null,
      children: [
        {
          type: "block",
          name: "describe",
          label: "test route create",
          params: null,
          children: [
            {
              type: "command",
              name: "get",
              label: null,
              params: ["#username"],
              children: [],
            },
          ],
        },
      ],
    } as any as NodeItem;

    expect(() => parseSuiteAst(suiteData)).toThrow(
      "The children of `describe` can only be `block` type (before, beforeEach, after, afterEach, it) or `code` type."
    );
  });
});
