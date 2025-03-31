import { diffLines, type Change } from "diff";

type ChangeAction = "added" | "removed" | "unchanged";

/**
 * Post process the response from AI to get the insertion text around the cursor.
 *
 * The AI response may:
 * 1) contains full original source code combined with the insertions (as well as insertions outside the cursor).
 * 2) contains the insertions with several lines of source code as context before and after the cursor.
 * 3) contains only the insertions.
 *
 * @param response The AI response text to be post-processed.
 * @param originalPrefix The original source code before the cursor.
 * @param originalSuffix The original source code after the cursor.
 * @returns The processed insertion text or null if no valid insertion is found.
 */
export function postProcessByDiff(
  response: string,
  originalPrefix: string,
  originalSuffix: string
): string | null {
  const trimmedResponse = response.replace(/^\n+|\n+$/g, "");
  const trimmedOriginalPrefix = originalPrefix.replace(/^\n+/g, "");
  const trimmedOriginalSuffix = originalSuffix.replace(/\n+$/g, "");
  const responseLines = trimmedResponse.split("\n");
  const trimmedPrefixLines = trimmedOriginalPrefix.split("\n");
  const trimmedSuffixLines = trimmedOriginalSuffix.split("\n");
  const cursorLineNumber = trimmedPrefixLines.length;

  const diffLinesOffset = Math.max(
    0,
    trimmedPrefixLines.length - responseLines.length
  );
  const truncatedPrefix =
    diffLinesOffset > 0
      ? trimmedPrefixLines.slice(diffLinesOffset).join("\n")
      : trimmedOriginalPrefix;
  const truncatedSuffix =
    trimmedSuffixLines.length > responseLines.length
      ? trimmedSuffixLines.slice(0, responseLines.length).join("\n")
      : trimmedOriginalSuffix;
  const truncatedSource = `${truncatedPrefix}${truncatedSuffix}`;

  // First, find out the insertion by comparing the diff, this resolves situation 1) and 2).
  const changes = diffLines(truncatedSource, trimmedResponse, {
    ignoreWhitespace: true,
  }) as Required<Change>[];

  let oldLineIndex = diffLinesOffset;
  let afterCursor = false;
  let lastAction: ChangeAction = "unchanged";
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    lastAction = change.removed
      ? "removed"
      : change.added
        ? "added"
        : "unchanged";
    const nextChange = changes[i + 1];
    const nextAction = nextChange?.removed
      ? "removed"
      : nextChange?.added
        ? "added"
        : "unchanged";
    if (lastAction !== "added") {
      oldLineIndex += change.count;
    } else if (i === 0 && changes.length === 1) {
      oldLineIndex++;
    }
    if (!afterCursor) {
      afterCursor = oldLineIndex >= cursorLineNumber;
      if (afterCursor) {
        const offset = oldLineIndex - cursorLineNumber;
        if (
          (lastAction === "unchanged" &&
            offset === 0 &&
            nextAction === "added") ||
          (lastAction === "added" && offset === 0) ||
          (lastAction === "removed" && nextAction === "added")
        ) {
          const update = lastAction === "added" ? change : nextChange;
          const fullFixedUpdateValue = `${
            lastAction === "unchanged"
              ? `${change.value.replace(/\n$/, "").split("\n").pop()!}\n`
              : ""
          }${update.value.replace(/\n$/, "")}`;
          const updatedLines = fullFixedUpdateValue.split("\n");
          const lastUpdatedLine = updatedLines[updatedLines.length - 1];
          // Original
          const originalLinePrefix = trimmedPrefixLines[cursorLineNumber - 1];
          const originalLineSuffix = trimmedSuffixLines[0];

          const {
            trimmed: lastUpdatedLineTrimmed,
            trailing: lastUpdatedLineTrailing,
          } = trimWithInfo(lastUpdatedLine);
          const {
            trimmed: originalLinePrefixTrimmed,
            leading: originalLinePrefixLeading,
            trailing: originalLinePrefixTrailing,
          } = trimWithInfo(originalLinePrefix);
          const {
            trimmed: originalLineSuffixTrimmed,
            leading: originalLineSuffixLeading,
          } = trimWithInfo(originalLineSuffix);

          for (let j = 0; j < updatedLines.length; j++) {
            const firstUpdatedLine = updatedLines[j];
            const {
              trimmed: firstUpdatedLineTrimmed,
              leading: firstUpdatedLineLeading,
            } = trimWithInfo(firstUpdatedLine);
            if (
              firstUpdatedLineTrimmed.startsWith(originalLinePrefixTrimmed) &&
              lastUpdatedLineTrimmed.endsWith(originalLineSuffixTrimmed)
            ) {
              const fixedUpdateValue = updatedLines.slice(j).join("\n");
              const start =
                firstUpdatedLineLeading.length +
                originalLinePrefixTrimmed.length;
              const end =
                fixedUpdateValue.length -
                (lastUpdatedLineTrailing.length +
                  originalLineSuffixTrimmed.length);
              const restUpdate = fixedUpdateValue.slice(start, end);
              const {
                leading: restUpdateLeading,
                trailing: restUpdateTrailing,
              } = trimWithInfo(restUpdate);

              const insertText = restUpdate.slice(
                Math.min(
                  restUpdateLeading.length,
                  originalLinePrefixTrailing.length
                ),
                restUpdate.length -
                  Math.min(
                    restUpdateTrailing.length,
                    originalLineSuffixLeading.length
                  )
              );

              if (
                originalLinePrefixLeading.length >
                  firstUpdatedLineLeading.length &&
                firstUpdatedLineTrimmed.length > 0 &&
                originalLinePrefixTrimmed.length > 0 &&
                originalLinePrefixLeading.startsWith(firstUpdatedLineLeading)
              ) {
                const leadingSpaces = originalLinePrefixLeading.slice(
                  firstUpdatedLineLeading.length
                );
                return insertText
                  .split("\n")
                  .map((line, index) =>
                    index === 0 ? line : `${leadingSpaces}${line}`
                  )
                  .join("\n");
              }

              return insertText;
            }
          }
        }
        break;
      }
    }
  }

  // Maybe the response is insertion only, that's the situation 3).
  // TODO: check whether it's syntax correct after the insertion?
  const unchangedCount = changes
    .filter((change) => !(change.added || change.removed))
    .reduce((acc, change) => acc + change.count, 0);
  const truncatedLines = truncatedSource.split("\n");
  if (unchangedCount / truncatedLines.length < 0.2) {
    const insertText = trimmedResponse.trimStart();
    // Keep the original indentation.
    const leadingSpaces =
      trimmedPrefixLines[trimmedPrefixLines.length - 1].match(/^\s+/)?.[0] ??
      "";
    return leadingSpaces
      ? insertText
          .split("\n")
          .map((line, index) =>
            index === 0 ? line : `${leadingSpaces}${line}`
          )
          .join("\n")
      : insertText;
  }

  return null;
}

function trimWithInfo(content: string): {
  trimmed: string;
  leading: string;
  trailing: string;
} {
  let leading = "";
  let trailing = "";
  const trimmed = content
    .replace(/^\s+/, (match) => {
      leading = match;
      return "";
    })
    .replace(/\s+$/, (match) => {
      trailing = match;
      return "";
    });

  return { trimmed, leading, trailing };
}
