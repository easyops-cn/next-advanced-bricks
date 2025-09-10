// istanbul ignore file: mock
import { createProviderClass } from "@next-core/utils/general";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import { http } from "@next-core/http";

export async function entitySdkList(
  workspace: string,
  entity: string,
  params?: any
): Promise<unknown> {
  if (!workspace) {
    throw new Error("Workspace is required for Entity SDK.");
  }
  if (entity === "HOST_METRIC") {
    return (
      await http.post<{ data: unknown }>(
        "api/gateway/data_exchange.olap.Query/api/v1/data_exchange/olap",
        {
          model: "easyops.HOST",
          filters: convertQueryToFilters(params?.query),
          dims: ["time(auto)"],
          measures: convertFieldsToMeasures(params?.fields),
        }
      )
    ).data;
  }
  return InstanceApi_postSearchV3(entity, params);
}

const OPERATOR_MAP = new Map([
  ["$eq", "=="],
  ["$ne", "!="],
  ["$gt", ">"],
  ["$lt", "<"],
  ["$gte", ">="],
  ["$lte", "<="],
]);

function convertQueryToFilters(query: any): any[] {
  return Object.entries(query || {}).flatMap(([name, condition]) => {
    return Object.entries(condition || {}).map(([op, value]) => {
      const operator = OPERATOR_MAP.get(op);
      if (!operator) {
        throw new Error(`Unsupported operator: "${op}"`);
      }
      return { name, operator, value };
    });
  });
}

function convertFieldsToMeasures(
  fields: string[] | undefined
): any[] | undefined {
  return fields?.map((field) => ({
    function: {
      args: [field],
      expression: "avg",
    },
    name: field,
  }));
}

customElements.define(
  "ai-portal.entity-sdk-list",
  createProviderClass(entitySdkList)
);
