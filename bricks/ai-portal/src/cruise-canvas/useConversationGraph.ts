import { useMemo } from "react";
import type {
  GraphEdge,
  GraphNode,
  GraphNavItem,
  GraphGeneratedView,
} from "./interfaces";
import { LOADING_NODE_ID } from "./constants";
import type { ConversationBaseDetail, Task } from "../shared/interfaces";
import { getFlatOrderedJobs } from "./getFlatOrderedJobs";

export function useConversationGraph(
  conversation: ConversationBaseDetail | null | undefined,
  tasks: Task[],
  options?: {
    showHiddenJobs?: boolean;
  }
) {
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
    } = getFlatOrderedJobs(tasks, options);

    // Make sure every job in the list has at least one corresponding node
    const jobNodesMap = new Map<string, string[]>();
    const userInputNodes: string[] = [];

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
        nodes.push({
          type: "requirement",
          id: requirementId,
          content: userInput,
        });
        nodeIds.push(requirementId);
        jobNodesMap.set(jobId, nodeIds);
        userInputNodes.push(requirementId);
        continue;
      }

      if (job.instruction) {
        const instructionNodeId = `instruction:${jobId}`;
        nodes.push({
          type: "instruction",
          id: instructionNodeId,
          job,
          state: job.state,
        });

        nodeIds.push(instructionNodeId);

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

      if (hasMessages || !job.instruction) {
        const jobNodeId = `job:${job.id}`;
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
        // Add view node for job
        const viewNodeId = `view:${job.id}`;
        nodes.push({
          type: "view",
          id: viewNodeId,
          job,
        });
        nodeIds.push(viewNodeId);

        views.push({
          id: job.id,
          view,
        });
      }

      if (job.humanAction) {
        const humanActionNodeId = `human-action:${job.id}`;
        nodes.push({
          type: "requirement",
          id: humanActionNodeId,
          content: job.humanAction,
        });
        nodeIds.push(humanActionNodeId);
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
  }, [conversation, tasks]);
}
