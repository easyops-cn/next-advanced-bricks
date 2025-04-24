import { useMemo } from "react";
import type { Job, GraphEdge, GraphNode, TaskBaseDetail } from "./interfaces";

export function useTaskGraph(
  task: TaskBaseDetail | null | undefined,
  jobs: Job[]
) {
  return useMemo(() => {
    if (!task) {
      return null;
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const requirementNodeId = "requirement";
    nodes.push({
      type: "requirement",
      id: requirementNodeId,
      content: task.requirement,
      state: jobs.length === 0 ? "working" : "completed",
      _timestamp: 0,
    });

    const jobMap = new Map<string, Job>();
    const childrenMap = new Map<string, string[]>();
    const downstreamMap = new Map<string, string[]>();
    const upstreamMap = new Map<string, string[]>();
    const rootDownstream: string[] = [];

    for (const job of jobs) {
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
    for (const job of jobs) {
      jobMap.set(job.id, job);
      if (job.parent) {
        continue;
      }

      const children = childrenMap.get(job.id);
      if (children) {
        let downstream = downstreamMap.get(job.id);
        if (!downstream) {
          downstream = [];
          downstreamMap.set(job.id, downstream);
        }
        for (const child of children) {
          downstream.push(child);
        }
      }

      if (job.upstream?.length) {
        for (const up of job.upstream) {
          const upChildren = childrenMap.get(up);
          const upstream = upChildren ?? [up];
          for (const u of upstream) {
            let downstream = downstreamMap.get(u);
            if (!downstream) {
              downstream = [];
              downstreamMap.set(u, downstream);
            }
            downstream.push(job.id);
          }
        }
      } else {
        rootDownstream.push(job.id);
      }
    }

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
      [requirementNodeId, [requirementNodeId]],
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
          state:
            job.state === "working" && hasMessages ? "completed" : job.state,
          _timestamp: job._instruction_timestamp,
        });

        nodeIds.push(instructionNodeId);
      }

      if (hasMessages || !job.instruction) {
        const jobNodeId = `job:${job.id}`;
        nodes.push({
          type: "job",
          id: jobNodeId,
          job,
          state: job.state,
          _timestamp: job._timestamp,
        });
        nodeIds.push(jobNodeId);
      }

      jobNodesMap.set(jobId, nodeIds);
    }

    for (const jobId of list) {
      // const job = jobMap.get(jobId)!;
      const nodeIds = jobNodesMap.get(jobId)!;

      const upstreams = upstreamMap.get(jobId);
      for (const upstream of upstreams ?? [requirementNodeId]) {
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
    };
  }, [task, jobs]);
}
