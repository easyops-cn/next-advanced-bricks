import type { DataPart, Message } from "../interfaces";

export const getToolDataProgress = (
  toolCallMessages: Message[] | undefined
): DataPart | undefined => {
  let progressPart: DataPart | undefined;
  toolCallMessages?.findLast((message) => {
    progressPart = message.parts?.findLast((part) => {
      return part.type === "data" && part.data?.type === "progress";
    }) as DataPart | undefined;
    return !!progressPart;
  });
  return progressPart;
};
