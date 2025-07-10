// istanbul ignore file
import * as t from "@babel/types";
import {
  generateBaseStep,
  createBrickEvtHandler,
  generateCodeText,
} from "../utils";

const containerBricksMap = {
  "container-brick.tabs-container": {
    "tab.select": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_clickItem"), [
        t.stringLiteral(event.detail),
        t.objectExpression([
          t.objectProperty(
            t.identifier("valueType"),
            t.stringLiteral("testId")
          ),
        ]),
      ]);

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "container-brick.form-steps": {
    "pre-step": (event: CustomEvent<{ fromStepIndex: number }>) => {
      const index = event.detail.fromStepIndex - 1;
      const expr = t.callExpression(
        t.memberExpression(
          t.callExpression(t.identifier("brick_clickItem"), [
            t.stringLiteral("#pre-btn"),
            t.objectExpression([
              t.objectProperty(
                t.identifier("valueType"),
                t.stringLiteral("cssSelector")
              ),
            ]),
          ]),
          t.identifier("brick_waitForAnimationEnd")
        ),
        [t.identifier(`${index}`)]
      );

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "next-step": (event: CustomEvent<{ fromStepIndex: number }>) => {
      const index = event.detail.fromStepIndex + 1;
      const expr = t.callExpression(
        t.memberExpression(
          t.callExpression(t.identifier("brick_clickItem"), [
            t.stringLiteral("#next-btn"),
            t.objectExpression([
              t.objectProperty(
                t.identifier("valueType"),
                t.stringLiteral("cssSelector")
              ),
            ]),
          ]),
          t.identifier("brick_waitForAnimationEnd")
        ),
        [t.identifier(`${index}`)]
      );

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "step.done": (event: CustomEvent<unknown>) => {
      const expr = t.callExpression(t.identifier("brick_clickItem"), [
        t.stringLiteral("#done-btn"),
        t.objectExpression([
          t.objectProperty(
            t.identifier("valueType"),
            t.stringLiteral("cssSelector")
          ),
        ]),
      ]);

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const containerBricks = Object.keys(containerBricksMap);

export const extraContainerBricksRecorderSelectors: string[] = [];

export const containerBricksRecordersHandler =
  createBrickEvtHandler(containerBricksMap);
