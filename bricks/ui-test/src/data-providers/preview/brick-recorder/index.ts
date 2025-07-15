import {
  basicBricks,
  extraBasicBricksRecorderSelectors,
  basicBricksMap,
} from "./basic-bricks";
import {
  formsBricks,
  extraFormsRecorderSelectors,
  formBricksMap,
} from "./forms";
import {
  containerBricks,
  extraContainerBricksRecorderSelectors,
  containerBricksMap,
} from "./container";
import {
  presentationalBricks,
  extraPresentationalBricksRecorderSelectors,
  presentationalBricksMap,
} from "./presentational-bricks";
import { basicV3, extraBasicV3RecorderSelectors, basicV3Map } from "./basic-v3";
import {
  containersV3,
  extraContainersV3RecorderSelectors,
  containersV3Map,
} from "./container-v3";
import { createBrickEvtHandler } from "../utils";
import {
  formBricksV3,
  extraFormBricksV3RecorderSelectors,
  formBricksV3Map,
} from "./forms-v3";

export const customRecorders = createBrickEvtHandler({
  ...presentationalBricksMap,
  ...formBricksMap,
  ...basicBricksMap,
  ...containerBricksMap,
  ...basicV3Map,
  ...containersV3Map,
  ...formBricksV3Map,
});

export const customRecorderBricks = [
  ...formsBricks,
  ...basicBricks,
  ...containerBricks,
  ...presentationalBricks,
  ...basicV3,
  ...containersV3,
  ...formBricksV3,
];

export const extraCustomRecorderSelectors = [
  ...extraFormsRecorderSelectors,
  ...extraBasicBricksRecorderSelectors,
  ...extraContainerBricksRecorderSelectors,
  ...extraPresentationalBricksRecorderSelectors,
  ...extraBasicV3RecorderSelectors,
  ...extraContainersV3RecorderSelectors,
  ...extraFormBricksV3RecorderSelectors,
];
