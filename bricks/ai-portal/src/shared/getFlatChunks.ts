import type {
  MessageChunk,
  MessageChunkOfAskUser,
} from "../chat-stream/interfaces";
import type {
  Task,
  ServiceFlowRun,
  ActivityWithFlow,
  ConversationError,
  Job,
} from "../shared/interfaces";
import { getTaskTree, type TaskTreeNode } from "./getTaskTree";

export interface FlatChunkOptions {
  flowMap?: Map<string, ServiceFlowRun>;
  activityMap?: Map<string, ActivityWithFlow>;
  skipActivitySubTasks?: boolean;
  enablePlan?: boolean;
  rootTaskId?: string;
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
  /** The active askUser chunk, if any */
  activeAskUser: MessageChunkOfAskUser | null;
} {
  const { flowMap, activityMap, skipActivitySubTasks, enablePlan, rootTaskId } =
    options || {};

  const taskTree = getTaskTree(tasks, rootTaskId);
  const chunks: MessageChunk[] = [];
  const jobMap = new Map<string, Job>();
  let activeAskUser: MessageChunkOfAskUser | null = null;

  const collectChunks = (taskNode: TaskTreeNode, level: number) => {
    if (enablePlan && taskNode.task.plan) {
      chunks.push({
        type: "plan",
        task: taskNode.task,
      });
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
        chunks.push({
          type: "askUser",
          job,
          task: subTask?.task,
        });
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

  const collectJobs = (taskNode: TaskTreeNode) => {
    for (const { job, subTask } of taskNode.children) {
      jobMap.set(job.id, job);
      if (subTask) {
        collectJobs(subTask);

        if (job.type === "askUser") {
          activeAskUser = {
            type: "askUser",
            job,
            task: subTask.task,
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

  return { chunks, jobMap, activeAskUser };
}
