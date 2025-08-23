import { describe, test, expect } from "@jest/globals";
import * as monaco from "monaco-editor";
import {
  getBrickYamlBuiltInDeclare,
  getEmbeddedJavascriptUri,
} from "./jsSuggestInBrickYaml.js";

jest.mock("monaco-editor");

describe("jsSuggestInBrickYaml", () => {
  describe("getBrickYamlBuiltInDeclare", () => {
    test("should work", () => {
      expect(getBrickYamlBuiltInDeclare()).toContain("const homepage: string");
    });
  });

  describe("getEmbeddedJavascriptUri", () => {
    jest
      .spyOn(monaco.Uri, "parse")
      .mockImplementation((args) => ({ path: args }) as monaco.Uri);
    test.each([
      [
        {
          uri: {
            toString: (): string => "model/1",
          },
        },
        { path: "model/1.ts" },
      ],
    ])("should work", (value, result) => {
      expect(
        getEmbeddedJavascriptUri((value as monaco.editor.IModel).uri)
      ).toEqual(result);
    });
  });
});
