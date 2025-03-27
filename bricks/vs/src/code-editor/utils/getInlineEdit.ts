import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";

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
  const prefix = source.slice(0, offset);
  const suffix = source.slice(offset);
  const response = await AiopsBaseApi_openaiChat(
    {
      // model: "qwen-turbo",
      // model: "qwen-plus",
      model: "qwen-coder-turbo",
      // model: "claude-3-5-sonnet-latest",
      enableSensitiveWordsFilter: false,
      stream: false,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            language === "brick_next_yaml"
              ? `你是一个编程助手，主要用于 Visual Builder 中的 YAML 配置的代码补全。

YAML 中可以使用 \`<% %>\` 嵌入 JS 表达式，例如：

${"```yaml"}yaml
groups: <% _.groupBy(CTX.hosts, "idc") %>
${"```"}

JS 表达式中可以使用 lodash (\`_\`) 和 moment。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。如果要添加注释，不要放在行尾部，应该单独成行。`
              : `你是一个编程助手，主要用于 Visual Builder 中的 ${language === "typescript" ? "TypeScript" : "JavaScript"} 函数的代码补全。

提供简洁易读的代码补全，语法和逻辑准确，与现有上下文无缝集成，格式优雅。如果要添加注释，不要放在行尾部，应该单独成行。`,
        },
        {
          role: "user",
          content: `<|fim_prefix|># props.yaml\n${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`,
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

  const content = response.choices?.[0]?.message?.content?.trim();
  if (content) {
    const matches = content.match(/^```(?:\w*)\n([\s\S]*?)\n^```$/m);
    if (matches) {
      const full = matches[1].replace(/^# props.yaml\n/, "");
      const trimmedFull = full.trim();
      const trimmedPrefix = prefix.trimStart();
      const trimmedSuffix = suffix.trimEnd();
      if (
        trimmedFull.startsWith(trimmedPrefix) &&
        trimmedFull.endsWith(trimmedSuffix)
      ) {
        const insertText = trimmedFull.slice(
          trimmedPrefix.length,
          trimmedFull.length - trimmedSuffix.length
        );
        if (/\S/.test(insertText)) {
          return insertText;
        }
        // eslint-disable-next-line no-console
        console.log("Empty insertText");
        return null;
      }
      // eslint-disable-next-line no-console
      console.warn(
        "Insert text is not started with prefix or ended with suffix.",
        content
      );
    } else {
      // eslint-disable-next-line no-console
      console.error("No code block found in response.", content);
    }
  } else {
    // eslint-disable-next-line no-console
    console.error("Unexpected response:", response);
  }
  return null;
}
