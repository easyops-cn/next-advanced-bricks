import {
  brickEvtHandler,
  createBrickEvtHandler,
  generateBaseStep,
  generateBrickInputStep,
} from "./utils";
import { recordContext } from "./RecordContext";
import { getTagName, getPossibleTargets } from "./inspector";
jest.mock("./inspector");

describe("createBrickEvtHandler processor", () => {
  it("brickEvtHandler", () => {
    const mockHandler = jest.fn();
    (getTagName as jest.Mock).mockReturnValueOnce("forms.general.text");
    const options = {
      brickEvtName: "input.change",
      brickEvtMap: {
        "forms.general.input": {
          "input.change": mockHandler,
        },
      },
    };
    brickEvtHandler(
      new CustomEvent("forms.general.text", { detail: "" }),
      options
    );
    expect(mockHandler).not.toHaveBeenCalled();
    (getTagName as jest.Mock).mockReturnValueOnce("forms.general.input");
    brickEvtHandler(
      new CustomEvent("forms.general.input", { detail: "" }),
      options
    );
    expect(mockHandler).toHaveBeenCalled();
  });
  it("createBrickEvtHandler should work ", () => {
    const mockHandler = jest.fn();
    const formBricksMap = {
      "forms.general-input": {
        "input.change": mockHandler,
      },
    };
    const handlers = createBrickEvtHandler(formBricksMap);
    expect(handlers).toMatchObject({ "input.change": expect.any(Function) });
  });
});

describe("generateBaseStep should work", () => {
  beforeEach(() => {
    recordContext.clearSteps();
  });

  it("should add step", () => {
    (getTagName as jest.Mock).mockReturnValueOnce("forms.general.text");
    (getPossibleTargets as jest.Mock).mockReturnValueOnce([
      [
        [
          {
            type: "css-selector",
            value: ".test-selector",
            tag: undefined,
          },
        ],
      ],
    ]);

    const event = {
      target: { tagName: "div" },
      composedPath: () => [{ tagName: "div" }],
    } as any;
    generateBaseStep(event, "test code");
    const steps = recordContext.getSteps();
    expect(steps.length).toBe(1);
    expect(steps[0].text).toBe("test code");
    expect(steps[0].event).toBe("code");
  });
});

describe("generateBrickInputStep", () => {
  beforeEach(() => {
    recordContext.clearSteps();
    recordContext.brickEvtStepCache.clear();
  });

  it("应向recordContext添加新步骤", () => {
    (getTagName as jest.Mock).mockReturnValueOnce("forms.general.text");

    (getPossibleTargets as jest.Mock).mockReturnValueOnce([
      [
        [
          {
            type: "css-selector",
            value: ".test-selector",
            tag: undefined,
          },
        ],
      ],
    ]);

    const event = {
      target: { tagName: "input" },
      composedPath: () => [{ tagName: "input" }],
    } as any;
    generateBrickInputStep(event, "input code", {
      brickEvtName: "input.change",
    });
    const steps = recordContext.getSteps();
    expect(steps.length).toBe(1);
    expect(steps[0].text).toBe("input code");
  });
});
