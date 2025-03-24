import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";
import system from "./system.txt";
import functionDesc from "./function.txt";

const CURSOR_PLACEHOLDER = "<|developer_cursor_is_here|>";

export async function getFullEdit({
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
      stream: false,
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: `Developer cursor is marked as \`<|developer_cursor_is_here|>\`.

${"```"}${language}
${source.slice(0, offset)}${CURSOR_PLACEHOLDER}${source.slice(offset)}
${"```"}`,
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
    },
    {
      signal,
      interceptorParams: {
        ignoreLoadingBar: true,
      },
    }
  );

  const toolCalls = response.choices?.[0]?.message?.tool_calls;
  if (toolCalls?.length) {
    const toolCall = toolCalls[0];
    if (
      toolCall.type === "function" &&
      toolCall.function?.name === "edit_file"
    ) {
      const args = JSON.parse(toolCall.function.arguments!) as {
        code_edit: string;
        instructions: string;
      };
      return applyFullEdit({
        source,
        language,
        signal,
        instruction: args.instructions,
        edit: args.code_edit,
      });
    }
  }

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

async function applyFullEdit({
  source,
  language,
  instruction,
  edit,
  signal,
}: {
  source: string;
  language: string;
  instruction: string;
  edit: string;
  signal: AbortSignal;
}): Promise<string | null> {
  const response = await AiopsBaseApi_openaiChat(
    {
      model: "qwen-turbo",
      // model: "qwen-plus",
      // model: "claude-3-5-sonnet-latest",
      stream: false,
      messages: [
        {
          role: "system",
          content: `你是一个编程助手，主要用于 Visual Builder 中的 TypeScript/JavaScript 函数的修改。

你将得到一条指引、文件名、修改前的代码、以及修改部分（可能包含几行未变更的代码作为上下文参考），你负责返回最终修改后的完整代码。如无必要，不要删除原代码内容，即使是注释。

仅输出完整的修改后的代码，而不输出任何附加说明。`,
        },
        {
          role: "user",
          content: `${instruction}

${"```"}${language}
${source}
${"```"}

Apply the following edit:

${"```"}${language}
${edit}
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
      // console.log(source);
      // console.log(matches[1]);

      return matches[1];
    }
  }

  // eslint-disable-next-line no-console
  console.error("Unexpected response:", response);
  return null;
}
