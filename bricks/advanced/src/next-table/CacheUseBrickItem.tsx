import React, { useEffect, useState } from "react";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import { UseBrickConfOrRenderFunction } from "@next-core/react-runtime";

export function CacheUseBrickItem(props: {
  useBrick: UseBrickConfOrRenderFunction;
  data: any;
}): React.ReactNode {
  const [cacheData, setCacheData] = useState<any>(props.data);

  useEffect(() => {
    setCacheData(props.data);
  }, Object.values(props.data));

  return <ReactUseMultipleBricks useBrick={props.useBrick} data={cacheData} />;
}
