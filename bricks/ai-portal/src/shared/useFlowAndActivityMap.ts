import { useMemo } from "react";
import type { ActivityWithFlow, ServiceFlowRun } from "./interfaces";

export function useFlowAndActivityMap(serviceFlows: ServiceFlowRun[]) {
  return useMemo(() => {
    // const serviceFlows: ServiceFlowRun[] = [
    //   {
    //     taskId: "0000019a13d1890e367884f593ca7a42",
    //     flowInstanceId: "flow-instance-1",
    //     name: "Example Flow 1",
    //     space: {
    //       instanceId: "space-1",
    //       name: "Example Space",
    //     },
    //     spec: [
    //       {
    //         name: "Stage 1",
    //         serviceFlowActivities: [
    //           {
    //             taskId: "0000019a13d20b0e367884f593ca7a44",
    //             name: "Activity 1",
    //           },
    //           {
    //             name: "Activity 2",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ];
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
