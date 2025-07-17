import { InstanceApi_getDetail } from "@next-api-sdk/cmdb-sdk";
import findNearestCandidate from "./findNearestCandidate";
import { getModelObjectInstanceId } from "./getModelObjectInstanceId";

const cache = new Map<string, Promise<Map<string, any>>>();

export async function getPreGeneratedAttrViews(objectId: string) {
  if (cache.has(objectId)) {
    return cache.get(objectId)!;
  }

  const promise = doGetPreGeneratedAttrViews(objectId);
  cache.set(objectId, promise);
  return promise;
}

async function doGetPreGeneratedAttrViews(objectId: string) {
  const attrViews = new Map<string, any>();

  try {
    const instanceId = await getModelObjectInstanceId(objectId);
    if (instanceId) {
      const fields = ["attrList.id", "attrList.generatedView.list"].join(",");

      const { attrList } = await InstanceApi_getDetail(
        "MODEL_OBJECT",
        instanceId,
        {
          fields,
        }
      );

      for (const attr of attrList) {
        const candidates = attr.generatedView?.[0]?.list;
        const select = findNearestCandidate(candidates, 0);
        if (select) {
          attrViews.set(attr.id, select);
        }
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error fetching pre-generated attr views:", e);
  }

  return attrViews;
}
