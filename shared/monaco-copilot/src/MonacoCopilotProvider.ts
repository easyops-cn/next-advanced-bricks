// istanbul ignore file: experimental
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { DEFAULT_SYSTEM_PROMPT } from "./prompt.js";
import { postProcessByDiff } from "./postProcessByDiff.js";

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

          const language = model.getLanguageId();
          const source = model.getValue();
          const lineContent = model.getLineContent(position.lineNumber);
          if (
            // Ignore empty source code.
            source.trim().length === 0 ||
            // For these use cases (generally end of a statement/declaration line),
            // the AI model would not respond in time currently.
            (position.column === model.getLineLength(position.lineNumber) + 1 &&
              (language === "brick_next_yaml"
                ? /\s+%>\s*$/.test(lineContent)
                : /[;,}\]]\s*$/.test(lineContent)))
          ) {
            resolve(null);
            return;
          }

          const requestTimeout = setTimeout(() => {
            abortCtrl.abort();
          }, this.#timeout);

          try {
            const edit = await getInlineEdit({
              request: this.#request,
              model: this.#model,
              source,
              offset: model.getOffsetAt(position),
              language,
              signal: abortCtrl.signal,
            });

            if (!edit) {
              return null;
            }

            resolve({
              enableForwardStability: true,
              items: [
                {
                  insertText: edit,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
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
}): Promise<string | null> {
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

  const matches = content?.match(
    /(?:^|\n)```(?:\w*)\n([\s\S]*?)(?:\n```(?:\n|$)|$)/
  );
  if (!matches) {
    // eslint-disable-next-line no-console
    console.error("No code block found in response.", content);
    return null;
  }

  const response = matches[1].startsWith(context)
    ? matches[1].slice(context.length)
    : matches[1];

  const insertText = postProcessByDiff(response, prefix, suffix);

  if (insertText && /\S/.test(insertText)) {
    return insertText;
  }

  // eslint-disable-next-line no-console
  console.warn("Response is invalid:", content);
  return null;
}
