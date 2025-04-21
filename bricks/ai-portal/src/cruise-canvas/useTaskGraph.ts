import { useMemo } from "react";
import type { Job, GraphEdge, GraphNode, TaskBaseDetail } from "./interfaces";

export function useTaskGraph(task: TaskBaseDetail | null | undefined, jobs: Job[]) {
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
    const rootChildren: string[] = [];

    for (const job of jobs) {
      jobMap.set(job.id, job);
      if (job.parent?.length) {
        for (const p of job.parent) {
          let children = childrenMap.get(p);
          if (!children) {
            children = [];
            childrenMap.set(p, children);
          }
          children.push(job.id);
        }
      } else {
        rootChildren.push(job.id);
      }
    }

    // Get BFS order of jobs
    const list: string[] = [];
    const visitedJobs = new Set<string>();
    const queue: string[] = [...rootChildren];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visitedJobs.has(id)) {
        continue;
      }
      visitedJobs.add(id);
      list.push(id);
      const children = childrenMap.get(id);
      if (children) {
        queue.push(...children);
      }
    }

    const jobNodesMap = new Map<string, string[]>([[requirementNodeId, [requirementNodeId]]]);

    for (const jobId of list) {
      const job = jobMap.get(jobId)!;
      const { messages } = job;
      const hasMessages = (Array.isArray(messages) && messages.length > 0) || job.toolCall;

      const nodeIds: string[] = [];

      if (job.instruction) {
        const instructionNodeId = `instruction:${jobId}`;
        nodes.push({
          type: "instruction",
          id: instructionNodeId,
          job,
          state: job.state === "working" && hasMessages ? "completed" : job.state,
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
      const job = jobMap.get(jobId)!;
      const nodeIds = jobNodesMap.get(jobId)!;

      for (const parent of job.parent?.length ? job.parent : [requirementNodeId]) {
        const parentNodeIds = jobNodesMap.get(parent)!;
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
