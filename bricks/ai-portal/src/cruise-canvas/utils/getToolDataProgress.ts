import { DataPart, Message } from "../interfaces";

export const getToolDataProgress = (toolCallMessages: Message[]) => {
  return toolCallMessages?.[0]?.parts
    ? (toolCallMessages?.[0]?.parts?.filter(
        (part) => part.type === "data" && part.data?.type === "progress"
      ) as DataPart[])
    : [];
};

export const getlastProgress = (toolDataProgress: DataPart[]) => {
  return toolDataProgress?.at(-1);
};
