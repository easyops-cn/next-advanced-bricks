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
      // model: "qwen-plus",
      model: "claude-3-5-sonnet-latest",
      stream: false,
      messages: [
        {
          role: "system",
          content: `你是一个编程助手，主要用于 Visual Builder 中的 TypeScript/JavaScript 函数的代码补全。

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
      return matches[1];
    }
  }

  // eslint-disable-next-line no-console
  console.error("Unexpected response:", response);
  return null;
}
