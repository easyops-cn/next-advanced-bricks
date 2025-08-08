import type { Job } from "./interfaces";

export interface GetOrderedJobsOptions {
  showHidden?: boolean;
}

export function getOrderedJobs(
  jobs: Job[] | null | undefined,
  options?: GetOrderedJobsOptions
) {
  const fixedJobs = jobs ?? [];
  const jobMap = new Map<string, Job>();
  const childrenMap = new Map<string, string[]>();
  const downstreamMap = new Map<string, Set<string>>();
  const upstreamMap = new Map<string, Set<string>>();
  const rootDownstream = new Set<string>();
  const rootChildren: string[] = [];
  const jobLevels = new Map<string, number>();
  const hiddenJobIds = new Set<string>();
  const showHidden = options?.showHidden;

  // Setup children relations
  for (const job of fixedJobs) {
    jobMap.set(job.id, job);
    // TODO: remove mock
    if (!showHidden && job.hidden) {
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
        downstreamMap.set(up, (downstream = new Set()));
      }
      downstream.add(job.id);
    }

    if (!job.parent && !job.upstream?.length && (showHidden || !job.hidden)) {
      rootDownstream.add(job.id);
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

        downstreamMap.set(jobId, new Set(directSubChildren));

        for (const child of leafSubChildren) {
          downstreamMap.set(child, new Set(downstream!));
        }

        alignDownstreamMap(subChildren, level + 1);
      }
    }
  };

  alignDownstreamMap(rootChildren, 0);

  // Setup upstreamMap
  for (const [jobId, downstreams] of downstreamMap) {
    for (const target of downstreams) {
      let upstreams = upstreamMap.get(target);
      if (!upstreams) {
        upstreamMap.set(target, (upstreams = new Set()));
      }
      upstreams.add(jobId);
    }
  }

  // Remove hidden jobs, and reconnect related connections.
  if (!showHidden && hiddenJobIds.size > 0) {
    const findVisibleDownstreams = (downstreams: Set<string>): string[] => {
      return [...downstreams].flatMap((jobId) => {
        const job = jobMap.get(jobId)!;
        if (job.hidden) {
          const nextDownstreams = downstreamMap.get(jobId);
          return nextDownstreams ? findVisibleDownstreams(nextDownstreams) : [];
        }
        return jobId;
      });
    };

    const findVisibleUpstreams = (upstreams: Set<string>): string[] => {
      return [...upstreams].flatMap((jobId) => {
        const job = jobMap.get(jobId)!;
        if (job.hidden) {
          const nextUpstreams = upstreamMap.get(jobId);
          return nextUpstreams ? findVisibleUpstreams(nextUpstreams) : [];
        }
        return jobId;
      });
    };

    for (const [jobId, downstreams] of downstreamMap) {
      if (hiddenJobIds.has(jobId)) {
        const visibleDownstreams = findVisibleDownstreams(downstreams);
        const upstreams = upstreamMap.get(jobId);

        if (upstreams) {
          const visibleUpstreams = findVisibleUpstreams(upstreams);
          for (const upstream of visibleUpstreams) {
            let originalDownstreams = downstreamMap.get(upstream);
            if (!originalDownstreams) {
              downstreamMap.set(upstream, (originalDownstreams = new Set()));
            }
            for (const id of visibleDownstreams) {
              originalDownstreams.add(id);
            }
          }
          for (const downstream of visibleDownstreams) {
            let originalUpstreams = upstreamMap.get(downstream);
            if (!originalUpstreams) {
              upstreamMap.set(downstream, (originalUpstreams = new Set()));
            }
            for (const id of visibleUpstreams) {
              originalUpstreams.add(id);
            }
          }
        } else {
          for (const id of visibleDownstreams) {
            rootDownstream.add(id);
          }
        }
      }
    }

    for (const jobId of hiddenJobIds) {
      downstreamMap.delete(jobId);
      upstreamMap.delete(jobId);
    }

    for (const [jobId, downstreams] of downstreamMap) {
      const filteredDownstreams = [...downstreams].filter(
        (child) => !hiddenJobIds.has(child)
      );
      if (filteredDownstreams.length < downstreams.size) {
        downstreamMap.set(jobId, new Set(filteredDownstreams));
      }
    }

    for (const [jobId, upstreams] of upstreamMap) {
      const filteredUpstreams = [...upstreams].filter(
        (parent) => !hiddenJobIds.has(parent)
      );
      if (filteredUpstreams.length < upstreams.size) {
        upstreamMap.set(jobId, new Set(filteredUpstreams));
      }
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

  return { list, jobMap, jobLevels, upstreamMap };
}
