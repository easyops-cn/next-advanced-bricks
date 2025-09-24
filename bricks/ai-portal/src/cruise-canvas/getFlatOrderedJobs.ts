import type { Task, Job, ConversationError } from "../shared/interfaces";
import { getOrderedNodes } from "./getOrderedNodes";

export function getFlatOrderedJobs(
  tasks: Task[] | null | undefined,
  errors: ConversationError[],
  options?: {
    showHiddenJobs?: boolean;
  }
) {
  const {
    list: taskIds,
    map: taskMap,
    roots: taskRoots,
    downstreamMap: taskDownstreamMap,
  } = getOrderedNodes(tasks);

  const jobOptions = {
    showHiddenNodes: options?.showHiddenJobs,
  };

  // Job ID list
  const list: string[] = [];
  const mapEntries: [string, Job][] = [];
  const levelEntries: [string, number][] = [];
  const downstreamMapEntries: [string, string[]][] = [];
  const roots: string[] = [];

  const orderedTasks = new Map(
    taskIds.map((taskId) => {
      const task = taskMap.get(taskId)!;
      return [taskId, getOrderedNodes(task.jobs, jobOptions)];
    })
  );

  for (const [taskId, orderedTask] of orderedTasks) {
    const {
      list: jobIds,
      map: jobMap,
      levels: jobLevels,
      roots: jobRoots,
      leaves: jobLeaves,
      downstreamMap: jobDownstreamMap,
    } = orderedTask;

    list.push(...jobIds);
    mapEntries.push(...jobMap);
    levelEntries.push(...jobLevels);
    downstreamMapEntries.push(...jobDownstreamMap);
    if (taskRoots.includes(taskId)) {
      roots.push(...jobRoots);
    }

    const downstreamTasks = taskDownstreamMap.get(taskId);
    if (downstreamTasks?.length) {
      for (const downstreamTaskId of downstreamTasks) {
        const { roots: downstreamTaskRoots } =
          orderedTasks.get(downstreamTaskId)!;
        for (const leaf of jobLeaves) {
          downstreamMapEntries.push([leaf, downstreamTaskRoots]);
        }
      }
    }
  }

  const downstreamMap = new Map(downstreamMapEntries);

  const jobsWithFollowingErrors = new Map<string, string>();
  for (const error of errors) {
    if (error.error) {
      const jobId = error.jobs.findLast((job) => {
        const downstreams = downstreamMap.get(job);
        return (
          !downstreams || downstreams.every((d) => !error.jobs.includes(d))
        );
      });
      if (jobId) {
        jobsWithFollowingErrors.set(jobId, error.error);
      }
    }
  }

  return {
    list,
    map: new Map(mapEntries),
    roots,
    levels: new Map(levelEntries),
    downstreamMap,
    jobsWithFollowingErrors,
  };
}
