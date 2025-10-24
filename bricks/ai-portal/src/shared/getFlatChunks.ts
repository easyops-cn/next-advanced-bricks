import type { MessageChunk } from "../chat-stream/interfaces";
import type {
  Task,
  ServiceFlowRun,
  ActivityWithFlow,
  ConversationError,
} from "../shared/interfaces";
import { getTaskTree, type TaskTreeNode } from "./getTaskTree";

export function getFlatChunks(
  tasks: Task[],
  errors: ConversationError[],
  flowMap?: Map<string, ServiceFlowRun>,
  activityMap?: Map<string, ActivityWithFlow>,
  skipActivitySubTasks?: boolean
) {
  const taskTree = getTaskTree(tasks);
  const flatChunks: MessageChunk[] = [];

  const traverseJobNodes = (taskNode: TaskTreeNode, level: number) => {
    const flow = flowMap?.get(taskNode.task.id);

    const activityWithFlow = activityMap?.get(taskNode.task.id);
    if (activityWithFlow) {
      flatChunks.push({
        type: "activity",
        activity: activityWithFlow.activity,
        flow: activityWithFlow.flow,
        task: taskNode.task,
      });
    }

    const acceptOnlyUserMessages = activityWithFlow && skipActivitySubTasks;

    for (const { job, subTask } of taskNode.children) {
      if (acceptOnlyUserMessages) {
        if (
          job.state === "completed" &&
          job.messages?.length &&
          job.messages.every((msg) => msg.role === "user")
        ) {
          flatChunks.push({
            type: "job",
            job,
            level,
            fromSkippedSubTask: true,
          });
        }
        continue;
      }

      if (job.type === "serviceFlow") {
        if (flow) {
          flatChunks.push({
            type: "flow",
            flow,
            task: taskNode.task,
          });
        }
      } else if (subTask) {
        traverseJobNodes(subTask, level + 1);
      } else {
        flatChunks.push({
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
      flatChunks.push({
        type: "error",
        error: error.error!,
      });
    }
  };

  // Get flattened jobs
  for (const taskNode of taskTree) {
    traverseJobNodes(taskNode, 0);
  }

  for (const error of errors) {
    if (!error.taskId && error.error) {
      flatChunks.push({
        type: "error",
        error: error.error,
      });
    }
  }

  return flatChunks;
}
