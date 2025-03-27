import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";

const CURSOR_PLACEHOLDER = "<|developer_cursor_is_here|>";

export async function getInlineEdit({
  source,
  language,
  offset,
  signal,
}: {
  source: string;
  language: string;
  offset: number;
  signal: AbortSignal;
}): Promise<string | null> {
  const response = await AiopsBaseApi_openaiChat(
    {
      // model: "qwen-turbo",
      model: "qwen-plus",
      // model: "claude-3-5-sonnet-latest",
      enableSensitiveWordsFilter: false,
      stream: false,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            language === "brick_next_yaml"
              ? /* ? `你是一个编程助手，主要用于 Visual Builder 中的 YAML 配置的代码补全。

YAML 中可以使用 \`<% %>\` 嵌入 JS 表达式，例如：

${"```yaml"}yaml
groups: <% _.groupBy(CTX.hosts, "idc") %>
${"```"}

JS 表达式中可以使用 lodash (\`_\`) 和 moment。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。

用户会给出代码内容，其中会标注光标位置（\`${CURSOR_PLACEHOLDER}\`），你输出要插入光标位置的代码内容、以及光标所在行原有的前后内容，注意不要包含光标之外其他行的原有内容。

使用 markdown 的代码块格式返回结果。不输出任何附加说明。` */
                `你是一个编程助手，主要用于 Visual Builder 中的 YAML 配置的代码补全。

YAML 中可以使用 \`<% %>\` 嵌入 JS 表达式，例如：

${"```yaml"}yaml
groups: <% _.groupBy(CTX.hosts, "idc") %>
${"```"}

JS 表达式中可以使用 lodash (\`_\`) 和 moment。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。

用户会给出代码内容，其中会标注光标位置（\`${CURSOR_PLACEHOLDER}\`），你输出完整的修改后的代码，不要尝试修改光标位置之外的其他代码。

使用 markdown 的代码块格式返回结果。不输出任何附加说明。`
              : `你是一个编程助手，主要用于 Visual Builder 中的 ${language === "typescript" ? "TypeScript" : "JavaScript"} 函数的代码补全。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。

用户会给出代码内容，其中会标注光标位置（\`${CURSOR_PLACEHOLDER}\`），你输出要插入光标位置的代码内容、以及光标所在行原有的前后内容，注意不要包含光标之外其他行的原有内容。

使用 markdown 的代码块格式返回结果。不输出任何附加说明。`,
        },
        {
          role: "user",
          content: `${"```"}${language}
${source.slice(0, offset)}${CURSOR_PLACEHOLDER}${source.slice(offset)}
${"```"}`,
        },
      ],
    },
    {
      signal,
      interceptorParams: {
        ignoreLoadingBar: true,
      },
    }
  );

  const content = response.choices?.[0]?.message?.content;
  if (content) {
    const matches = content.match(/^```(?:\w*)\n([\s\S]*?)\n^```$/m);
    if (matches) {
      return matches[1] /* .replace(CURSOR_PLACEHOLDER, "") */;
    }
  }

  // eslint-disable-next-line no-console
  console.error("Unexpected response:", response);
  return null;
}
