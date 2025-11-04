// istanbul ignore file
import * as t from "@babel/types";
import { generateCodeText } from "../utils";
import { BrickEvtMapField } from "../interfaces";
import type { MenuIcon } from "@next-shared/general/types";
import { compact, castArray, get } from "lodash";
import { generateBaseStep, generateBrickInputStep } from "../utils";

interface OptionItem {
  label: string;
  value: unknown;
}

interface CmdbInstanceSelectOption {
  label: string | string[];
  value: unknown;
}

export const formBricksMap: BrickEvtMapField = {
  "forms.general-select": {
    "general.select.change.v2": (
      event: CustomEvent<OptionItem | OptionItem[]>
    ) => {
      let expr: t.Expression;
      const options = compact(castArray(event.detail));

      if (!options?.length) {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      } else {
        expr = t.callExpression(t.identifier("brick_fill"), [
          t.arrayExpression(options.map((item) => t.stringLiteral(item.label))),
        ]);
      }

      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "general.select.change.v2",
      });
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
      const expr = !event.detail
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
      const expr = !event.detail
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
      const { startTime, endTime } = event.detail;

      const baseExpr = startTime
        ? t.callExpression(t.identifier("brick_type"), [
            t.stringLiteral("start"),
            t.stringLiteral(`${startTime}{enter}`),
            t.objectExpression([
              t.objectProperty(
                t.identifier("clearBeforeInput"),
                t.booleanLiteral(true)
              ),
            ]),
          ])
        : t.callExpression(t.identifier("brick_clear"), [
            t.stringLiteral("start"),
          ]);

      const expr = t.callExpression(
        t.memberExpression(
          baseExpr,
          t.identifier(endTime ? "brick_type" : "brick_clear")
        ),
        endTime
          ? [
              t.stringLiteral("end"),
              t.stringLiteral(`${endTime}{enter}`),
              t.objectExpression([
                t.objectProperty(
                  t.identifier("clearBeforeInput"),
                  t.booleanLiteral(true)
                ),
              ]),
            ]
          : [t.stringLiteral("end")]
      );

      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "time.range.change",
      });
    },
  },
  "forms.input-with-unit": {
    "general.input-with-unit.change": (event: CustomEvent<number>) => {
      const expr = !event.detail
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
      let expr: t.Expression | undefined;
      if (event.detail?.length) {
        event.detail.forEach((item, index) => {
          if (index === 0) {
            expr = t.callExpression(t.identifier("brick_clickItem"), [
              t.stringLiteral(item.label),
            ]);
          } else {
            expr = t.callExpression(
              t.memberExpression(expr!, t.identifier("brick_clickItem")),
              [t.stringLiteral(item.label)]
            );
          }
        });
      } else {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      }

      if (expr) {
        const text = generateCodeText(expr);

        generateBrickInputStep(event, text, {
          brickEvtName: "general.checkbox.change.v2",
        });
      }
    },
  },
  "forms.dynamic-form-item-v2": {
    "item.change": (event: CustomEvent<unknown[]>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.objectExpression([
          t.objectProperty(t.identifier("type"), t.stringLiteral("jsonStr")),
          t.objectProperty(
            t.identifier("value"),
            t.stringLiteral(JSON.stringify(event.detail))
          ),
        ]),
      ]);

      const text = generateCodeText(expr);

      generateBrickInputStep(event, text, {
        brickEvtName: "item.change",
      });
    },
  },
  "forms.general-buttons": {
    "submit.button.click": (event: CustomEvent<null>) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("submit"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "cancel.button.click": (event: CustomEvent<null>) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("cancel"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "forms.general-time-picker": {
    "general.time.change": (event: CustomEvent<string>) => {
      const expr = !event.detail
        ? t.callExpression(t.identifier("brick_clear"), [])
        : t.callExpression(t.identifier("brick_type"), [
            t.stringLiteral(event.detail),
          ]);
      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "general.time.change",
      });
    },
  },
  "forms.icon-select": {
    "icon.change": (event: CustomEvent<MenuIcon>) => {
      const expr = t.callExpression(t.identifier("brick_fill"), [
        t.objectExpression(
          Object.entries(event.detail)
            .filter(([, v]) => !!v)
            .map(([key, v]) =>
              t.objectProperty(t.identifier(key), t.stringLiteral(v as string))
            )
        ),
      ]);
      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "icon.change",
      });
    },
  },
  "forms.crontab-input": {
    "crontab.change": (event: CustomEvent<string>) => {
      const fieldValues = event.detail.split(" ");
      const fields = ["minute", "hour", "date", "month", "dow"];
      let expr: t.Expression | undefined;
      fieldValues?.forEach((v, index) => {
        if (index === 0) {
          if (!v) {
            expr = t.callExpression(t.identifier("brick_clear"), [
              t.stringLiteral(fields[index]),
            ]);
          } else {
            expr = t.callExpression(t.identifier("brick_type"), [
              t.stringLiteral(fields[index]),
              t.stringLiteral(v),
              t.objectExpression([
                t.objectProperty(
                  t.identifier("clearBeforeInput"),
                  t.booleanLiteral(true)
                ),
              ]),
            ]);
          }
        } else {
          if (!v) {
            expr = t.callExpression(
              t.memberExpression(expr!, t.identifier("brick_clear")),
              [t.stringLiteral(fields[index])]
            );
          } else {
            expr = t.callExpression(
              t.memberExpression(expr!, t.identifier("brick_type")),
              [
                t.stringLiteral(fields[index]),
                t.stringLiteral(v),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier("clearBeforeInput"),
                    t.booleanLiteral(true)
                  ),
                ]),
              ]
            );
          }
        }
      });

      if (expr) {
        const text = generateCodeText(expr);
        generateBrickInputStep(event, text, {
          brickEvtName: "crontab.change",
        });
      }
    },
  },
  "forms.user-or-user-group-select": {
    "user.group.change.v2": (
      event: CustomEvent<
        Array<{
          label: string;
          value: string;
        }>
      >
    ) => {
      let expr: t.Expression;
      if (!event.detail?.length) {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      } else {
        expr = t.callExpression(t.identifier("brick_fill"), [
          t.arrayExpression(
            event.detail.map((userInfo) => t.stringLiteral(userInfo.label))
          ),
        ]);
      }

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "user.group.change.v2",
      });
    },
  },
  "forms.tree-select": {
    "treeSelect.change": (
      event: CustomEvent<{ label: string[]; value: string[] }>
    ) => {
      const { label } = event.detail;
      let expr: t.Expression;
      if (!label?.length) {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      } else {
        expr = t.callExpression(t.identifier("brick_fill"), [
          t.arrayExpression(label.map((l) => t.stringLiteral(l))),
        ]);
      }

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "treeSelect.change",
      });
    },
  },
  "forms.general-cascader": {
    "cascader.change": (
      event: CustomEvent<{
        value: string[];
        selectedOptions: Record<string, unknown>[];
      }>
    ) => {
      const { selectedOptions } = event.detail;
      const labelField = (event.target as any)?.fieldNames?.label || "label";

      const expr = t.callExpression(t.identifier("brick_fill"), [
        t.arrayExpression(
          selectedOptions.map((v) => t.stringLiteral(v[labelField] as string))
        ),
      ]);

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "cascader.change",
      });
    },
  },
  "forms.cmdb-instance-select": {
    "forms.cmdb-instance-select.change.v2": (
      event: CustomEvent<CmdbInstanceSelectOption | CmdbInstanceSelectOption[]>
    ) => {
      let expr: t.Expression;
      if (event.detail) {
        const {
          labelTemplate,
          showKeyField,
          isMultiLabel = true,
        } = event.target as any;

        const labels = castArray(event.detail).map((item) =>
          getLabelValue({
            option: item,
            labelTemplate,
            showKeyField,
            isMultiLabel,
          })
        );

        expr = t.callExpression(t.identifier("brick_fill"), [
          t.arrayExpression(labels.map((label) => t.stringLiteral(label))),
        ]);
      } else {
        expr = t.callExpression(t.identifier("brick_clear"), []);
      }

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "forms.cmdb-instance-select.change.v2",
      });
    },
  },
  "code-bricks.code-editor": {
    "code.change": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);
      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "code.change",
      });
    },
  },
};

