import type { Task, Job } from "../shared/interfaces";
import { getOrderedNodes } from "./getOrderedNodes";

export interface TaskTreeNode {
  task: Task;
  children: JobTreeNode[];
}

export interface JobTreeNode {
  job: Job;
  subTask?: TaskTreeNode;
}

export function getTaskTree(
  tasks: Task[],
  rootTaskId?: string
): TaskTreeNode[] {
  const {
    list: taskIds,
    map: taskMap,
    childMap,
  } = getOrderedNodes(tasks, rootTaskId);

  const processedTaskMap = new Map(
    [...taskMap.entries()].map(([taskId, task]) => {
      return [taskId, getOrderedNodes(task.jobs)];
    })
  );

  const buildTaskTreeNode = (taskId: string): TaskTreeNode => {
    const task = taskMap.get(taskId)!;
    const { list: jobIds, map: jobMap } = processedTaskMap.get(taskId)!;

    const children: JobTreeNode[] = jobIds.map((jobId) => {
      const job = jobMap.get(jobId)!;
      const subTaskId = childMap.get(job.id);
      if (subTaskId) {
        return {
          job,
          subTask: buildTaskTreeNode(subTaskId),
        };
      }
      return { job };
    });

    return {
      task,
      children,
    };
  };

  return taskIds.map((taskId) => buildTaskTreeNode(taskId));
}
