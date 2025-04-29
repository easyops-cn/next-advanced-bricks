// istanbul ignore file
import { useEffect, useReducer, useRef, useState } from "react";
import { isEqual } from "lodash";
import { http } from "@next-core/http";
import { createSSEStream } from "@next-core/utils/general";
import { getBasePath, handleHttpError } from "@next-core/runtime";
import { rootReducer } from "./reducers";
import type { Job, StepWithState, TaskPatch } from "./interfaces";

export function useTaskDetail(taskId: string | undefined) {
  const [{ task, jobs, error }, dispatch] = useReducer(
    rootReducer,
    null,
    () => ({
      task: null,
      jobs: [],
      error: null,
    })
  );

  const humanInputRef = useRef<(jobId: string, input: string) => void>();

  useEffect(() => {
    dispatch({ type: "reset" });
    humanInputRef.current = undefined;
    if (!taskId) {
      return;
    }

    let ignore = false;
    let requesting = false;
    let ctrl: AbortController | undefined;

    const makeRequest = async () => {
      if (requesting) {
        return;
      }

      requesting = true;
      ctrl = new AbortController();
      try {
        const request = await createSSEStream<TaskPatch>(
          `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/llm/agent/flow/${taskId}`,
          // `/api/mocks/task/get?${new URLSearchParams({ id: taskId })}`
          // `http://localhost:8888/.netlify/functions/task-get?${new URLSearchParams({ id: taskId })}`
          // `https://serverless-mocks.netlify.app/.netlify/functions/task-get?${new URLSearchParams({ id: taskId })}`
          {
            signal: ctrl.signal,
          }
        );
        const stream = await request;
        let isInitial = true;
        for await (const value of stream) {
          if (ignore) {
            requesting = false;
            return;
          }

          dispatch({ type: "sse", payload: value, isInitial });
          isInitial = false;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("sse failed", e);
        handleHttpError(e);
      } finally {
        requesting = false;
      }
    };

    humanInputRef.current = async (jobId: string, input: string) => {
      try {
        await http.post(
          `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/llm/agent/flow/${taskId}/job/${jobId}`,
          { input }
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("human input failed", e);
        handleHttpError(e);
        return;
      }

      makeRequest();
    };

    makeRequest();

    return () => {
      ignore = true;
      ctrl?.abort();
    };
  }, [taskId]);

  const [plan, setPlan] = useState<StepWithState[]>([]);

  useEffect(() => {
    setPlan((prev) => {
      const jobMap = new Map<string, Job>();
      const childrenMap = new Map<string, string[]>();
      for (const job of jobs) {
        jobMap.set(job.id, job);

        if (job.parent) {
          childrenMap.set(job.parent, [
            ...(childrenMap.get(job.parent) ?? []),
            job.id,
          ]);
        }
      }

      // A step is input-required when itself is input-required or any of its descendants is input-required.
      const isInputRequired = (job: Job): boolean => {
        return (
          job.state === "input-required" ||
          !!childrenMap.get(job.id)?.some((childId) => {
            const childJob = jobMap.get(childId)!;
            return isInputRequired(childJob);
          })
        );
      };

      const plan: StepWithState[] = [];
      for (const step of task?.plan ?? []) {
        const job = jobMap.get(step.id);
        plan.push({
          id: step.id,
          instruction: step.instruction,
          state: job
            ? isInputRequired(job)
              ? "input-required"
              : job.state
            : undefined,
        });
      }

      return isEqual(prev, plan) ? prev : plan;
    });
  }, [jobs, task?.plan]);

  return { task, jobs, plan, error, humanInputRef };
}
