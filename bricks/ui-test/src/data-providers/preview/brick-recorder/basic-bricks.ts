// istanbul ignore file
import * as t from "@babel/types";
import { generateCodeText } from "../recorder";
import { generateBaseStep, createBrickEvtHandler } from "../utils";

const basicBricksMap = {
  "basic-bricks.general-button": {
    "general.button.click": (event: CustomEvent<any>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const basicBricks = Object.keys(basicBricksMap);

export const extraBasicBricksRecorderSelectors: string[] = [];

export const basicBricksRecordersHandler =
  createBrickEvtHandler(basicBricksMap);
