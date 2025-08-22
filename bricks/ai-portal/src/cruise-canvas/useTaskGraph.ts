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
import { LOADING_NODE_ID, REQUIREMENT_NODE_ID } from "./constants";
import { getOrderedNodes } from "./getOrderedNodes";
import { DONE_STATES } from "../shared/constants";

export function useTaskGraph(
  task: TaskBaseDetail | null | undefined,
  jobs: Job[] | null | undefined,
  options?: {
    showHiddenJobs?: boolean;
  }
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

    const {
      list,
      map: jobMap,
      levels: jobLevels,
      downstreamMap,
      fullDownstreamMap,
    } = getOrderedNodes(jobs, { showHiddenNodes: options?.showHiddenJobs });

    const upstreamMap = new Map<string, string[]>();
    // Setup upstreamMap
    for (const [jobId, downstreams] of downstreamMap) {
      for (const target of downstreams) {
        let upstreams = upstreamMap.get(target);
        if (!upstreams) {
          upstreamMap.set(target, (upstreams = []));
        }
        upstreams.push(jobId);
      }
    }

    const withHiddenDownstreamJobs: string[] = [];
    if (fullDownstreamMap) {
      for (const jobId of list) {
        const job = jobMap.get(jobId)!;
        if (job.state === "completed") {
          const downstream = downstreamMap.get(jobId);
          if (!downstream?.length) {
            const originalDownstream = fullDownstreamMap.get(jobId);
            if (originalDownstream?.length) {
              withHiddenDownstreamJobs.push(jobId);
            }
          }
        }
      }
    }

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

      const view = job.generatedView || job.staticDataView;
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

    if (nodes.length === 1 && !DONE_STATES.includes(task.state)) {
      nodes.push({
        type: "loading",
        id: LOADING_NODE_ID,
      });
      edges.push({
        source: REQUIREMENT_NODE_ID,
        target: LOADING_NODE_ID,
      });
    } else if (withHiddenDownstreamJobs.length > 0) {
      let counter = 0;
      for (const jobId of withHiddenDownstreamJobs) {
        const nodeIds = jobNodesMap.get(jobId)!;
        const lastNodeId = nodeIds[nodeIds.length - 1];
        if (!edges.some((edge) => edge.source === lastNodeId)) {
          const loadingId = `${LOADING_NODE_ID}:${counter++}`;
          nodes.push({
            type: "loading",
            id: loadingId,
          });
          edges.push({
            source: lastNodeId,
            target: loadingId,
          });
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
  }, [task, jobs]);
}
