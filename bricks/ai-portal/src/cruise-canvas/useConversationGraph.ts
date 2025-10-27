import { useMemo } from "react";
import type {
  GraphEdge,
  GraphNode,
  GraphNavItem,
  GraphGeneratedView,
} from "./interfaces";
import { LOADING_NODE_ID } from "./constants";
import type {
  ActivityWithFlow,
  ConversationBaseDetail,
  ConversationError,
  ServiceFlowRun,
  Task,
} from "../shared/interfaces";
import { getFlatChunks } from "../shared/getFlatChunks";

export function useConversationGraph(
  conversation: ConversationBaseDetail | null | undefined,
  tasks: Task[],
  errors: ConversationError[],
  flowMap?: Map<string, ServiceFlowRun>,
  activityMap?: Map<string, ActivityWithFlow>,
  options?: {
    showHiddenJobs?: boolean;
    showHumanActions?: boolean;
    separateInstructions?: boolean;
  }
) {
  const { /* showHiddenJobs, */ showHumanActions, separateInstructions } =
    options ?? {};

  return useMemo(() => {
    if (!conversation) {
      return null;
    }

    const { chunks, jobMap } = getFlatChunks(
      tasks,
      errors,
      flowMap,
      activityMap
    );

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nav: GraphNavItem[] = [];
    const views: GraphGeneratedView[] = [];
    const jobLevels = new Map<string, number>();

    const userInputNodes: string[] = [];
    let username: string | undefined;
    let previousNodeId: string | undefined;

    for (const chunk of chunks) {
      const nodeIds: string[] = [];

      if (chunk.type === "job") {
        const job = chunk.job;
        jobLevels.set(job.id, chunk.level);
        const { messages } = job;
        const hasMessages =
          (Array.isArray(messages) && messages.length > 0) || job.toolCall;

        const userInput = messages
          ?.find((msg) => msg.role === "user")
          ?.parts?.find((part) => part.type === "text")?.text;

        const isRequirementJob =
          userInput !== undefined &&
          (chunk === chunks[0] || messages!.length === 1);
        if (isRequirementJob) {
          const requirementId = `requirement:${job.id}`;
          username = job.username;
          nodes.push({
            type: "requirement",
            id: requirementId,
            content: userInput,
            username,
            cmd: job.cmd,
          });
          nodeIds.push(requirementId);
          userInputNodes.push(requirementId);
        } else {
          if (job.instruction) {
            if (separateInstructions || !job.toolCall) {
              const instructionNodeId = `instruction:${job.id}`;
              nodes.push({
                type: "instruction",
                id: instructionNodeId,
                job,
                state: job.state,
              });
              nodeIds.push(instructionNodeId);
            }

            nav.push({
              id: job.id,
              title: job.instruction,
              state: job.state,
              level: chunk.level,
            });
          } else if (job.toolCall?.annotations?.title) {
            nav.push({
              id: job.id,
              title: job.toolCall.annotations.title,
              state: job.state,
              level: chunk.level,
            });
          }

          const jobNodeId = `job:${job.id}`;
          if (hasMessages) {
            nodes.push({
              type: "job",
              id: jobNodeId,
              job,
              state: job.state,
            });
            nodeIds.push(jobNodeId);
          }

          const view = job.generatedView;
          if (view) {
            views.push({
              id: job.id,
              view,
            });
          }

          if (showHumanActions && job.humanAction) {
            const humanActionNodeId = `human-action:${job.id}`;
            nodes.push({
              type: "requirement",
              id: humanActionNodeId,
              content: job.humanAction,
              username,
            });
            nodeIds.push(humanActionNodeId);
          }

          // Make sure every job in the list has at least one corresponding node
          if (nodeIds.length === 0) {
            nodes.push({
              type: "job",
              id: jobNodeId,
              job,
              state: job.state,
            });
            nodeIds.push(jobNodeId);
          }

          if (userInput !== undefined && job.state === "completed") {
            userInputNodes.push(nodeIds[nodeIds.length - 1]);
          }
        }
      } else if (chunk.type === "error") {
        const errorNodeId = `error:${nodes.length}`;
        nodes.push({
          type: "error",
          id: errorNodeId,
          content: chunk.error,
        });
        nodeIds.push(errorNodeId);
      } else {
        const nodeId = `${chunk.type}:${chunk.task.id}`;
        nodes.push({
          type: chunk.type,
          id: nodeId,
          taskId: chunk.task.id,
          flow: chunk.flow,
          ...(chunk.type === "activity" ? { activity: chunk.activity } : null),
        } as GraphNode);
        nodeIds.push(nodeId);
      }

      for (let i = 1; i < nodeIds.length; i++) {
        edges.push({
          source: nodeIds[i - 1],
          target: nodeIds[i],
        });
      }
      if (nodeIds.length > 0) {
        if (previousNodeId) {
          edges.push({
            source: previousNodeId,
            target: nodeIds[0],
          });
        }
        previousNodeId = nodeIds[nodeIds.length - 1];
      }
    }

    if (
      conversation.state !== "terminated" &&
      conversation.state !== "failed"
    ) {
      if (nodes.length === 0) {
        nodes.push({
          type: "loading",
          id: LOADING_NODE_ID,
        });
      } else {
        let counter = 0;
        for (const nodeId of userInputNodes) {
          if (!edges.some((edge) => edge.source === nodeId)) {
            const loadingId = `${LOADING_NODE_ID}:${counter++}`;
            nodes.push({
              type: "loading",
              id: loadingId,
            });
            edges.push({
              source: nodeId,
              target: loadingId,
            });
          }
        }
      }
    }

    return {
      nodes,
      edges,
      nav,
      views,
      jobMap,
      jobLevels,
    };
  }, [
    conversation,
    errors,
    separateInstructions,
    // showHiddenJobs,
    showHumanActions,
    tasks,
    flowMap,
    activityMap,
  ]);
}
