// istanbul ignore file
import * as t from "@babel/types";
import { generateBaseStep, generateCodeText } from "../utils";

export const containersV3Map = {
  "eo-drawer": {
    close: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), []);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-modal": {
    confirm: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("ok"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
    cancel: (event: CustomEvent<void>) => {
      const expr = t.callExpression(t.identifier("brick_click"), [
        t.stringLiteral("cancel"),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
  "eo-tab-list": {
    "tab.select": (event: CustomEvent<string>) => {
      const tabs = (event.target as any).tabs as Array<{
        panel: string;
        text: string;
      }>;

      const expr = t.callExpression(t.identifier("brick_clickItem"), [
        t.stringLiteral(
          tabs.find((tab) => tab.panel === event.detail)?.text || ""
        ),
      ]);
      const text = generateCodeText(expr);
      generateBaseStep(event, text);
    },
  },
};

export const containersV3 = Object.keys(containersV3Map);

export const extraContainersV3RecorderSelectors: string[] = [];
