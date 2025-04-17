import type { Reducer } from "react";
import type { Job, JobPatch, Message, Part, TextPart } from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";
import { isMatch, pick } from "lodash";

export const jobs: Reducer<Job[], CruiseCanvasAction> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const jobsPatch = action.payload.jobs;
      if (!Array.isArray(jobsPatch) || jobsPatch.length === 0) {
        return state;
      }

      let jobs = state;

      for (const jobPatch of jobsPatch) {
        const previousJobIndex = jobs?.findIndex((job) => job.id === jobPatch.id) ?? -1;
        const { messages: messagesPatch } = jobPatch;
        if (previousJobIndex === -1) {
          if (Array.isArray(messagesPatch) && messagesPatch.length > 1) {
            jobs = [...jobs, {
              ...jobPatch,
              messages: mergeMessages(messagesPatch),
            } as Job];
          } else {
            jobs = [...jobs, jobPatch as Job];
          }
        } else {
          const previousJob = jobs[previousJobIndex];
          const restMessagesPatch: JobPatch = pick(jobPatch, [
            "id",
            "parent",
            "state",
            "instruction",
            "toolCall",
          ]);
          if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
            restMessagesPatch.messages = mergeMessages([...(previousJob.messages ?? []), ...messagesPatch]);
          }
          if (!isMatch(previousJob, restMessagesPatch)) {
            jobs = [...jobs.slice(0, previousJobIndex), {
              ...previousJob,
              ...restMessagesPatch,
            }, ...jobs.slice(previousJobIndex + 1)];
          }
        }
      }

      return jobs;
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};

function mergeMessages(messages: Message[]): Message[] {
  const merged: Message[] = [];
  let previousRole: Message["role"] | undefined;
  for (const message of messages) {
    if (!previousRole || previousRole !== message.role) {
      merged.push({...message});
    } else {
      const lastMessage = merged[merged.length - 1];
      lastMessage.parts = [...lastMessage.parts, ...message.parts];
    }
    previousRole = message.role;
  }

  for (const message of merged) {
    message.parts = mergeMessageParts(message.parts);
  }

  return merged;
}

function mergeMessageParts(parts: Part[]): Part[] {
  const merged: Part[] = [];
  let previousType: Part["type"] | undefined;
  for (const part of parts) {
    if (!previousType || previousType !== part.type || part.type !== "text") {
      merged.push({...part});
    } else {
      const lastPart = merged[merged.length - 1] as TextPart;
      lastPart.text += part.text;
    }
    previousType = part.type;
  }
  return merged;
}
