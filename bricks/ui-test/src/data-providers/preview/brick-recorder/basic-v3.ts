// istanbul ignore file
import * as t from "@babel/types";
import { generateBaseStep, generateCodeText } from "../utils";

interface DropdownAction {
  text: string;
  event: string;
  items: DropdownAction[];
}

export const basicV3Map = {
  "eo-button": {
    click: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-directory": {
    "menu.item.click": (
      event: CustomEvent<{
        groupKey: string;
        data: { key: string; title: string };
      }>
    ) => {
      const title = event.detail.data.title;
      const expr = t.callExpression(t.identifier("brick_clickItem"), [
        t.stringLiteral(title),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-link": {
    click: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-dropdown-actions": {
    "action.click": (event: CustomEvent<DropdownAction>) => {
      const actions = (event.target as any).actions as DropdownAction[];

      const matchedActions = matchedActionItems(actions, event.detail.event);
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("text"),
        t.arrayExpression(
          matchedActions?.map((action) => t.stringLiteral(action.text)) || []
        ),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const basicV3 = Object.keys(basicV3Map);

export const extraBasicV3RecorderSelectors: string[] = [];

function matchedActionItems(
  actions: DropdownAction[],
  target: string
): DropdownAction[] | undefined {
  for (const currentAction of actions) {
    if (currentAction.event === target) {
      return [currentAction];
    }

    if (currentAction.items) {
      const items = matchedActionItems(currentAction.items, target);
      if (items) {
        return [currentAction, ...items];
      }
    }
  }
}
