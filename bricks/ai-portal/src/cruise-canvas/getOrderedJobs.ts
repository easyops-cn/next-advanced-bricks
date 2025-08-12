import type { Job } from "./interfaces";

export interface GetOrderedJobsOptions {
  showHiddenJobs?: boolean;
}

export function getOrderedJobs(
  jobs: Job[] | null | undefined,
  options?: GetOrderedJobsOptions
) {
  const fixedJobs = jobs ?? [];
  const jobMap = new Map<string, Job>();
  const childrenMap = new Map<string, string[]>();
  let downstreamMap = new Map<string, string[]>();
  let rootDownstreams: string[] = [];
  const rootChildren: string[] = [];
  const jobLevels = new Map<string, number>();
  const hiddenJobIds = new Set<string>();
  const showHiddenJobs = options?.showHiddenJobs;

  // Setup children relations
  for (const job of fixedJobs) {
    jobMap.set(job.id, job);
    // TODO: remove mock
    if (!showHiddenJobs && job.hidden) {
      hiddenJobIds.add(job.id);
    }
    if (job.parent) {
      let children = childrenMap.get(job.parent);
      if (!children) {
        childrenMap.set(job.parent, (children = []));
      }
      children.push(job.id);
    } else {
      rootChildren.push(job.id);
    }
  }

  // Setup downstream relations
  for (const job of fixedJobs) {
    for (const up of job.upstream ?? []) {
      let downstream = downstreamMap.get(up);
      if (!downstream) {
        downstreamMap.set(up, (downstream = []));
      }
      downstream.push(job.id);
    }

    if (
      !job.parent &&
      !job.upstream?.length &&
      (showHiddenJobs || !job.hidden)
    ) {
      rootDownstreams.push(job.id);
    }
  }

  // Convert children to flat downstream
  const alignDownstreamMap = (children: string[], level: number) => {
    for (const jobId of children) {
      jobLevels.set(jobId, level);
      const subChildren = childrenMap.get(jobId);
      const downstream = downstreamMap.get(jobId);

      if (subChildren) {
        const directSubChildren = subChildren.filter((child) => {
          const childJob = jobMap.get(child)!;
          return !childJob.upstream?.length;
        });

        const leafSubChildren = downstream
          ? subChildren.filter((child) => {
              return !downstreamMap.has(child);
            })
          : [];

        downstreamMap.set(jobId, directSubChildren);

        for (const child of leafSubChildren) {
          downstreamMap.set(child, [...downstream!]);
        }

        alignDownstreamMap(subChildren, level + 1);
      }
    }
  };

  alignDownstreamMap(rootChildren, 0);

  // Remove hidden jobs, and reconnect related downstream connections.
  let originalDownstreamMap: Map<string, string[]> | undefined;
  if (!showHiddenJobs && hiddenJobIds.size > 0) {
    const findVisibleDownstreams = (downstreams: string[]): string[] => {
      return downstreams.flatMap((jobId) => {
        const job = jobMap.get(jobId)!;
        if (job.hidden) {
          const nextDownstreams = downstreamMap.get(jobId);
          return nextDownstreams ? findVisibleDownstreams(nextDownstreams) : [];
        }
        return jobId;
      });
    };

    const newDownstreamMap = new Map<string, string[]>();

    const fixDownstreams = (visibleDownstreams: string[]) => {
      for (const id of visibleDownstreams) {
        const downstreams = downstreamMap.get(id);
        if (downstreams) {
          const visibleDownstreams = findVisibleDownstreams(downstreams);
          newDownstreamMap.set(id, visibleDownstreams);
          fixDownstreams(visibleDownstreams);
        }
      }
    };

    rootDownstreams = findVisibleDownstreams(rootDownstreams);
    fixDownstreams(rootDownstreams);
    originalDownstreamMap = downstreamMap;
    downstreamMap = newDownstreamMap;
  }

  // Get BFS order of jobs
  const list: string[] = [];
  const visitedJobs = new Set<string>();
  const queue: string[] = [...rootDownstreams];
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

  return { list, jobMap, jobLevels, downstreamMap, originalDownstreamMap };
}
