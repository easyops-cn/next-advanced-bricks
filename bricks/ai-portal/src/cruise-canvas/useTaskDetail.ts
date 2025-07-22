// istanbul ignore file
import { useCallback, useEffect, useReducer, useRef } from "react";
import { http } from "@next-core/http";
import { createSSEStream } from "@next-core/utils/general";
import { getBasePath, handleHttpError } from "@next-core/runtime";
import { rootReducer } from "./reducers";
import type { TaskPatch } from "./interfaces";

const MINIMAL_DELAY = 500;

export function useTaskDetail(
  taskId: string | undefined,
  replay?: boolean,
  replayDelay?: number
) {
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
  const resumedRef = useRef<() => void>();

  const replayListRef = useRef<TaskPatch[] | null>(null);
  const replayRef = useRef(replay);
  const replayDelayRef = useRef((replayDelay ?? 2) * 1000);
  const replayResolveRef = useRef<(() => void) | null>(null);

  const skipToResults = useCallback(() => {
    replayRef.current = false;
    if (replayResolveRef.current) {
      replayResolveRef.current();
      replayResolveRef.current = null;
    }
  }, []);

  const watchAgain = useCallback(async () => {
    replayRef.current = true;

    let isInitial = true;
    let previousTime: number | undefined;
    for (const value of replayListRef.current!) {
      if (replayRef.current) {
        let delay = replayDelayRef.current;
        if (value.time && previousTime) {
          delay = Math.min(
            Math.max(MINIMAL_DELAY, (value.time - previousTime) * 1000),
            delay
          );
        }
        previousTime = value.time;
        if (!isInitial) {
          await new Promise<void>((resolve) => {
            replayResolveRef.current = resolve;
            setTimeout(resolve, delay);
          });
          replayResolveRef.current = null;
        }
      }

      dispatch({ type: "sse", payload: value, isInitial });
      isInitial = false;
    }
  }, []);

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
      replayListRef.current = [];
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
        let previousTime: number | undefined;
        for await (const value of stream) {
          if (ignore) {
            requesting = false;
            return;
          }

          if (replayRef.current) {
            let delay = replayDelayRef.current;
            if (value.time && previousTime) {
              delay = Math.min(
                Math.max(MINIMAL_DELAY, (value.time - previousTime) * 1000),
                delay
              );
            }
            previousTime = value.time;

            if (!isInitial) {
              await new Promise<void>((resolve) => {
                replayResolveRef.current = resolve;
                setTimeout(resolve, delay);
              });
              replayResolveRef.current = null;
            }
          }

          replayListRef.current.push(value);
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

    resumedRef.current = makeRequest;

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

  return {
    task,
    jobs,
    error,
    humanInputRef,
    resumedRef,
    skipToResults,
    watchAgain,
  };
}
