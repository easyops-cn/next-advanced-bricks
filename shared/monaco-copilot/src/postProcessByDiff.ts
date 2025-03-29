import { diffLines, type Change } from "diff";

type ChangeAction = "added" | "removed" | "unchanged";

export function postProcessByDiff(
  trimmedResponse: string,
  trimmedOriginalPrefix: string,
  trimmedOriginalSuffix: string
): string | null {
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

  const changes = diffLines(
    `${truncatedPrefix}${truncatedSuffix}`,
    trimmedResponse,
    {
      ignoreWhitespace: true,
    }
  ) as Required<Change>[];

  let oldLineIndex = diffLinesOffset;
  let afterCursor = false;
  let lastAction: ChangeAction = "unchanged";
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    afterCursor = oldLineIndex >= cursorLineNumber;
    lastAction = change.removed
      ? "removed"
      : change.added
        ? "added"
        : "unchanged";
    if (lastAction !== "added") {
      oldLineIndex += change.count;
    } else if (i === 0) {
      oldLineIndex++;
    }
    if (!afterCursor) {
      afterCursor = oldLineIndex >= cursorLineNumber;
      if (afterCursor) {
        const offset = oldLineIndex - cursorLineNumber;
        const nextChange = changes[i + 1];
        const nextAction = nextChange?.removed
          ? "removed"
          : nextChange?.added
            ? "added"
            : "unchanged";
        if (
          (lastAction === "unchanged" &&
            offset === 0 &&
            nextAction === "added") ||
          (lastAction === "added" && offset === 0) ||
          (lastAction === "removed" && nextAction === "added")
        ) {
          const update = lastAction === "added" ? change : nextChange;
          const fixedUpdateValue = `${
            lastAction === "unchanged"
              ? `${change.value.replace(/\n$/, "").split("\n").pop()!}\n`
              : ""
          }${update.value.replace(/\n$/, "")}`;
          const updatedLines = fixedUpdateValue.split("\n");
          const firstUpdatedLine = updatedLines[0];
          const lastUpdatedLine = updatedLines[updatedLines.length - 1];
          // Original
          const originalLinePrefix = trimmedPrefixLines[cursorLineNumber - 1];
          const originalLineSuffix = trimmedSuffixLines[0];

          const {
            trimmed: firstUpdatedLineTrimmed,
            leading: firstUpdatedLineLeading,
          } = trimWithInfo(firstUpdatedLine);
          const {
            trimmed: lastUpdatedLineTrimmed,
            trailing: lastUpdatedLineTrailing,
          } = trimWithInfo(lastUpdatedLine);
          const {
            trimmed: originalLinePrefixTrimmed,
            trailing: originalLinePrefixTrailing,
          } = trimWithInfo(originalLinePrefix);
          const {
            trimmed: originalLineSuffixTrimmed,
            leading: originalLineSuffixLeading,
          } = trimWithInfo(originalLineSuffix);

          if (
            firstUpdatedLineTrimmed.startsWith(originalLinePrefixTrimmed) &&
            lastUpdatedLineTrimmed.endsWith(originalLineSuffixTrimmed)
          ) {
            const start =
              firstUpdatedLineLeading.length + originalLinePrefixTrimmed.length;
            const end =
              fixedUpdateValue.length -
              (lastUpdatedLineTrailing.length +
                originalLineSuffixTrimmed.length);
            const restUpdate = fixedUpdateValue.slice(start, end);
            const { leading: restUpdateLeading, trailing: restUpdateTrailing } =
              trimWithInfo(restUpdate);

            return restUpdate.slice(
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
          }
        }
        break;
      }
    }
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
