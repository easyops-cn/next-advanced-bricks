import {
  basicBricks,
  basicBricksRecordersHandler,
  extraBasicBricksRecorderSelectors,
} from "./basic-bricks";
import {
  formsRecordersHandler,
  formsBricks,
  extraFormsRecorderSelectors,
} from "./forms";
import {
  containerBricks,
  containerBricksRecordersHandler,
  extraContainerBricksRecorderSelectors,
} from "./container";

export const customRecorders = {
  ...formsRecordersHandler,
  ...basicBricksRecordersHandler,
  ...containerBricksRecordersHandler,
};

export const customRecorderBricks = [
  ...formsBricks,
  ...basicBricks,
  ...containerBricks,
];

export const extraCustomRecorderSelectors = [
  ...extraFormsRecorderSelectors,
  ...extraBasicBricksRecorderSelectors,
  ...extraContainerBricksRecorderSelectors,
];
