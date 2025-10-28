import { useMemo } from "react";
import type { PlanStep, ServiceFlowRun, Task } from "./interfaces";

export function useServiceFlowPlan(
  serviceFlows: ServiceFlowRun[],
  tasks: Task[]
): PlanStep[] {
  return useMemo(() => {
    const steps: PlanStep[] = [];

    for (const flow of serviceFlows) {
      for (const stage of flow.spec) {
        for (const activity of stage.serviceFlowActivities) {
          if (activity.taskId) {
            const task = tasks.find((t) => t.id === activity.taskId);
            steps.push({
              name: activity.name,
              taskId: activity.taskId,
              state: task?.state,
            });
          } else {
            steps.push({
              name: activity.name,
            });
          }
        }
      }
    }

    return steps;
  }, [serviceFlows, tasks]);
}
