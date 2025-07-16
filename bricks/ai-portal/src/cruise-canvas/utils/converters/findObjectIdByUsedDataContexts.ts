import type { DataSource } from "./interfaces";

export function findObjectIdByUsedDataContexts(
  usedContexts: Set<string> | undefined,
  dataSources: DataSource[] | undefined
) {
  let objectId: string | undefined;
  if (usedContexts?.size && dataSources?.length) {
    for (const context of usedContexts) {
      for (const ds of dataSources ?? []) {
        if (ds.name === context) {
          if (ds.api.objectId) {
            objectId = ds.api.objectId;
            break;
          }
          break;
        }
      }
    }
  }
  return objectId;
}
