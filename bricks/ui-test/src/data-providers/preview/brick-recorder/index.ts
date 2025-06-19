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

export const customRecorders = {
  ...formsRecordersHandler,
  ...basicBricksRecordersHandler,
};

export const customRecorderBricks = [...formsBricks, ...basicBricks];

export const extraCustomRecorderSelectors = [
  ...extraFormsRecorderSelectors,
  ...extraBasicBricksRecorderSelectors,
];
