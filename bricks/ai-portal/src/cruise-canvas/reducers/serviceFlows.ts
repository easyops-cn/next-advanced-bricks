import type { Reducer } from "react";
import { isMatch, pick } from "lodash";
import type {
  ActivityRun,
  ServiceFlowPatch,
  ServiceFlowRun,
  StageRun,
} from "../../shared/interfaces";
import type { CruiseCanvasAction } from "./interfaces";

export const serviceFlows: Reducer<ServiceFlowRun[], CruiseCanvasAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "sse": {
      const serviceFlowsPatch = action.payload.serviceFlows;
      let serviceFlows = state;

      if (!Array.isArray(serviceFlowsPatch) || serviceFlowsPatch.length === 0) {
        return state;
      }

      for (const flow of serviceFlowsPatch) {
        const flowPatch = pick(flow, [
          "taskId",
          "flowInstanceId",
          "name",
          "spec",
          "space",
        ]) as Omit<ServiceFlowPatch, "fullSpec">;
        const previousFlowIndex = serviceFlows.findIndex(
          (f) => f.taskId === flowPatch.taskId
        );
        const previousFlow = serviceFlows[previousFlowIndex];
        flowPatch.spec = mergeSpec(
          previousFlow?.spec,
          flowPatch,
          flow.fullSpec
        );

        if (previousFlowIndex === -1) {
          serviceFlows = [...serviceFlows, flowPatch as ServiceFlowRun];
        } else {
          if (!isMatch(previousFlow, flowPatch)) {
            serviceFlows = [
              ...serviceFlows.slice(0, previousFlowIndex),
              { ...previousFlow, ...flowPatch } as ServiceFlowRun,
              ...serviceFlows.slice(previousFlowIndex + 1),
            ];
          }
        }
      }

      return serviceFlows;
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};

function mergeSpec(
  previousSpec: StageRun[] | undefined,
  flowPatch: ServiceFlowPatch,
  fullSpec: StageRun[] | undefined
): StageRun[] {
  if (Array.isArray(fullSpec)) {
    return fullSpec;
  }
  if (!Array.isArray(flowPatch.spec)) {
    return previousSpec ?? [];
  }
  const mergedSpec: StageRun[] = previousSpec ? [...previousSpec] : [];

  for (const stagePatch of flowPatch.spec) {
    const stageIndex = mergedSpec.findIndex((s) => s.name === stagePatch.name);
    if (stageIndex === -1) {
      const stage = { ...stagePatch };
      stage.serviceFlowActivities ??= [];
      mergedSpec.push(stage as StageRun);
    } else {
      const activities = mergeActivities(
        mergedSpec[stageIndex].serviceFlowActivities,
        stagePatch.serviceFlowActivities
      );

      mergedSpec[stageIndex] = {
        ...mergedSpec[stageIndex],
        ...stagePatch,
        serviceFlowActivities: activities,
      };
    }
  }

  return mergedSpec;
}

function mergeActivities(
  previousActivities: ActivityRun[] | undefined,
  activitiesPatch: ActivityRun[] | undefined
): ActivityRun[] {
  let activities = previousActivities ?? [];

  if (!Array.isArray(activitiesPatch) || activitiesPatch.length === 0) {
    return activities;
  }

  for (const activityPatch of activitiesPatch) {
    const activityIndex = activities.findIndex((activity) =>
      activity.taskId
        ? activity.taskId === activityPatch.taskId
        : activity.name === activityPatch.name
    );

    if (activityIndex === -1) {
      activities = [...activities, activityPatch];
    } else {
      activities = [
        ...activities.slice(0, activityIndex),
        { ...activities[activityIndex], ...activityPatch },
        ...activities.slice(activityIndex + 1),
      ];
    }
  }

  return activities;
}
