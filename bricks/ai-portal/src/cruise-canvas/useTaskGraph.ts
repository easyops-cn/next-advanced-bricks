// istanbul ignore file
import { useMemo } from "react";
import type {
  Job,
  GraphEdge,
  GraphNode,
  TaskBaseDetail,
  GraphNavItem,
} from "./interfaces";
import { REQUIREMENT_NODE_ID } from "./constants";

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

    nodes.push({
      type: "requirement",
      id: REQUIREMENT_NODE_ID,
      content: task.requirement,
      state: fixedJobs.length === 0 ? "working" : "completed",
    });

    const jobMap = new Map<string, Job>();
    const childrenMap = new Map<string, string[]>();
    const downstreamMap = new Map<string, string[]>();
    const upstreamMap = new Map<string, string[]>();
    const rootDownstream: string[] = [];
    const rootChildren: string[] = [];

    for (const job of fixedJobs) {
      if (job.parent) {
        let children = childrenMap.get(job.parent);
        if (!children) {
          children = [];
          childrenMap.set(job.parent, children);
        }
        children.push(job.id);
      }
    }

    // Setup jobMap and downstreamMap
    for (const job of fixedJobs) {
      jobMap.set(job.id, job);

      for (const up of job.upstream ?? []) {
        let downstream = downstreamMap.get(up);
        if (!downstream) {
          downstream = [];
          downstreamMap.set(up, downstream);
        }
        downstream.push(job.id);
      }

      if (!job.parent) {
        rootChildren.push(job.id);

        if (!job.upstream?.length) {
          rootDownstream.push(job.id);
        }
      }
    }

    const alignDownstreamMap = (children: string[]) => {
      for (const rootJobId of children) {
        const subChildren = childrenMap.get(rootJobId);
        const downstream = downstreamMap.get(rootJobId);

        if (subChildren) {
          const firstLevelChildren = subChildren.filter((child) => {
            const childJob = jobMap.get(child)!;
            return !childJob.upstream?.length;
          });

          const lastLevelChildren = downstream
            ? subChildren.filter((child) => {
                return !downstreamMap.has(child);
              })
            : [];

          downstreamMap.set(rootJobId, firstLevelChildren);

          for (const child of lastLevelChildren) {
            downstreamMap.set(child, [...downstream!]);
          }

          alignDownstreamMap(subChildren);
        }
      }
    };

    alignDownstreamMap(rootChildren);

    // Setup upstreamMap
    for (const [upstream, downstream] of downstreamMap) {
      for (const target of downstream) {
        let upstreams = upstreamMap.get(target);
        if (!upstreams) {
          upstreams = [];
          upstreamMap.set(target, upstreams);
        }
        upstreams.push(upstream);
      }
    }

    // Get BFS order of jobs
    const list: string[] = [];
    const visitedJobs = new Set<string>();
    const queue: string[] = [...rootDownstream];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visitedJobs.has(id)) {
        continue;
      }
      visitedJobs.add(id);
      list.push(id);
      const downstream = downstreamMap.get(id);
      if (downstream) {
        queue.push(...downstream);
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

      // if (
      //   job.toolCall?.name === "get_view_with_info" &&
      //   job.state === "completed"
      // ) {
      //   // Add view node for job
      //   const viewNodeId = `view:${job.id}`;
      //   nodes.push({
      //     type: "view",
      //     id: viewNodeId,
      //     job,
      //   });
      //   nodeIds.push(viewNodeId);
      // }

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
    };
  }, [task, jobs]);
}
