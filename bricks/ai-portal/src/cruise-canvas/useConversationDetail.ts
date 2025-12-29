// istanbul ignore file
import { useCallback, useEffect, useReducer, useRef } from "react";
import { createSSEStream } from "@next-core/utils/general";
import { getBasePath, handleHttpError } from "@next-core/runtime";
import { rootReducer } from "./reducers";
import type {
  ConversationPatch,
  ExtraChatPayload,
  RequestStore,
} from "../shared/interfaces";

const MINIMAL_DELAY = 500;

export function useConversationDetail(
  conversationId: string | null,
  initialRequest?: RequestStore | null,
  replay?: boolean,
  replayDelay?: number,
  onData?: (data: ConversationPatch) => void
) {
  const [{ conversation, tasks, serviceFlows, errors }, dispatch] = useReducer(
    rootReducer,
    null,
    () => ({
      conversation: null,
      tasks: [],
      serviceFlows: [],
      errors: [],
    })
  );

  const humanInputRef =
    useRef<
      (input: string | null, action?: string, extra?: ExtraChatPayload) => void
    >();

  const replayListRef = useRef<ConversationPatch[]>([]);
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
    if (!conversationId) {
      return;
    }

    replayRef.current = true;
    dispatch({ type: "reset" });

    let isInitial = true;
    let previousTime: number | undefined;
    for (const value of replayListRef.current) {
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

      dispatch({
        type: "sse",
        mode: "resume",
        payload: value,
        workspace: conversationId,
      });
      isInitial = false;
    }
    dispatch({ type: "finished" });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    dispatch({ type: "reset" });
    replayListRef.current = [];
    humanInputRef.current = undefined;

    let ignore = false;
    let requesting = false;
    let ctrl: AbortController | undefined;

    const makeRequest = async (
      content: string | null,
      action?: string,
      extra?: ExtraChatPayload
    ) => {
      if (requesting) {
        return;
      }

      requesting = true;
      ctrl = new AbortController();
      const mode = content === null && !action ? "resume" : "new";
      dispatch({ type: "started" });
      try {
        const sseRequest = await (mode === "resume"
          ? createSSEStream<ConversationPatch>(
              `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations/${conversationId}/stream`,
              {
                signal: ctrl.signal,
              }
            )
          : createSSEStream<ConversationPatch>(
              `${getBasePath()}api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations/${conversationId}/messages`,
              {
                signal: ctrl.signal,
                method: "POST",
                body: JSON.stringify(
                  action ? { action } : { content, ...extra }
                ),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            ));
        const stream = await sseRequest;
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
          dispatch({
            type: "sse",
            mode,
            payload: value,
            workspace: conversationId,
          });
          onData?.(value);
          isInitial = false;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("sse failed", e);
        handleHttpError(e);
      } finally {
        requesting = false;
        dispatch({ type: "finished" });
      }
    };

    humanInputRef.current = async (
      content: string | null,
      action?: string,
      extra?: ExtraChatPayload
    ) => {
      makeRequest(content, action, extra);
    };

    if (initialRequest?.conversationId === conversationId) {
      makeRequest(initialRequest.content, undefined, {
        cmd: initialRequest.cmd,
        files: initialRequest.files,
        aiEmployeeId: initialRequest.aiEmployeeId,
        agentId: initialRequest.agentId,
        spaceId: initialRequest.spaceId,
      });
    } else {
      makeRequest(null);
    }

    return () => {
      ignore = true;
      ctrl?.abort();
    };
  }, [conversationId, initialRequest]);

  return {
    conversation,
    tasks,
    serviceFlows,
    errors,
    humanInputRef,
    skipToResults,
    watchAgain,
  };
}
