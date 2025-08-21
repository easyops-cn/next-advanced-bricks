// istanbul ignore file
import { useMemo } from "react";
import type {
  GraphEdge,
  GraphNode,
  GraphNavItem,
  GraphGeneratedView,
} from "./interfaces";
import { LOADING_NODE_ID } from "./constants";
import { DONE_STATES } from "../shared/constants";
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
      map: jobMap,
      levels: jobLevels,
      downstreamMap,
    } = getFlatOrderedJobs(tasks, options);

    const jobNodesMap = new Map<string, string[]>();

    for (const jobId of list) {
      const job = jobMap.get(jobId)!;
      const { messages } = job;
      const hasMessages =
        (Array.isArray(messages) && messages.length > 0) || job.toolCall;

      const nodeIds: string[] = [];

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

      if (job.generatedView) {
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
          view: job.generatedView,
        });
      }

      jobNodesMap.set(jobId, nodeIds);
    }

    for (const [jobId, downstreams] of downstreamMap) {
      const nodeIds = jobNodesMap.get(jobId)!;
      for (let i = 1; i < nodeIds.length; i++) {
        edges.push({
          source: nodeIds[i - 1],
          target: nodeIds[i],
        });
      }
      const source = nodeIds[nodeIds.length - 1];
      for (const target of downstreams) {
        edges.push({ source, target });
      }
    }

    if (nodes.length === 0 && !DONE_STATES.includes(conversation.state)) {
      nodes.push({
        type: "loading",
        id: LOADING_NODE_ID,
      });
    } else
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
