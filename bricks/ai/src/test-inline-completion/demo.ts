/* eslint-disable no-console */
import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";
import system from "./system.txt";
import functionDesc from "./function.txt";

export interface CompletionOptions {
  model?: string;
}

export async function completion({ model }: CompletionOptions) {
  const start = performance.now();
  const response = await AiopsBaseApi_openaiChat({
    // model: model ?? "qwen-plus",
    model: model ?? "claude-3-5-sonnet-latest",
    stream: false,
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: `Developer cursor is marked as \`<|developer_cursor_is_here|>\`.

<filename>

refineMetricGroups.ts

</filename>


<file_content>

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
  <|developer_cursor_is_here|>
}

</file_content>`,
      },
    ],
    tool_choice: "required",
    tools: [
      {
        type: "function",
        function: {
          name: "edit_file",
          description: functionDesc,
          parameters: {
            properties: {
              code_edit: {
                description:
                  "Specify ONLY the precise lines of code that you wish to edit. **NEVER specify or write out unchanged code**. Instead, represent all unchanged code using the comment of the language you're editing in - example: `// ... existing code ...`",
                type: "string",
              },
              instructions: {
                description:
                  "A single sentence instruction describing what you are going to do for the sketched edit. This is used to assist the less intelligent model in applying the edit. Please use the first person to describe what you are going to do. Don't repeat what you have said previously in normal messages. And use it to disambiguate uncertainty in the edit.",
                type: "string",
              },
            },
            required: ["instructions", "code_edit"],
            type: "object",
          },
        },
      },
    ],
  });

  if (response.choices?.[0]?.message?.tool_calls?.length) {
    const toolCall = response.choices[0].message.tool_calls[0];
    if (
      toolCall.type === "function" &&
      toolCall.function?.name === "edit_file"
    ) {
      const args = JSON.parse(toolCall.function.arguments!) as {
        code_edit: string;
        instructions: string;
      };
      console.log("Instructions:");
      console.log(args.instructions);
      console.log("Code Edit:");
      console.log(args.code_edit);
      console.log(
        "Get edit done in %ss",
        +((performance.now() - start) / 1000).toFixed(2)
      );

      await applyEdit(
        "refineMetricGroups.ts",
        `interface Group {
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
}`,
        args.instructions,
        args.code_edit
      );
      return;
    }
  }

  console.error("Unexpected response:", response);
}

async function applyEdit(
  filename: string,
  fileContent: string,
  instruction: string,
  edit: string
) {
  const start = performance.now();
  const response = await AiopsBaseApi_openaiChat({
    model: "qwen-turbo",
    stream: false,
    messages: [
      {
        role: "system",
        content: `你是一个编程助手，主要用于 Visual Builder 中的 TypeScript/JavaScript 函数的修改。

你将得到一条指引、文件名、修改前的代码、以及修改部分（可能包含几行未变更的代码作为上下文参考），你负责返回最终修改后的完整代码。如果没有特别说明，不要删除原代码内容（包括注释）。

仅输出完整的修改后的代码，而不输出任何附加说明。`,
      },
      {
        role: "user",
        content: `${instruction}

<filename>

${filename}

</filename>


<original_file_content>

${fileContent}

</original_file_content>


<code_edit>

${edit}

</code_edit>`,
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
