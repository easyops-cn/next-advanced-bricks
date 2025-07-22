// istanbul ignore file
import * as t from "@babel/types";
import {
  generateBaseStep,
  generateCodeText,
  generateBrickInputStep,
} from "../utils";

export const presentationalV3BricksMap = {
  "eo-next-table": {
    "page.change": (event: CustomEvent<{ page: number; pageSize: number }>) => {
      let expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("page"),
        t.numericLiteral(event.detail.page),
      ]);

      expr = t.callExpression(
        t.memberExpression(expr!, t.identifier("brick_click")),
        [t.stringLiteral("pageSize"), t.numericLiteral(event.detail.pageSize)]
      );

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "row.select": (event: CustomEvent<{ keys: string[]; rows: any[] }>) => {
      const columns = (event.target as any).columns;
      const headKey = columns[0]?.dataIndex;
      let expr: t.Expression | undefined;
      if (event.detail.rows?.length) {
        event.detail.rows.forEach((rowData, index) => {
          if (index === 0) {
            expr = t.callExpression(t.identifier("brick_click"), [
              t.stringLiteral("select"),
              t.stringLiteral(rowData[headKey]),
            ]);
          } else {
            expr = t.callExpression(
              t.memberExpression(expr!, t.identifier("brick_click")),
              [t.stringLiteral("select"), t.stringLiteral(rowData[headKey])]
            );
          }
        });
      } else {
        expr = t.callExpression(t.identifier("brick_click"), [
          t.stringLiteral("clearSelect"),
        ]);
      }

      const text = generateCodeText(expr!);
      generateBrickInputStep(event, text, {
        brickEvtName: "row.select",
      });
    },
    "row.expand": (event: CustomEvent<Record<string, any>>) => {
      const columns = (event.target as any).columns;
      const headKey = columns[0]?.dataIndex;
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("expand"),
        t.stringLiteral(event.detail?.record?.[headKey]),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-card-item": {
    click: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const presentationalV3Bricks = Object.keys(presentationalV3BricksMap);

export const extraPresentationalV3BricksRecorderSelectors: string[] = [];
