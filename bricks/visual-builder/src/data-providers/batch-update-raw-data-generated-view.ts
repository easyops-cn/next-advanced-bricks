import { createProviderClass } from "@next-core/utils/general";
import { InstanceApi_createInstance } from "@next-api-sdk/cmdb-sdk";

export interface GeneratedView {
  attrInstanceId: string;
  input: string;
  output: string;
  list: unknown[];
  defaultVisualWeight?: number;
  systemPromptVersion?: string;
}

export async function batchUpdateRawDataGeneratedView(
  generations: GeneratedView[],
  type?: "form" | "data"
): Promise<unknown> {
  return Promise.allSettled(
    generations.map(({ attrInstanceId, ...props }) =>
      InstanceApi_createInstance("RAW_DATA_GENERATED_VIEW@EASYOPS", {
        ...props,
        [type === "form" ? "formAttr" : "attr"]: [attrInstanceId],
      })
    )
  );
}

customElements.define(
  "visual-builder.batch-update-raw-data-generated-view",
  createProviderClass(batchUpdateRawDataGeneratedView)
);
