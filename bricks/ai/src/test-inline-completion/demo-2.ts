/* eslint-disable no-console */
import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";

export interface CompletionOptions {
  model?: string;
}

export async function completion2({ model }: CompletionOptions) {
  const start = performance.now();
  const response = await AiopsBaseApi_openaiChat({
    // model: model ?? "qwen-turbo",
    model: model ?? "qwen-plus",
    // model: model ?? "claude-3-5-sonnet-latest",
    stream: false,
    messages: [
      {
        role: "system",
        content: `你是一个编程助手，主要用于 Visual Builder 中的 TypeScript/JavaScript 函数的代码补全。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。

用户会给出代码内容，其中会标注光标位置（\`<|developer_cursor_is_here|>\`），你输出要插入光标位置的代码内容，但应同时包含光标位置所在行原有的前后内容，而不要包含光标位置之外其他行的原有内容。

不输出任何附加说明。`,
      },
      {
        role: "user",
        content: `${"```typescript"}
interface Group {
  group: string;
  metrics: string[];
}

interface Metric {
  name: string;
}

function refineMetricGroups(
  groups: Group[] | undefined,
  metrics: Metric[]
): Group[] | undefined {
  const metricSets = new Set(metrics.map((metric) => metric.name));

  // 忽略指标数量不大于 1 的分组
  return  gr<|developer_cursor_is_here|>
}
${"```"}`,
      },
    ],
  });

  if (response.choices?.[0]?.message?.content) {
    const editedCode = response.choices[0].message.content;
    console.log("Edited Code:");
    console.log(editedCode);
    console.log(
      "Apply done in %ss",
      +((performance.now() - start) / 1000).toFixed(2)
    );
    return;
  }

  console.error("Unexpected response:", response);
}
