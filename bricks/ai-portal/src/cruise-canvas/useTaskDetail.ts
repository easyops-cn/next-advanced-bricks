/* eslint-disable no-console */
import { useEffect, useReducer, useRef } from "react";
import { createSSEStream } from "@next-core/utils/general";
import { getBasePath } from "@next-core/runtime";
import { rootReducer } from "./reducers";
import type { TaskPatch } from "./interfaces";

export function useTaskDetail(taskId: string | undefined) {
  const [{ task, jobs, plan }, dispatch] = useReducer(rootReducer, null, () => ({
    task: null,
    jobs: [],
    plan: [],
  }));

  const humanInputRef = useRef<(jobId: string, input: string) => void>();

  useEffect(() => {
    dispatch({ type: "reset" });
    humanInputRef.current = undefined;
    if (!taskId) {
      return;
    }

    let ignore = false;
    let requesting = false;

    const makeRequest = async () => {
      if (requesting) {
        return;
      }
      requesting = true;
      try {
        const request = await createSSEStream<TaskPatch>(
          `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/llm/agent/flow/${taskId}`
          // `/api/mocks/task/get?${new URLSearchParams({ id: taskId })}`
          // `http://localhost:8888/.netlify/functions/task-get?${new URLSearchParams({ id: taskId })}`
          // `https://serverless-mocks.netlify.app/.netlify/functions/task-get?${new URLSearchParams({ id: taskId })}`
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
        console.error("sse failed", e);
      } finally {
        requesting = false;
      }
    };

    humanInputRef.current = async (jobId: string, input: string) => {
      const response = await fetch(
        `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/llm/agent/flow/${taskId}/job/${jobId}`,
        // `/api/mocks/task/input`,
        // `http://localhost:8888/.netlify/functions/task-input`,
        // `https://serverless-mocks.netlify.app/.netlify/functions/task-input`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: taskId,
            jobId: jobId,
            input,
          }),
        }
      );
      if (response.ok) {
        makeRequest();
      } else {
        console.error(
          "human input failed",
          response.status,
          response.statusText
        );
      }
    };

    makeRequest();

    return () => {
      ignore = true;
    };
  }, [taskId]);

  return { task, jobs, plan, humanInputRef };
}
