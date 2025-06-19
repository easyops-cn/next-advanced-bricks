// istanbul ignore file
import * as t from "@babel/types";
import { generateCodeText } from "../recorder";
import { BrickEvtMapField } from "../interfaces";
import {
  generateBaseStep,
  generateBrickInputStep,
  createBrickEvtHandler,
} from "../utils";

interface OptionItem {
  label: string;
  value: unknown;
}

const formBricksMap: BrickEvtMapField = {
  "forms.general-select": {
    "general.select.change.v2": (event: CustomEvent<OptionItem>) => {
      const expr =
        event.detail === null
          ? t.callExpression(t.identifier("brick_clear"), [])
          : t.callExpression(t.identifier("brick_clickItem"), [
              t.stringLiteral(event.detail.label),
            ]);
      const text = generateCodeText(expr);

      generateBaseStep(event, text);
    },
  },
  "forms.general-input": {
    "general.input.change": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);
      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.input.change",
      });
    },
  },
  "forms.general-textarea": {
    "general.textarea.change": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);
      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.textarea.change",
      });
    },
  },
  "forms.general-switch": {
    "general.switch.change": (event: CustomEvent<boolean>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "forms.general-auto-complete": {
    "general.auto-complete.change": (event: CustomEvent<string>) => {
      const expr =
        event.detail === null
          ? t.callExpression(t.identifier("brick_clear"), [])
          : t.callExpression(t.identifier("brick_type"), [
              t.stringLiteral(event.detail),
            ]);
      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.auto-complete.change",
      });
    },
  },
  "forms.general-input-number": {
    "general.input.change": (event: CustomEvent<number>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.numericLiteral(event.detail),
      ]);

      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.input.change",
      });
    },
  },
  "forms.general-radio": {
    "general.radio.change.v2": (event: CustomEvent<OptionItem>) => {
      const expr = t.callExpression(t.identifier("brick_clickItem"), [
        t.stringLiteral(event.detail.label),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "forms.general-date-picker": {
    "general.date.change": (event: CustomEvent<string>) => {
      const expr =
        event.detail === null
          ? t.callExpression(t.identifier("brick_clear"), [])
          : t.callExpression(t.identifier("brick_type"), [
              t.stringLiteral(event.detail),
            ]);
      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.date.change",
      });
    },
  },
  "forms.time-range-picker": {
    "time.range.change": (
      event: CustomEvent<{ startTime: string; endTime: string }>
    ) => {
      [event.detail.startTime, event.detail.endTime].forEach((time, index) => {
        const typeLiteral = t.stringLiteral(index === 0 ? "start" : "end");
        const expr = time
          ? t.callExpression(t.identifier("brick_type"), [
              typeLiteral,
              t.stringLiteral(time),
            ])
          : t.callExpression(t.identifier("brick_clear"), [typeLiteral]);

        const text = generateCodeText(expr);

        generateBaseStep(event, text);
      });
    },
  },
  "forms.input-with-unit": {
    "general.input-with-unit.change": (event: CustomEvent<number>) => {
      const expr =
        event.detail === null
          ? t.callExpression(t.identifier("brick_clear"), [])
          : t.callExpression(t.identifier("brick_type"), [
              t.numericLiteral(event.detail),
            ]);
      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.input-with-unit.change",
      });
    },
  },
  "forms.general-checkbox": {
    "general.checkbox.change.v2": (event: CustomEvent<OptionItem[]>) => {
      event.detail?.forEach((item) => {
        const expr = t.callExpression(t.identifier("brick_clickItem"), [
          t.stringLiteral(item.label),
        ]);
        const text = generateCodeText(expr);
        generateBaseStep(event, text);
      });
    },
  },
};

export const formsBricks = Object.keys(formBricksMap);

export const extraFormsRecorderSelectors: string[] = [".ant-select-dropdown"];

// 监听的构件事件，同一个事件会对应不同构件
export const formsRecordersHandler = createBrickEvtHandler(formBricksMap);
