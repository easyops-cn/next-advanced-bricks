import { useMemo } from "react";
import type {
  GraphEdge,
  GraphNode,
  GraphNavItem,
  GraphGeneratedView,
} from "./interfaces";
import { LOADING_NODE_ID } from "./constants";
import type {
  ConversationBaseDetail,
  ConversationError,
  Task,
} from "../shared/interfaces";
import { getFlatOrderedJobs } from "./getFlatOrderedJobs";

export function useConversationGraph(
  conversation: ConversationBaseDetail | null | undefined,
  tasks: Task[],
  errors: ConversationError[],
  options?: {
    showHiddenJobs?: boolean;
    showHumanActions?: boolean;
    separateInstructions?: boolean;
  }
) {
  const { showHiddenJobs, showHumanActions, separateInstructions } =
    options ?? {};

  return useMemo(() => {
    if (!conversation) {
      return null;
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nav: GraphNavItem[] = [];
    const views: GraphGeneratedView[] = [];

    const {
      list,
      roots: jobRoots,
      map: jobMap,
      levels: jobLevels,
      downstreamMap,
      jobsWithFollowingErrors,
    } = getFlatOrderedJobs(tasks, errors, { showHiddenJobs });

    const jobNodesMap = new Map<string, string[]>();
    const userInputNodes: string[] = [];
    let username: string | undefined;

    const addFollowingError = (jobId: string, nodeIds: string[]) => {
      const followingError = jobsWithFollowingErrors.get(jobId);
      if (followingError) {
        const errorNodeId = `error:${jobId}`;
        nodes.push({
          type: "error",
          id: errorNodeId,
          content: followingError,
        });
        nodeIds.push(errorNodeId);
      }
    };

    for (const jobId of list) {
      const job = jobMap.get(jobId)!;
      const { messages } = job;
      const hasMessages =
        (Array.isArray(messages) && messages.length > 0) || job.toolCall;

      const nodeIds: string[] = [];

      const userInput = messages
        ?.find((msg) => msg.role === "user")
        ?.parts?.find((part) => part.type === "text")?.text;

      const isRequirementJob =
        userInput !== undefined &&
        (jobRoots.includes(jobId) || messages!.length === 1);
      if (isRequirementJob) {
        const requirementId = `requirement:${jobId}`;
        username = job.username;
        nodes.push({
          type: "requirement",
          id: requirementId,
          content: userInput,
          username,
        });
        nodeIds.push(requirementId);
        userInputNodes.push(requirementId);
        addFollowingError(jobId, nodeIds);
        jobNodesMap.set(jobId, nodeIds);
        continue;
      }

      if (job.instruction) {
        if (separateInstructions || !job.toolCall) {
          const instructionNodeId = `instruction:${jobId}`;
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
          level: jobLevels.get(job.id)!,
        });
      } else if (job.toolCall?.annotations?.title) {
        nav.push({
          id: job.id,
          title: job.toolCall.annotations.title,
          state: job.state,
          level: jobLevels.get(job.id)!,
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

      addFollowingError(jobId, nodeIds);

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

      jobNodesMap.set(jobId, nodeIds);
      if (userInput !== undefined && job.state === "completed") {
        userInputNodes.push(nodeIds[nodeIds.length - 1]);
      }
    }

    for (const jobId of list) {
      const nodeIds = jobNodesMap.get(jobId)!;
      for (let i = 1; i < nodeIds.length; i++) {
        edges.push({
          source: nodeIds[i - 1],
          target: nodeIds[i],
        });
      }
      const source = nodeIds[nodeIds.length - 1];
      const downstreams = downstreamMap.get(jobId) ?? [];
      for (const targetJobId of downstreams) {
        const targetNodeIds = jobNodesMap.get(targetJobId)!;
        edges.push({ source, target: targetNodeIds[0] });
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
    showHiddenJobs,
    showHumanActions,
    tasks,
  ]);
}
