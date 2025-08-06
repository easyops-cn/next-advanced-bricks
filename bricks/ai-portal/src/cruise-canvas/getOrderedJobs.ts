import type { Job } from "./interfaces";

export function getOrderedJobs(jobs: Job[] | null | undefined) {
  const fixedJobs = jobs ?? [];
  const jobMap = new Map<string, Job>();
  const childrenMap = new Map<string, string[]>();
  const downstreamMap = new Map<string, string[]>();
  const rootDownstream: string[] = [];
  const rootChildren: string[] = [];
  const jobLevels = new Map<string, number>();

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

  const alignDownstreamMap = (children: string[], level: number) => {
    for (const jobId of children) {
      jobLevels.set(jobId, level);
      const subChildren = childrenMap.get(jobId);
      const downstream = downstreamMap.get(jobId);

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

        downstreamMap.set(jobId, firstLevelChildren);

        for (const child of lastLevelChildren) {
          downstreamMap.set(child, [...downstream!]);
        }

        alignDownstreamMap(subChildren, level + 1);
      }
    }
  };

  alignDownstreamMap(rootChildren, 0);

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

  return { list, jobMap, jobLevels, downstreamMap };
}
