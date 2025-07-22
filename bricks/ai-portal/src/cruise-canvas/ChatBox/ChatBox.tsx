import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import {
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import ResizeObserver from "resize-observer-polyfill";
import styles from "./ChatBox.module.css";
import { showDialog, WrappedIcon, WrappedTooltip } from "../bricks";
import { CanvasContext } from "../CanvasContext";
import type { TaskState } from "../interfaces";
import { K, t } from "../i18n";

export interface ChatBoxProps {
  taskState: TaskState | undefined;
  taskDone: boolean;
}

export function ChatBox({ taskState, taskDone }: ChatBoxProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
  const [wrap, setWrap] = useState(false);
  const { onPause, onResume, onCancel, supports } = useContext(CanvasContext);
  const [actionBeingTaken, setActionBeingTaken] = useState<
    "toggle" | "cancel" | null
  >(null);

  useEffect(() => {
    setActionBeingTaken(null);
  }, [taskState]);

  const handleResume = useCallback(() => {
    onResume();
    setActionBeingTaken("toggle");
  }, [onResume]);

  const handlePause = useCallback(() => {
    onPause();
    setActionBeingTaken("toggle");
  }, [onPause]);

  const handleStop = useCallback(async () => {
    try {
      await showDialog({
        type: "confirm",
        title: t(K.CONFIRM_TO_CANCEL_THE_TASK_TITLE),
        content: t(K.CONFIRM_TO_CANCEL_THE_TASK_CONTENT),
      });
    } catch {
      return;
    }
    onCancel();
    setActionBeingTaken("cancel");
  }, [onCancel]);

  const onSubmit = useCallback(
    (_value: string) => {
      if (!taskDone) {
        return;
      }
      showDialog({
        type: "warn",
        title: "提示",
        content: "功能暂未实现",
      });
      valueRef.current = "";
      setValue("");
    },
    [taskDone]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (e.currentTarget.value) {
        onSubmit?.(e.currentTarget.value);
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      valueRef.current = e.target.value;
      setValue(e.target.value);
    },
    []
  );

  const handleSubmitClick = useCallback(() => {
    onSubmit?.(valueRef.current);
  }, [onSubmit]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          // istanbul ignore next: compatibility
          const currentBlockSize = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].blockSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .blockSize
            : entry.contentRect.height;
          if (currentBlockSize > 52) {
            setWrap(true);
          }
        }
      }
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!value) {
      setWrap(false);
    }
  }, [value]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    for (const item of e.nativeEvent.composedPath()) {
      if (
        item instanceof HTMLTextAreaElement ||
        item instanceof HTMLButtonElement
      ) {
        return;
      }
    }
    textareaRef.current?.focus();
  }, []);

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <div className={classNames(styles.box, { [styles.wrap]: wrap })}>
        <div className={styles.input} ref={containerRef}>
          <TextareaAutoResize
            containerRef={containerRef}
            ref={textareaRef}
            value={value}
            minRows={1}
            maxRows={4}
            borderSize={0}
            paddingSize={16}
            autoResize
            placeholder={t(K.SEND_MESSAGE)}
            submitWhen="enter-without-shift"
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </div>
        <div className={styles.toolbar}>
          {taskDone || !supports?.intercept ? (
            <button
              className={styles["btn-send"]}
              disabled={!value || !taskDone}
              onClick={handleSubmitClick}
            >
              <WrappedIcon lib="fa" prefix="fas" icon="arrow-up" />
            </button>
          ) : (
            <>
              {actionBeingTaken === "toggle" ? (
                <WrappedTooltip>
                  <button disabled className={styles["btn-intercept"]}>
                    <WrappedIcon
                      lib="antd"
                      icon="loading-3-quarters"
                      spinning
                    />
                  </button>
                </WrappedTooltip>
              ) : taskState === "paused" ? (
                <WrappedTooltip
                  content={actionBeingTaken ? undefined : t(K.RESUME_THE_TASK)}
                  onClick={handleResume}
                >
                  <button
                    disabled={!!actionBeingTaken}
                    className={styles["btn-intercept"]}
                  >
                    <WrappedIcon lib="fa" prefix="far" icon="circle-play" />
                  </button>
                </WrappedTooltip>
              ) : (
                <WrappedTooltip
                  content={actionBeingTaken ? undefined : t(K.PAUSE_THE_TASK)}
                  onClick={handlePause}
                >
                  <button
                    disabled={!!actionBeingTaken}
                    className={styles["btn-intercept"]}
                  >
                    <WrappedIcon lib="fa" prefix="far" icon="circle-pause" />
                  </button>
                </WrappedTooltip>
              )}
              {actionBeingTaken === "cancel" ? (
                <WrappedTooltip>
                  <button disabled className={styles["btn-intercept"]}>
                    <WrappedIcon
                      lib="antd"
                      icon="loading-3-quarters"
                      spinning
                    />
                  </button>
                </WrappedTooltip>
              ) : (
                <WrappedTooltip
                  content={actionBeingTaken ? undefined : t(K.CANCEL_THE_TASK)}
                  onClick={handleStop}
                >
                  <button
                    disabled={!!actionBeingTaken}
                    className={styles["btn-intercept"]}
                  >
                    <WrappedIcon lib="fa" prefix="far" icon="circle-stop" />
                  </button>
                </WrappedTooltip>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
