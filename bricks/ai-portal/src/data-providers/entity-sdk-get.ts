import { createProviderClass } from "@next-core/utils/general";
import { InstanceApi_getDetail } from "@next-api-sdk/cmdb-sdk";

export async function entitySdkGet(
  workspace: string,
  entity: string,
  id: string
): Promise<unknown> {
  if (!workspace) {
    throw new Error("Workspace is required for Entity SDK.");
  }
  return InstanceApi_getDetail(entity, id, {});
}

customElements.define(
  "ai-portal.entity-sdk-get",
  createProviderClass(entitySdkGet)
);
