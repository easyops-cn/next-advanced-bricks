// istanbul ignore file
import { useMemo } from "react";
import type {
  Job,
  GraphEdge,
  GraphNode,
  TaskBaseDetail,
  GraphNavItem,
  GraphGeneratedView,
} from "./interfaces";
import { REQUIREMENT_NODE_ID } from "./constants";
import { getOrderedJobs } from "./getOrderedJobs";

export function useTaskGraph(
  task: TaskBaseDetail | null | undefined,
  jobs: Job[] | null | undefined
) {
  return useMemo(() => {
    if (!task) {
      return null;
    }

    const fixedJobs = jobs ?? [];
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nav: GraphNavItem[] = [];
    const views: GraphGeneratedView[] = [];

    nodes.push({
      type: "requirement",
      id: REQUIREMENT_NODE_ID,
      content: task.requirement,
      state: fixedJobs.length === 0 ? "working" : "completed",
    });

    const { list, jobMap, jobLevels, upstreamMap } = getOrderedJobs(jobs);

    const jobNodesMap = new Map<string, string[]>([
      [REQUIREMENT_NODE_ID, [REQUIREMENT_NODE_ID]],
    ]);

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

    for (const jobId of list) {
      const nodeIds = jobNodesMap.get(jobId)!;

      const upstreams = upstreamMap.get(jobId);
      for (const upstream of upstreams ?? [REQUIREMENT_NODE_ID]) {
        const parentNodeIds = jobNodesMap.get(upstream)!;
        edges.push({
          source: parentNodeIds[parentNodeIds.length - 1],
          target: nodeIds[0],
        });
      }

      for (let i = 1; i < nodeIds.length; i++) {
        edges.push({
          source: nodeIds[i - 1],
          target: nodeIds[i],
        });
      }
    }

    return {
      nodes,
      edges,
      nav,
      views,
      jobLevels,
    };
  }, [task, jobs]);
}
