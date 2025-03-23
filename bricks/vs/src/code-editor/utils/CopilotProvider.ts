import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
// import { getInlineEdit } from "./getInlineEdit";
import { getFullEdit } from "./getFullEdit";

export class CopilotProvider
  implements monaco.languages.InlineCompletionsProvider
{
  #timer: null | ReturnType<typeof setTimeout> = null;
  #previousResolve:
    | null
    | ((value: monaco.languages.InlineCompletions | null) => void) = null;
  #debounce: number = 500;

  async provideInlineCompletions(
    model: monaco.editor.IModel,
    position: monaco.Position,
    context: monaco.languages.InlineCompletionContext,
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
          }, 3e4);

          try {
            const source = model.getValue();
            // const lineContent = model.getLineContent(position.lineNumber);

            const edit = await getFullEdit({
              source,
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
                  insertText: edit,
                  range: model.getFullModelRange(),
                },
              ],
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error fetching inline completion:", error);
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
