import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { DEFAULT_SYSTEM_PROMPT } from "./prompt.js";

export const SUPPORTED_LANGUAGES = Object.freeze([
  "typescript",
  "javascript",
  "brick_next_yaml",
]);

export type IHttpAbortError = {
  new (message: string): Error;
};

export type ChatRequest = (
  options: ChatRequestOptions
) => Promise<string | null | undefined>;

export interface ChatRequestOptions {
  model?: string;
  temperature?: number;
  system?: string;
  prompt?: string;
  signal?: AbortSignal;
}

export interface MonacoCopilotProviderOptions {
  HttpAbortError: IHttpAbortError;
  request: ChatRequest;
  model?: string;
  debounce?: number;
  timeout?: number;
}

export class MonacoCopilotProvider
  implements monaco.languages.InlineCompletionsProvider
{
  #timer: null | ReturnType<typeof setTimeout> = null;
  #previousResolve:
    | null
    | ((value: monaco.languages.InlineCompletions | null) => void) = null;
  #debounce: number;
  #timeout: number;
  #HttpAbortError: IHttpAbortError;
  #request: ChatRequest;
  #model: string;

  constructor(options: MonacoCopilotProviderOptions) {
    this.#debounce = options.debounce ?? 750;
    this.#HttpAbortError = options.HttpAbortError;
    this.#request = options.request;
    this.#model = options.model ?? "qwen-coder-turbo";
    this.#timeout = options.timeout ?? 1.2e4;
  }

  async provideInlineCompletions(
    model: monaco.editor.IModel,
    position: monaco.Position,
    ctx: monaco.languages.InlineCompletionContext,
    token: monaco.CancellationToken
  ) {
    const abortCtrl = new AbortController();

    token.onCancellationRequested(() => {
      abortCtrl.abort();
    });

    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#previousResolve?.(null);
      this.#timer = null;
      this.#previousResolve = null;
    }

    const promise = new Promise<monaco.languages.InlineCompletions | null>(
      (resolve) => {
        this.#previousResolve = resolve;

        this.#timer = setTimeout(async () => {
          this.#timer = null;
          this.#previousResolve = null;

          if (token.isCancellationRequested) {
            resolve(null);
          }

          const requestTimeout = setTimeout(() => {
            abortCtrl.abort();
          }, this.#timeout);

          try {
            const edit = await getInlineEdit({
              request: this.#request,
              model: this.#model,
              source: model.getValue(),
              offset: model.getOffsetAt(position),
              language: model.getLanguageId(),
              signal: abortCtrl.signal,
            });

            if (!edit) {
              return null;
            }

            resolve({
              enableForwardStability: true,
              items: [
                {
                  insertText: edit.insertText,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column - edit.prefixOffset,
                    position.lineNumber,
                    position.column
                  ),
                },
              ],
            });
          } catch (error) {
            if (!(error instanceof this.#HttpAbortError)) {
              // eslint-disable-next-line no-console
              console.error("Error fetching inline completion:", error);
            }
            resolve(null);
          } finally {
            clearTimeout(requestTimeout);
          }
        }, this.#debounce);
      }
    );

    return promise;
  }

  freeInlineCompletions() {
    // Do nothing
  }
}

interface InlineEditResult {
  insertText: string;
  prefixOffset: number;
  suffixOffset: number;
}

async function getInlineEdit({
  request,
  model,
  source,
  language,
  offset,
  signal,
}: {
  request: ChatRequest;
  model: string;
  source: string;
  language: string;
  offset: number;
  signal: AbortSignal;
}): Promise<InlineEditResult | null> {
  const prefix = source.slice(0, offset);
  const suffix = source.slice(offset);
  const context =
    language === "brick_next_yaml"
      ? "# File: config.yaml\n"
      : `// File utils.${language === "javascript" ? "js" : "ts"}\n`;
  const content = await request({
    model,
    system: DEFAULT_SYSTEM_PROMPT[language],
    prompt: `<|fim_prefix|>${context}${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`,
    temperature: 0.2,
    signal,
  });
  return postProcessEdit(content, prefix, suffix, context);
}

function postProcessEdit(
  content: string | null | undefined,
  prefix: string,
  suffix: string,
  context: string
): InlineEditResult | null {
  const matches = content?.match(
    /(?:^|\n)```(?:\w*)\n([\s\S]*?)(?:\n```(?:\n|$)|$)/
  );
  if (!matches) {
    // eslint-disable-next-line no-console
    console.error("No code block found in response.", content);
    return null;
  }

  const full = matches[1].startsWith(context)
    ? matches[1].slice(context.length)
    : matches[1];
  const trimmedFull = full.trim();
  const trimmedPrefix = prefix.trimStart();
  const trimmedSuffix = suffix.trimEnd();

  if (trimmedFull.startsWith(trimmedPrefix)) {
    // Case 1: responded with full source code.
    if (trimmedFull.endsWith(trimmedSuffix)) {
      const insertText = trimmedFull.slice(
        trimmedPrefix.length,
        trimmedFull.length - trimmedSuffix.length
      );
      return refineResult({
        insertText,
        prefixOffset: 0,
        suffixOffset: 0,
      });
    }

    // Case 2: responded with prefix code and insertion, but with no suffix code.
    if (trimmedFull.length - trimmedPrefix.length < trimmedSuffix.length) {
      const insertText = trimmedFull.slice(trimmedPrefix.length);
      return refineResult({
        insertText,
        prefixOffset: 0,
        suffixOffset: 0,
      });
    }
  }

  // Case 3: responded with prefix code only.
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

  // Case 4: responded with partial source code.
  /* if (!trimmedPrefixLastLine) {
    // Case 4.1: prefix is an empty line
  } else  */ if (trimmedFull.startsWith(trimmedPrefixLastLine)) {
    // Case 4.2: with original content for the current line.
    const insertText = trimmedFull
      .split("\n")
      .map((line, index) => (index === 0 ? line : `${leadingSpaces}${line}`))
      .join("\n");

    if (/\S/.test(insertText)) {
      return {
        insertText,
        prefixOffset: trimmedPrefixLastLine.length,
        suffixOffset: 0,
      };
    }
  } else if (trimmedFull.length < (prefix.length + suffix.length) / 2) {
    // Spacial detection: returned code is way more less than the original code.
    // Case 4.3: without original content for the current line.
    const insertText = trimmedFull
      .split("\n")
      .map((line, index) => (index === 0 ? line : `${leadingSpaces}${line}`))
      .join("\n");
    return refineResult({
      insertText,
      prefixOffset: 0,
      suffixOffset: 0,
    });
  }
  // eslint-disable-next-line no-console
  console.warn(
    "Response is not started with prefix or ended with suffix or partial.",
    content
  );
  return null;
}

function refineResult(result: InlineEditResult): InlineEditResult | null {
  if (/\S/.test(result.insertText)) {
    return result;
  }
  // eslint-disable-next-line no-console
  console.log("Empty insertText");
  return null;
}
