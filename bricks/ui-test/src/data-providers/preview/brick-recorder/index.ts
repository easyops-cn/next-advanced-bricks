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
import {
  presentationalBricks,
  presentationalBricksRecordersHandler,
  extraPresentationalBricksRecorderSelectors,
} from "./presentational-bricks";

export const customRecorders = {
  ...formsRecordersHandler,
  ...basicBricksRecordersHandler,
  ...containerBricksRecordersHandler,
  ...presentationalBricksRecordersHandler,
};

export const customRecorderBricks = [
  ...formsBricks,
  ...basicBricks,
  ...containerBricks,
  ...presentationalBricks,
];

export const extraCustomRecorderSelectors = [
  ...extraFormsRecorderSelectors,
  ...extraBasicBricksRecorderSelectors,
  ...extraContainerBricksRecorderSelectors,
  ...extraPresentationalBricksRecorderSelectors,
];
