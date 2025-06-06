import React from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";
import {
  EoDisplayCanvas,
  EoDisplayCanvasProps,
} from "@next-bricks/diagram/display-canvas";

export const AsyncWrappedDisplayCanvas = React.lazy(async () => ({
  default: await asyncWrapBrick<EoDisplayCanvas, EoDisplayCanvasProps>(
    "eo-display-canvas"
  ),
}));
