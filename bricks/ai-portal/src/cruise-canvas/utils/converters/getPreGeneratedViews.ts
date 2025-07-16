import {
  InstanceApi_getDetail,
  InstanceApi_postSearchV3,
} from "@next-api-sdk/cmdb-sdk";
import findNearestCandidate from "./findNearestCandidate";

export async function getPreGeneratedViews(objectId: string) {
  const preGeneratedViews = new Map<string, any>();

  try {
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
      const fields = ["attrList.id", "attrList.generatedView.list"].join(",");

      const { attrList } = await InstanceApi_getDetail(
        "MODEL_OBJECT",
        list[0].instanceId,
        {
          fields,
        }
      );

      for (const attr of attrList) {
        const candidates = attr.generatedView?.[0]?.list;
        const select = findNearestCandidate(candidates, 0);
        if (select) {
          preGeneratedViews.set(attr.id, select);
        }
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error fetching pre-generated views:", e);
  }

  return preGeneratedViews;
}
