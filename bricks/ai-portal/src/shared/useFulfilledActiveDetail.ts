import { useMemo } from "react";
import type {
  ActiveDetail,
  ActivityWithFlow,
  FulfilledActiveDetail,
  Job,
  ServiceFlowRun,
} from "./interfaces";

export function useFulfilledActiveDetail(
  activeDetail: ActiveDetail | null,
  jobMap: Map<string, Job> | undefined,
  flowMap: Map<string, ServiceFlowRun>,
  activityMap: Map<string, ActivityWithFlow>
) {
  return useMemo<FulfilledActiveDetail | null>(() => {
    if (!activeDetail) {
      return null;
    }
    switch (activeDetail.type) {
      case "job": {
        const job = jobMap?.get(activeDetail.id);
        if (job) {
          return {
            type: "job",
            job,
          };
        }
        break;
      }
      case "flow": {
        const flow = flowMap?.get(activeDetail.id);
        if (flow) {
          return {
            type: "flow",
            flow,
          };
        }
        break;
      }
      case "activity": {
        const activityWithFlow = activityMap?.get(activeDetail.id);
        if (activityWithFlow) {
          return {
            type: "activity",
            flow: activityWithFlow.flow,
            activity: activityWithFlow.activity,
          };
        }
        break;
      }
    }
    return null;
  }, [activeDetail, activityMap, flowMap, jobMap]);
}
