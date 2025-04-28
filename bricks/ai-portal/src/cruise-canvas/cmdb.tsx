import React from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";

interface CMDBSelectProps {
  objectId?: string | null;
  fieldId?: string | null;
  objectList?: any[] | null;
}

interface CMDBSelectEvents {
  "cmdb.instance.form.change.v2": CustomEvent<any[]>;
}

interface CMDBSelectEvensMapping {
  onChangeV2: "cmdb.instance.form.change.v2";
}

export const AsyncWrappedCMDB = React.lazy(async () => ({
  default: await asyncWrapBrick<
    HTMLElement,
    CMDBSelectProps,
    CMDBSelectEvents,
    CMDBSelectEvensMapping
  >("cmdb-instances.cmdb-instances-input-form", {
    onChangeV2: "cmdb.instance.form.change.v2",
  }),
}));
