import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { HttpAbortError } from "@next-core/http";
import { getInlineEdit } from "./getInlineEdit";

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
            const edit = await getInlineEdit({
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
              items: [getInlineCompletion(model, position, edit)],
            });
          } catch (error) {
            if (!(error instanceof HttpAbortError)) {
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

function getInlineCompletion(
  model: monaco.editor.IModel,
  position: monaco.Position,
  inlineEdit: string
): monaco.languages.InlineCompletion {
  const prefix = model.getValueInRange(
    new monaco.Range(
      position.lineNumber,
      1,
      position.lineNumber,
      position.column
    )
  );
  let leadingSpaces = prefix.match(/^\s+/);

  const editLines = inlineEdit.split("\n");
  const comparePreviousLine =
    !/\S/.test(prefix) && position.lineNumber > 1 && editLines.length > 1;
  let insertText = inlineEdit;
  let firstLineEdit = editLines[0];

  if (comparePreviousLine) {
    // The current line has spaces only
    const previousLineNumber = position.lineNumber - 1;
    const previousLine = model.getValueInRange(
      new monaco.Range(
        previousLineNumber,
        1,
        previousLineNumber,
        model.getLineLength(previousLineNumber) + 1
      )
    );
    if (previousLine.trim() === editLines[0].trim()) {
      leadingSpaces = previousLine.match(/^\s+/);
      insertText = editLines.slice(1).join("\n");
      firstLineEdit = editLines[1];
    }
  }

  if (insertText) {
    insertText = insertText
      .split("\n")
      .map((line, index) => (index === 0 ? line : `${leadingSpaces}${line}`))
      .join("\n");
  }

  const prefixChunks = getChunksWithMergedSpaces(prefix);
  const firstLineEditChunks = getChunksWithMergedSpaces(firstLineEdit);

  const minPrefixOffset = Math.min(
    prefixChunks.length,
    firstLineEditChunks.length
  );
  let prefixOffset = 0;
  for (let i = minPrefixOffset; i > 0; i--) {
    const editChunks = firstLineEditChunks.slice(0, i);
    if (chunksEndWith(prefixChunks, editChunks)) {
      prefixOffset = editChunks.reduce(
        (acc, chunk) => acc + chunk.content.length,
        0
      );
      break;
    }
  }

  let suffixOffset = 0;
  if (prefixOffset < firstLineEdit.length) {
    const suffix = model.getValueInRange(
      new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        model.getLineLength(position.lineNumber) + 1
      )
    );
    const suffixChunks = getChunksWithMergedSpaces(suffix);
    const firstLineRemaining = firstLineEdit.slice(prefixOffset);
    const firstLineRemainingChunks =
      getChunksWithMergedSpaces(firstLineRemaining);
    const minSuffixOffset = Math.min(
      suffixChunks.length,
      firstLineRemainingChunks.length
    );
    for (let i = minSuffixOffset; i > 0; i--) {
      const editChunks = firstLineRemainingChunks.slice(-i);
      if (chunksEndWith(suffixChunks, editChunks)) {
        suffixOffset = editChunks.reduce(
          (acc, chunk) => acc + chunk.content.length,
          0
        );
        break;
      }
    }
  }

  return {
    insertText,
    range: new monaco.Range(
      position.lineNumber,
      position.column - prefixOffset,
      position.lineNumber,
      position.column + suffixOffset
    ),
  };
}

export function getChunksWithMergedSpaces(content: string) {
  const regex = /\s+/g;
  const chunks: ChunkWithMergedSpaces[] = [];
  let match: RegExpExecArray | null = null;
  let lastIndex = (regex.lastIndex = 0);
  while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (start > lastIndex) {
      chunks.push(
        ...[...content.slice(lastIndex, start)].map((str) => ({
          content: str,
          space: false,
        }))
      );
    }
    chunks.push({ content: content.slice(start, end), space: true });
    lastIndex = end;
  }
  if (lastIndex < content.length) {
    chunks.push(
      ...[...content.slice(lastIndex)].map((str) => ({
        content: str,
        space: false,
      }))
    );
  }
  return chunks;
}

interface ChunkWithMergedSpaces {
  content: string;
  space: boolean;
}

function chunksEndWith(
  source: ChunkWithMergedSpaces[],
  target: ChunkWithMergedSpaces[]
) {
  if (source.length < target.length) {
    return false;
  }
  for (let i = 0; i < target.length; i++) {
    if (
      source[source.length - 1 - i].content !==
      target[target.length - 1 - i].content
    ) {
      return false;
    }
  }
  return true;
}
