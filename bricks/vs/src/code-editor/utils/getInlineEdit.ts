import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";

export interface InlineEditResult {
  insertText: string;
  prefixOffset: number;
  suffixOffset: number;
}

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
}): Promise<InlineEditResult | null> {
  const prefix = source.slice(0, offset);
  const suffix = source.slice(offset);
  const context =
    language === "brick_next_yaml"
      ? "# File: props.yaml\n"
      : `// File utils.${language === "javascript" ? "js" : "ts"}\n`;
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
          content: `<|fim_prefix|>${context}${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`,
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
    const matches = content.match(
      /(?:^|\n)```(?:\w*)\n([\s\S]*?)(?:\n```(?:\n|$)|$)/
    );
    if (matches) {
      const full = matches[1].startsWith(context)
        ? matches[1].slice(context.length)
        : matches[1];
      const trimmedFull = full.trim();
      const trimmedPrefix = prefix.trimStart();
      const trimmedSuffix = suffix.trimEnd();

      // Case 1: responded with full source code.
      if (
        trimmedFull.startsWith(trimmedPrefix) &&
        trimmedFull.endsWith(trimmedSuffix)
      ) {
        const insertText = trimmedFull.slice(
          trimmedPrefix.length,
          trimmedFull.length - trimmedSuffix.length
        );
        if (/\S/.test(insertText)) {
          return {
            insertText,
            prefixOffset: 0,
            suffixOffset: 0,
          };
        }
        // eslint-disable-next-line no-console
        console.log("Empty insertText");
        return null;
      }

      // Case 2: responded with prefix source code only.
      const allTrimmedPrefix = trimmedPrefix.trimEnd();
      if (
        trimmedFull.length === allTrimmedPrefix.length &&
        trimmedFull === allTrimmedPrefix
      ) {
        // eslint-disable-next-line no-console
        console.log("Empty insertText");
        return null;
      }

      const prefixLastLine = prefix.slice(prefix.lastIndexOf("\n") + 1);
      const trimmedPrefixLastLine = prefixLastLine.trimStart();
      const insertLeadingSpaces = full.match(/^\s+/)?.[0] ?? "";
      const prefixLeadingSpaces = prefixLastLine.match(/^\s+/)?.[0] ?? "";
      const leadingSpaces =
        insertLeadingSpaces.length >= prefixLeadingSpaces.length
          ? ""
          : prefixLeadingSpaces.startsWith(insertLeadingSpaces)
            ? prefixLeadingSpaces.slice(insertLeadingSpaces.length)
            : prefixLeadingSpaces;

      // Case 3: responded with partial source code.
      if (trimmedFull.startsWith(trimmedPrefixLastLine)) {
        // Case 3.1: with original content for the current line.
        const insertText = trimmedFull
          .split("\n")
          .map((line, index) =>
            index === 0 ? line : `${leadingSpaces}${line}`
          )
          .join("\n");

        if (/\S/.test(insertText)) {
          return {
            insertText,
            prefixOffset: trimmedPrefixLastLine.length,
            suffixOffset: 0,
          };
        }
      } else if (trimmedFull.length < source.length / 2) {
        // Spacial detection: returned code is way more less than the original code.
        // Case 3.2: without original content for the current line.
        const insertText = trimmedFull
          .split("\n")
          .map((line, index) =>
            index === 0 ? line : `${leadingSpaces}${line}`
          )
          .join("\n");
        if (/\S/.test(insertText)) {
          return {
            insertText,
            prefixOffset: 0,
            suffixOffset: 0,
          };
        }
      }
      // eslint-disable-next-line no-console
      console.warn(
        "Response is not started with prefix or ended with suffix or partial.",
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
