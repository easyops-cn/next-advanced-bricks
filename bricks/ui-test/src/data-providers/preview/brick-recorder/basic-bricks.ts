// istanbul ignore file
import * as t from "@babel/types";
import {
  generateBaseStep,
  createBrickEvtHandler,
  generateCodeText,
} from "../utils";

const basicBricksMap = {
  "basic-bricks.general-button": {
    "general.button.click": (event: CustomEvent<any>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "basic-bricks.general-modal": {
    "modal.open	": (event: CustomEvent<Record<string, string>>) => {
      const expr = t.callExpression(
        t.identifier("brick_waitForAnimationEnd"),
        []
      );
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "basic-bricks.general-modal.confirm": (
      event: CustomEvent<Record<string, string>>
    ) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("ok"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "basic-bricks.general-modal.cancel": (
      event: CustomEvent<Record<string, string>>
    ) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("cancel"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const basicBricks = Object.keys(basicBricksMap);

export const extraBasicBricksRecorderSelectors: string[] = [];

export const basicBricksRecordersHandler =
  createBrickEvtHandler(basicBricksMap);
