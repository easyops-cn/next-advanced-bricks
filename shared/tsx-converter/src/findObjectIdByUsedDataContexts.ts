import { strictCollectMemberUsage } from "@next-core/utils/storyboard";
import type { DataSource, Variable } from "@next-shared/tsx-types";

/**
 * Find the object ID associated with the used data contexts.
 *
 * This function traverses the used contexts along their dependency chain.
 */
export function findObjectIdByUsedDataContexts(
  usedContexts: Set<string> | undefined,
  dataSources: DataSource[] | undefined,
  variables: Variable[] | undefined
) {
  let objectId: string | undefined;
  if (usedContexts?.size && dataSources?.length) {
    const dataSourceToObjectIdMap = new Map<string, string>();
    for (const dataSource of dataSources) {
      if (dataSource.objectId) {
        dataSourceToObjectIdMap.set(dataSource.name, dataSource.objectId);
      }
    }

    const variableDepsMap = new Map<string, Set<string>>();
    for (const variable of variables ?? []) {
      const deps = strictCollectMemberUsage(variable.value, "CTX");
      variableDepsMap.set(variable.name, deps);
    }

    const processedContexts = new Set<string>();

    const find = (context: string) => {
      if (processedContexts.has(context)) {
        return false;
      }
      processedContexts.add(context);

      const dataSourceObjectId = dataSourceToObjectIdMap.get(context);
      if (dataSourceObjectId) {
        objectId = dataSourceObjectId;
        return true;
      }

      const variableDeps = variableDepsMap.get(context);
      for (const dep of variableDeps ?? []) {
        if (find(dep)) {
          return true;
        }
      }

      return false;
    };

    for (const context of usedContexts) {
      if (find(context)) {
        break;
      }
    }
  }

  return objectId;
}
