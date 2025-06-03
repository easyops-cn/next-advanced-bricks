import React from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";
import { EoNextTable, NextTableProps } from "@next-bricks/advanced/next-table";

export const AsyncWrappedTable = React.lazy(async () => ({
  default: await asyncWrapBrick<EoNextTable, NextTableProps>("eo-next-table"),
}));
