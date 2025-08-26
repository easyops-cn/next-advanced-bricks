import { InstanceApi_getDetail } from "@next-api-sdk/cmdb-sdk";
import findNearestCandidate from "./findNearestCandidate.js";
import { getModelObjectInstanceId } from "./getModelObjectInstanceId.js";

const cache = new Map<string, Promise<Map<string, any>>>();

const attrListCache = new Map<string, any>();

export async function getPreGeneratedAttrViews(
  objectId: string,
  visualWeight?: number
) {
  if (cache.has(objectId)) {
    return cache.get(objectId)!;
  }

  const promise = doGetPreGeneratedAttrViews(objectId, visualWeight);
  cache.set(objectId, promise);
  return promise;
}

async function doGetPreGeneratedAttrViews(
  objectId: string,
  visualWeight?: number
) {
  const attrViews = new Map<string, any>();

  try {
    const attrList = await getAttrList(objectId);
    if (attrList) {
      for (const attr of attrList) {
        const candidates = attr.generatedView?.[0]?.list;
        const select = findNearestCandidate(candidates, visualWeight ?? 0);
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

async function getAttrList(objectId: string) {
  if (attrListCache.has(objectId)) {
    return attrListCache.get(objectId)!;
  }

  const promise = doGetAttrList(objectId);
  attrListCache.set(objectId, promise);
  return promise;
}

async function doGetAttrList(objectId: string) {
  const instanceId = await getModelObjectInstanceId(objectId);
  if (!instanceId) {
    return null;
  }

  const fields = ["attrList.id", "attrList.generatedView.list"].join(",");

  const { attrList } = await InstanceApi_getDetail("MODEL_OBJECT", instanceId, {
    fields,
  });

  return attrList;
}