export const formsBricks = Object.keys(formBricksMap);

export const extraFormsRecorderSelectors: string[] = [".ant-select-dropdown"];

/**
 * 获取 label 的显示值
 * 参照 CmdbInstanceSelect.tsx 中的 getLabelOptions 函数
 */
function getLabelValue(params: {
  option: any;
  labelTemplate?: string;
  showKeyField?: boolean;
  isMultiLabel?: boolean;
}): string {
  const { option, labelTemplate, showKeyField, isMultiLabel } = params;

  if (labelTemplate) {
    return labelTemplate?.replace(
      /#{(.*?)}/g,
      (_match: string, key: string) => {
        const value = get(option, key.trim());
        return value;
      }
    );
  } else {
    const label = option.label;
    if (Array.isArray(label)) {
      const firstKey = label[0];
      const resKey = label.slice(1, label.length).join(",");
      if (Array.isArray(firstKey) && showKeyField) {
        const subFirstKey = firstKey[0];
        const subResKey = firstKey.slice(1, firstKey.length).join(",");
        return subResKey && isMultiLabel
          ? `${subFirstKey}(${subResKey})`
          : (subFirstKey ?? "");
      }
      return resKey && isMultiLabel
        ? `${firstKey ?? " - "}(${resKey})`
        : (firstKey ?? "");
    } else {
      return label;
    }
  }
}
