import { InstanceApi_getDetail } from "@next-api-sdk/cmdb-sdk";
import { useEffect, useState } from "react";

const cache = new Map<string, Promise<boolean>>();

export function useViewFeedbackDone(
  viewId: string | undefined,
  showFeedbackOnView?: boolean
) {
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (!viewId || !showFeedbackOnView) {
      setDone(true);
      return;
    }
    let promise = cache.get(viewId);
    if (promise === undefined) {
      promise = fetchViewFeedbackDone(viewId);
      cache.set(viewId, promise);
    }
    let ignore = false;
    promise.then((value) => {
      if (!ignore) {
        setDone(value);
      }
    });
    return () => {
      ignore = true;
    };
  }, [viewId, showFeedbackOnView]);

  return done;
}

async function fetchViewFeedbackDone(viewId: string): Promise<boolean> {
  const response = await InstanceApi_getDetail(
    "LLM_WEB_VIEW_INFO@EASYOPS",
    viewId,
    {
      fields: "feedback.instanceId",
    },
    {
      priority: "low",
    }
  );
  return !!response?.feedback?.length;
}
