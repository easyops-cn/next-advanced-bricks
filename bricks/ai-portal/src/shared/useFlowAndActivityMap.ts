import { useMemo } from "react";
import type { ActivityWithFlow, ServiceFlowRun } from "./interfaces";

export function useFlowAndActivityMap(serviceFlows: ServiceFlowRun[]) {
  return useMemo(() => {
    const flowMap = new Map<string, ServiceFlowRun>();
    const activityMap = new Map<string, ActivityWithFlow>();

    for (const flow of serviceFlows) {
      if (flow.taskId) {
        flowMap.set(flow.taskId, flow);
      }
      for (const stage of flow.spec) {
        for (const activity of stage.serviceFlowActivities) {
          if (activity.taskId) {
            activityMap.set(activity.taskId, { activity, flow });
          }
        }
      }
    }

    return { flowMap, activityMap };
  }, [serviceFlows]);
}
