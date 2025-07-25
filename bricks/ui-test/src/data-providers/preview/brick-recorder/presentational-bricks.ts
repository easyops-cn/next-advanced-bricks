// istanbul ignore file
import * as t from "@babel/types";
import moment from "moment";
import {
  generateBaseStep,
  generateCodeText,
  generateBrickInputStep,
} from "../utils";

interface TreeData {
  key: string;
  title: string;
  children?: TreeData[];
}

interface TimestampRangeValue {
  from: number;
  to: number;
}
interface DateRangeValue {
  type: "dateRange" | "specifiedDate";
  value: string | TimestampRangeValue;
}

interface CustomRangeOptions {
  range: string;
  text: string;
}

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
      } else {
        expr = t.callExpression(t.identifier("brick_click"), [
          t.stringLiteral("clearSelect"),
        ]);
      }

      const text = generateCodeText(expr!);
      generateBrickInputStep(event, text, {
        brickEvtName: "select.update",
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
  "presentational-bricks.card-item": {
    "presentational-bricks.card-item.click": (
      event: CustomEvent<Record<string, any>>
    ) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "presentational-bricks.brick-tree": {
    "tree.select": (event: CustomEvent<string[]>) => {
      const treeData = (event.target as any).dataSource;

      const currentTreeNode = matchedCurrentTreeNode(treeData, event.detail[0]);
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("select"),
        t.stringLiteral(currentTreeNode!.title),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "tree.search": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "tree.search",
      });
    },
    "tree.check": (event: CustomEvent<string[]>) => {
      const treeData = (event.target as any).dataSource;

      const arr: string[] = [];
      event.detail?.forEach((key) => {
        const currentTreeNode = matchedCurrentTreeNode(treeData, key);
        arr.push(currentTreeNode!.title);
      });

      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("multipleCheck"),
        t.arrayExpression(arr.map((v) => t.stringLiteral(v))),
      ]);

      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    "tree.expand": (event: CustomEvent<string[]>) => {
      const treeData = (event.target as any).dataSource;

      const arr: string[] = [];
      event.detail?.forEach((key) => {
        const currentTreeNode = matchedCurrentTreeNode(treeData, key);
        arr.push(currentTreeNode!.title);
      });

      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("multipleExpand"),
        t.arrayExpression(arr.map((v) => t.stringLiteral(v))),
      ]);

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "tree.expand",
      });
    },
  },
  "presentational-bricks.markdown-editor": {
    "markdown.value.change": (event: CustomEvent<string>) => {
      const expr = t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);

      const text = generateCodeText(expr);
      generateBrickInputStep(event, text, {
        brickEvtName: "markdown.value.change",
      });
    },
  },
  "presentational-bricks.basic-icon": {
    "icon.click": (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "presentational-bricks.datetime-selector": {
    "datetime.selected": (event: CustomEvent<DateRangeValue>) => {
      const customRange = (event.detail as any)
        .customTimeRange as CustomRangeOptions[];
      const defaultRange = [
        {
          range: "now-1h",
          text: "近1小时",
        },
        {
          range: "now-1d",
          text: "近24小时",
        },
        {
          range: "now/d",
          text: "今天",
        },
        {
          range: "now-7d",
          text: "近7天",
        },
        {
          range: "now-30d",
          text: "近30天",
        },
      ];

      let expr: t.Expression;

      if (event.detail.type === "dateRange") {
        const label = (customRange ? customRange : defaultRange).find(
          (item) => item.range === event.detail.value
        )?.text;

        expr = t.callExpression(t.identifier("brick_fill"), [
          t.objectExpression([
            t.objectProperty(
              t.identifier("type"),
              t.stringLiteral("dateRange")
            ),
            t.objectProperty(t.identifier("value"), t.stringLiteral(label!)),
          ]),
        ]);
      } else {
        const { from, to } = event.detail.value as TimestampRangeValue;
        expr = t.callExpression(t.identifier("brick_fill"), [
          t.objectExpression([
            t.objectProperty(
              t.identifier("type"),
              t.stringLiteral("timestamp")
            ),
            t.objectProperty(
              t.identifier("from"),
              t.stringLiteral(
                `${moment(from).format("YYYY-MM-DD HH:mm:ss")}{enter}`
              )
            ),
            t.objectProperty(
              t.identifier("to"),
              t.stringLiteral(
                `${moment(to).format("YYYY-MM-DD HH:mm:ss")}{enter}`
              )
            ),
          ]),
        ]);
      }

      const text = generateCodeText(expr!);
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

function matchedCurrentTreeNode(
  treeData: TreeData[] = [],
  key: string
): TreeData | null {
  for (const item of treeData) {
    if (item.key === key) {
      return item;
    }

    if (item.children) {
      const result = matchedCurrentTreeNode(item.children, key);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
