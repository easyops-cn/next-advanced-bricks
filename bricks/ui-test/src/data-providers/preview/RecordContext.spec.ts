import { RecordStep } from "./interfaces";
import { recordContext } from "./RecordContext";

describe("recordContext", () => {
  beforeEach(() => {
    recordContext.clearSteps();
    recordContext.brickEvtStepCache.clear();
  });

  it("add steps", () => {
    const step = {
      event: "click",
      targets: [
        [
          {
            type: "css-selector",
            value: ".test-selector",
            tag: undefined,
          },
        ],
      ],
    } as any as RecordStep;
    recordContext.addStep(step);
    const steps = recordContext.getSteps();
    expect(steps.length).toBe(1);
    expect(steps[0]).toEqual(step);
  });

  it("clear steps", () => {
    recordContext.addStep({
      event: "click",
      targets: [
        [
          {
            type: "css-selector",
            value: ".test-selector",
            tag: "div",
          },
        ],
      ],
    });
    recordContext.clearSteps();
    expect(recordContext.getSteps()).toEqual([]);
  });

  it("brickEvtStepCache", () => {
    const input = document.createElement("input");
    recordContext.brickEvtStepCache.set(input, {
      change: {
        event: "click",
        targets: [
          [
            {
              type: "css-selector",
              value: ".test-selector",
              tag: "div",
            },
          ],
        ],
      },
    });
    expect(recordContext.brickEvtStepCache.get(input)).toEqual({
      change: {
        event: "click",
        targets: [
          [{ tag: "div", type: "css-selector", value: ".test-selector" }],
        ],
      },
    });
    recordContext.brickEvtStepCache.clear();
    expect(recordContext.brickEvtStepCache.size).toBe(0);
  });
});
