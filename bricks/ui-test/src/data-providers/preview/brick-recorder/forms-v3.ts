// istanbul ignore file
import * as t from "@babel/types";
import { generateCodeText } from "../utils";
import { generateBaseStep, generateBrickInputStep } from "../utils";

export const formBricksV3Map = {
  "eo-input": {
    change: (event: CustomEvent<string>) => {
      handleInputChange(event, "change");
    },
  },
  "eo-textarea": {
    change: (event: CustomEvent<string>) => {
      handleInputChange(event, "change");
    },
  },
  "eo-select": {
    change: (
      event: CustomEvent<{
        value: string[];
        options: { label: string; value: string }[];
      }>
    ) => {
      let expr: t.Expression;
      if (event.detail.value?.length) {
        expr = t.callExpression(t.identifier("brick_fill"), [
          t.arrayExpression(
            event.detail.options.map((v) => t.stringLiteral(v.label))
          ),
        ]);
      } else {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      }

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "change",
      });
    },
  },
  "eo-submit-buttons": {
    submit: (event: CustomEvent<void>) => {
      handleSubmit(event, "ok");
    },
    cancel: (event: CustomEvent<void>) => {
      handleSubmit(event, "cancel");
    },
  },
};

export const formBricksV3 = Object.keys(formBricksV3Map);

export const extraFormBricksV3RecorderSelectors: string[] = [];

function handleInputChange(
  event: CustomEvent<string>,
  brickEvtName: string
): void {
  const expr = t.callExpression(t.identifier("brick_type"), [
    t.stringLiteral(event.detail),
  ]);
  const text = generateCodeText(expr);
  generateBrickInputStep(event, text, {
    brickEvtName,
  });
}

function handleSubmit(event: CustomEvent<void>, type: "ok" | "cancel"): void {
  const expr = t.callExpression(t.identifier("brick_click"), [
    t.stringLiteral(type),
  ]);
  const text = generateCodeText(expr);
  generateBaseStep(event, text);
}
