import { InstanceApi_getDetail } from "@next-api-sdk/cmdb-sdk";
import { getModelObjectInstanceId } from "./getModelObjectInstanceId.js";

const cache = new Map<string, Promise<MetricWithGroup[]>>();

export interface MetricWithGroup {
  group: string;
  metrics: string[];
  counter?: string;
}

export async function getPreGeneratedMetricGroups(objectId: string) {
  if (cache.has(objectId)) {
    return cache.get(objectId)!;
  }

  const promise = doGetPreGeneratedMetricGroups(objectId);
  cache.set(objectId, promise);
  return promise;
}

async function doGetPreGeneratedMetricGroups(objectId: string) {
  let metricGroups: MetricWithGroup[] = [];

  try {
    const instanceId = await getModelObjectInstanceId(objectId);
    if (instanceId) {
      const fields = ["metricGroups"].join(",");

      const { metricGroups: groups } = await InstanceApi_getDetail(
        "MODEL_OBJECT",
        instanceId,
        {
          fields,
        }
      );

      if (Array.isArray(groups) && groups.length) {
        metricGroups = groups;
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error fetching pre-generated metric groups:", e);
  }

  return metricGroups;
}
