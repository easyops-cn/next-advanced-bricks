import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";

const cache = new Map<string, Promise<string | null>>();

export async function getModelObjectInstanceId(objectId: string) {
  if (cache.has(objectId)) {
    return cache.get(objectId)!;
  }

  const promise = doGetModelObjectInstanceId(objectId);
  cache.set(objectId, promise);
  return promise;
}

async function doGetModelObjectInstanceId(objectId: string) {
  const { list } = await InstanceApi_postSearchV3("MODEL_OBJECT", {
    fields: ["instanceId"],
    query: {
      objectId: {
        $eq: objectId,
      },
    },
    page_size: 1,
  });

  if (list?.length) {
    return list[0].instanceId;
  }

  return null;
}
