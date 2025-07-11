// istanbul ignore file
import * as t from "@babel/types";
import {
  generateBaseStep,
  createBrickEvtHandler,
  generateCodeText,
  generateBrickInputStep,
} from "../utils";

const handleSearchChange = (event: CustomEvent<string>, evtName: string) => {
  const expr = !event.detail
    ? t.callExpression(t.identifier("brick_clear"), [])
    : t.callExpression(t.identifier("brick_type"), [
        t.stringLiteral(event.detail),
      ]);
  const text = generateCodeText(expr);
  generateBrickInputStep(event, text, {
    brickEvtName: evtName,
  });
};

const handleConfirmClick = (event: CustomEvent<null>, type: string) => {
  const expr = t.callExpression(t.identifier("brick_click"), [
    t.stringLiteral(type),
  ]);
  const text = generateCodeText(expr);
  generateBaseStep(event, text);
};

const presentationalBricksMap = {
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
};

export const presentationalBricks = Object.keys(presentationalBricksMap);

export const extraPresentationalBricksRecorderSelectors: string[] = [];

export const presentationalBricksRecordersHandler = createBrickEvtHandler(
  presentationalBricksMap
);
