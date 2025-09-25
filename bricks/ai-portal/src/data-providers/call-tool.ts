import { http } from "@next-core/http";
import { createProviderClass } from "@next-core/utils/general";
import type { ToolInfo } from "@next-shared/tsx-parser";

export async function callTool(
  tool: ToolInfo,
  params: Record<string, unknown>
): Promise<unknown> {
  const response = await http.post<{ data: unknown }>(
    `api/gateway/logic.llm.aiops_service/api/v1/elevo/conversation/${
      tool.conversationId
    }/step/${tool.stepId}/view`,
    {
      params,
    }
  );

  return response.data;
}

customElements.define("ai-portal.call-tool", createProviderClass(callTool));
