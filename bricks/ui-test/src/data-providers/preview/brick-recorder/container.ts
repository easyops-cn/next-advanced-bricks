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
};

export const containerBricks = Object.keys(containerBricksMap);

export const extraContainerBricksRecorderSelectors: string[] = [];

export const containerBricksRecordersHandler =
  createBrickEvtHandler(containerBricksMap);
