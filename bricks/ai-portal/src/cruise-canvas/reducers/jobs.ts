import type { Reducer } from "react";
import { isEqual, isMatchWith, pick, pull } from "lodash";
import type {
  ComponentGraph,
  ComponentGraphEdge,
  ComponentGraphNode,
  DataPart,
  Job,
  JobPatch,
  Message,
  Part,
  RawComponentGraphNode,
  TextPart,
} from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";

export const jobs: Reducer<Job[], CruiseCanvasAction> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const jobsPatch = action.payload.jobs;
      let jobs = action.isInitial ? [] : state;

      if (!Array.isArray(jobsPatch) || jobsPatch.length === 0) {
        return jobs;
      }
      const previousComponentGraph = state.findLast(
        (job) => !!job.componentGraph
      )?.componentGraph;

      for (const jobPatch of jobsPatch) {
        const previousJobIndex =
          jobs?.findIndex((job) => job.id === jobPatch.id) ?? -1;
        const { messages: messagesPatch, toolCall } = jobPatch;

        if (typeof toolCall?.arguments === "string") {
          toolCall.originalArguments = toolCall.arguments;
          try {
            toolCall.arguments = JSON.parse(toolCall.arguments);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to parse toolCall arguments:", e);
            toolCall.arguments = {};
            toolCall.argumentsParseFailed = true;
            toolCall.argumentsParseError = e;
          }
        }

        if (previousJobIndex === -1) {
          const patch = {
            ...jobPatch,
          };
          const componentGraph = getJobComponentGraph(
            messagesPatch ?? [],
            previousComponentGraph
          );
          if (componentGraph) {
            patch.componentGraph = componentGraph;
          }
          if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
            jobs = [
              ...jobs,
              {
                ...patch,
                messages: mergeMessages(messagesPatch),
              } as Job,
            ];
          } else {
            jobs = [...jobs, patch as Job];
          }
        } else {
          const previousJob = jobs[previousJobIndex];
          const restMessagesPatch: JobPatch = pick(jobPatch, [
            "id",
            "upstream",
            "parent",
            "state",
            "instruction",
            "toolCall",
            "isError",
            "startTime",
            "endTime",
          ]);
          if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
            restMessagesPatch.messages = mergeMessages([
              ...(previousJob.messages ?? []),
              ...messagesPatch,
            ]);
          }

          const componentGraph = getJobComponentGraph(
            [...(previousJob.messages ?? []), ...(messagesPatch ?? [])],
            previousComponentGraph
          );
          if (componentGraph) {
            restMessagesPatch.componentGraph = componentGraph;
          }

          if (!isMatchWith(previousJob, restMessagesPatch, isEqual)) {
            jobs = [
              ...jobs.slice(0, previousJobIndex),
              {
                ...previousJob,
                ...restMessagesPatch,
              },
              ...jobs.slice(previousJobIndex + 1),
            ];
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
      merged.push({ ...message });
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
  let previousDataType: string | undefined;
  for (const part of parts) {
    if (previousType === "text" && part.type === "text") {
      const lastPart = merged[merged.length - 1] as TextPart;
      lastPart.text += part.text;
    } else if (
      // Assert: previousType is data when previousDataType is defined
      previousDataType === "stream" &&
      part.type === "data" &&
      part.data?.type === "stream"
    ) {
      const lastPart = merged[merged.length - 1] as DataPart;
      lastPart.data.message += part.data.message;
    } else {
      merged.push({ ...part });
    }

    previousType = part.type;
    previousDataType = part.type === "data" ? part.data?.type : undefined;
  }
  return merged;
}

function getJobComponentGraph(
  messages: Message[],
  previousGraph: ComponentGraph | undefined
): ComponentGraph | undefined {
  let graph = previousGraph;
  let hasGraph = false;
  for (const message of messages) {
    if (message.role === "tool") {
      for (const part of message.parts) {
        if (part.type === "data" && part.data?.type === "graph") {
          const msg = part.data.message;
          switch (msg?.type) {
            case "component_graph": {
              const nodes: ComponentGraphNode[] = [];
              const edges: ComponentGraphEdge[] = [];
              for (const node of Object.values(
                msg.data
              ) as RawComponentGraphNode[]) {
                // Remove self-references
                if (Array.isArray(node.children)) {
                  pull(node.children, node.id);
                }

                nodes.push({
                  type: "node",
                  id: node.id,
                  data: node,
                });
                edges.push(
                  ...(node.children?.map<ComponentGraphEdge>((target) => ({
                    type: "edge",
                    source: node.id,
                    target: target,
                  })) ?? [])
                );
              }
              graph = { nodes, edges, initial: true };
              hasGraph = true;
              break;
            }
            case "component_graph_node": {
              if (graph) {
                const nodeIndex = graph.nodes.findIndex(
                  (n) => n.id === msg.data.component
                );
                if (nodeIndex !== -1) {
                  const node = graph.nodes[nodeIndex];
                  if (node.data.status !== msg.data.status) {
                    graph = {
                      nodes: [
                        ...graph.nodes.slice(0, nodeIndex),
                        {
                          ...node,
                          data: {
                            ...node.data,
                            status: msg.data.status,
                          },
                        },
                        ...graph.nodes.slice(nodeIndex + 1),
                      ],
                      edges: graph.edges,
                      initial: false,
                    };
                  }
                }
                hasGraph = true;
              }
            }
          }
        }
      }
    }
  }
  return hasGraph ? graph : undefined;
}
