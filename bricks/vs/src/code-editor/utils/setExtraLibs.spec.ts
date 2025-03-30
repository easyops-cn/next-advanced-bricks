import { setExtraLibs } from "./setExtraLibs.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

// Mock monaco
jest.mock("monaco-editor/esm/vs/editor/editor.api.js", () => {
  const Uri = {
    file: (path: string) => ({
      toString: () => `file://${path}`,
    }),
  };

  const addExtraLibMock = jest.fn().mockReturnValue({ dispose: jest.fn() });

  const languages = {
    typescript: {
      javascriptDefaults: {
        addExtraLib: addExtraLibMock,
      },
      typescriptDefaults: {
        addExtraLib: addExtraLibMock,
      },
    },
  };

  return {
    Uri,
    languages,
  };
});

describe("setExtraLibs", () => {
  it("should dispose previous libs if they exist", () => {
    // Call once to set previousDisposables
    const libs = [
      { filePath: "test.d.ts", content: "declare const test: string;" },
    ];
    setExtraLibs(libs, { languageDefaults: "typescriptDefaults" });

    // Get the created disposable
    const disposeMock = (
      monaco.languages.typescript.typescriptDefaults.addExtraLib as any
    ).mock.results[0].value.dispose;

    // Call again to trigger dispose
    setExtraLibs([], { languageDefaults: "typescriptDefaults" });

    expect(disposeMock).toHaveBeenCalled();
  });

  it("should add extraLibs for typescript", () => {
    const libs = [
      { filePath: "test1.d.ts", content: "declare const test1: string;" },
      { filePath: "test2.d.ts", content: "declare const test2: number;" },
    ];

    setExtraLibs(libs, { languageDefaults: "typescriptDefaults" });

    expect(
      monaco.languages.typescript.typescriptDefaults.addExtraLib
    ).toHaveBeenCalledTimes(2);
    expect(
      monaco.languages.typescript.typescriptDefaults.addExtraLib
    ).toHaveBeenCalledWith(
      "declare const test1: string;",
      "file://libs/test1.d.ts"
    );
    expect(
      monaco.languages.typescript.typescriptDefaults.addExtraLib
    ).toHaveBeenCalledWith(
      "declare const test2: number;",
      "file://libs/test2.d.ts"
    );
  });

  it("should add extraLibs for javascript", () => {
    const libs = [{ filePath: "test.js", content: "const test = 'hello';" }];

    setExtraLibs(libs, { languageDefaults: "javascriptDefaults" });

    expect(
      monaco.languages.typescript.javascriptDefaults.addExtraLib
    ).toHaveBeenCalledWith("const test = 'hello';", "file://libs/test.js");
  });

  it("should handle undefined libs", () => {
    setExtraLibs(undefined, { languageDefaults: "typescriptDefaults" });

    expect(
      monaco.languages.typescript.typescriptDefaults.addExtraLib
    ).not.toHaveBeenCalled();
  });
});
