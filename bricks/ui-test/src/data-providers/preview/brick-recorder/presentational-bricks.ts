// istanbul ignore file
import * as t from "@babel/types";
import {
  generateBaseStep,
  generateCodeText,
  generateBrickInputStep,
} from "../utils";

export const presentationalBricksMap = {
  "presentational-bricks.brick-general-search": {
    "query.change": (event: CustomEvent<string>) =>
      handleSearchChange(event, "query.change"),
  },
  "eo-search": {
    change: (event: CustomEvent<string>) => handleSearchChange(event, "change"),
  },
  "presentational-bricks.modal-confirm": {
    "confirm.cancel": (event: CustomEvent<null>) =>
      handleConfirmClick(event, "cancel"),
    "confirm.ok": (event: CustomEvent<null>) =>
      handleConfirmClick(event, "confirm"),
  },
  "presentational-bricks.brick-table": {
    "page.update": (event: CustomEvent<Record<string, any>>) => {
      const pageField = (event.target as any)._fields?.page || "page";

      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("page"),
        t.numericLiteral(event.detail[pageField]),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "filter.update": (event: CustomEvent<Record<string, any>>) => {
      const pageSize = (event.target as any)._fields?.pageSize || "pageSize";
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("pageSize"),
        t.numericLiteral(event.detail[pageSize]),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "select.update": (event: CustomEvent<Record<string, any>[]>) => {
      const columns = (event.target as any).columns;
      const headKey = columns[0]?.dataIndex;
      let expr: t.Expression | undefined;
      if (event.detail?.length) {
        event.detail.forEach((rowData, index) => {
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
        const text = generateCodeText(expr!);
        generateBrickInputStep(event, text, {
          brickEvtName: "select.update",
        });
      }
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
};

export const presentationalBricks = Object.keys(presentationalBricksMap);

export const extraPresentationalBricksRecorderSelectors: string[] = [];

function handleSearchChange(event: CustomEvent<string>, evtName: string): void {
  const expr = !event.detail
    ? t.callExpression(t.identifier("brick_clear"), [])
    : t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);
  const text = generateCodeText(expr);
  generateBrickInputStep(event, text, {
    brickEvtName: evtName,
  });
}

function handleConfirmClick(event: CustomEvent<null>, type: string): void {
  const expr = t.callExpression(t.identifier("brick_click"), [
    t.stringLiteral(type),
  ]);
  const text = generateCodeText(expr);
  generateBaseStep(event, text);
}
