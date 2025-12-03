import type { MessageChunk } from "../chat-stream/interfaces";
import type {
  Task,
  ServiceFlowRun,
  ActivityWithFlow,
  ConversationError,
  Job,
  PlanStep,
} from "../shared/interfaces";
import { getTaskTree, type TaskTreeNode } from "./getTaskTree";

export interface FlatChunkOptions {
  flowMap?: Map<string, ServiceFlowRun>;
  activityMap?: Map<string, ActivityWithFlow>;
  skipActivitySubTasks?: boolean;
  enablePlan?: boolean;
  rootTaskId?: string;
  expandAskUser?: boolean;
}

export interface ActiveAskUser {
  task?: Task;
  parentJob?: Job;
  parentTask: Task;
}

export function getFlatChunks(
  tasks: Task[],
  errors: ConversationError[],
  options?: FlatChunkOptions
): {
  /** Message chunks, excluding those from skipped subtasks */
  chunks: MessageChunk[];
  /** All jobs including those nested within subtasks */
  jobMap: Map<string, Job>;
  /** Map of jobId to plan step, if plan is available */
  planMap: Map<string, PlanStep>;
  /** The active askUser chunk, if any */
  activeAskUser: ActiveAskUser | null;
} {
  const {
    flowMap,
    activityMap,
    skipActivitySubTasks,
    enablePlan,
    rootTaskId,
    expandAskUser,
  } = options || {};

  const taskTree = getTaskTree(tasks, rootTaskId);
  const chunks: MessageChunk[] = [];
  const jobMap = new Map<string, Job>();
  const planMap = new Map<string, PlanStep>();
  let activeAskUser: ActiveAskUser | null = null;

  const collectChunks = (taskNode: TaskTreeNode, level: number) => {
    if (enablePlan && taskNode.task.plan) {
      chunks.push({
        type: "plan",
        task: taskNode.task,
      });
      for (const step of taskNode.task.plan) {
        if (step.jobId) {
          planMap.set(step.jobId, step);
        }
      }
      return;
    }

    const flow = flowMap?.get(taskNode.task.id);

    const activityWithFlow = activityMap?.get(taskNode.task.id);
    if (activityWithFlow) {
      chunks.push({
        type: "activity",
        activity: activityWithFlow.activity,
        flow: activityWithFlow.flow,
        task: taskNode.task,
      });
    }

    const shouldSkip = activityWithFlow && skipActivitySubTasks;

    for (const { job, subTask } of taskNode.children) {
      if (shouldSkip) {
        if (
          (job.state === "completed" &&
            job.messages?.length &&
            job.messages.every((msg) => msg.role === "user")) ||
          job.hil
        ) {
          chunks.push({
            type: "job",
            job,
            level,
            fromSkippedSubTask: true,
          });
        }
        continue;
      }

      if (job.type === "askUser") {
        if (subTask) {
          if (expandAskUser) {
            collectChunks(subTask, level + 1);
          } else {
            chunks.push({
              type: "askUser",
              job,
              task: subTask?.task,
            });
          }
        }
      } else if (job.type === "serviceFlow") {
        if (flow) {
          chunks.push({
            type: "flow",
            flow,
            task: taskNode.task,
          });
        }
      } else if (subTask) {
        collectChunks(subTask, level + 1);
      } else {
        chunks.push({
          type: "job",
          job,
          level,
        });
      }
    }

    const taskErrors = errors.filter(
      (error) => error.taskId === taskNode.task.id && error.error
    );
    for (const error of taskErrors) {
      chunks.push({
        type: "error",
        error: error.error!,
      });
    }
  };

  const collectJobs = (taskNode: TaskTreeNode, parentJob?: Job) => {
    for (const { job, subTask } of taskNode.children) {
      jobMap.set(job.id, job);
      if (subTask) {
        collectJobs(subTask, job);

        if (job.type === "askUser") {
          activeAskUser = {
            task: subTask.task,
            parentJob,
            parentTask: taskNode.task,
          };
        }
      }
    }
  };

  // Get flattened jobs
  for (const taskNode of taskTree) {
    collectChunks(taskNode, 0);
    collectJobs(taskNode);
  }

  for (const error of errors) {
    if (!error.taskId && error.error) {
      chunks.push({
        type: "error",
        error: error.error,
      });
    }
  }

  return { chunks, jobMap, planMap, activeAskUser };
}
