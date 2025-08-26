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
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { initializeI18n } from "@next-core/i18n";
import styles from "./ChatBox.module.css";
import { showDialog, WrappedIcon, WrappedIconButton } from "../bricks";
import type { TaskState } from "../../cruise-canvas/interfaces";
import { K, locales, NS, t } from "./i18n";
import { ICON_LOADING } from "../constants";
import { TaskContext } from "../TaskContext";

initializeI18n(NS, locales);

const ICON_STOP: GeneralIconProps = {
  lib: "fa",
  prefix: "far",
  icon: "circle-stop",
};

export interface ChatBoxProps {
  state: TaskState | undefined;
  canChat: boolean;
  inputRequiredJobId?: string | null;
}

export function ChatBox({
  state,
  canChat,
  inputRequiredJobId,
}: ChatBoxProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
  const [wrap, setWrap] = useState(false);
  const { humanInput, onTerminate, supports } = useContext(TaskContext);
  const [actionBeingTaken, setActionBeingTaken] = useState(false);

  useEffect(() => {
    setActionBeingTaken(false);
  }, [state]);

  const handleTerminate = useCallback(async () => {
    try {
      await showDialog({
        type: "confirm",
        title: t(K.CONFIRM_TO_CANCEL_THE_TASK_TITLE),
        content: t(K.CONFIRM_TO_CANCEL_THE_TASK_CONTENT),
      });
    } catch {
      return;
    }
    onTerminate();
    setActionBeingTaken(true);
  }, [onTerminate]);

  useEffect(() => {
    if (canChat) {
      textareaRef.current?.focus();
    }
  }, [canChat]);

  const onSubmit = useCallback(
    (value: string) => {
      if (!canChat || !value) {
        return;
      }

      if (inputRequiredJobId) {
        humanInput(inputRequiredJobId, value);
      } else {
        humanInput("", value);
      }
      valueRef.current = "";
      setValue("");
    },
    [humanInput, inputRequiredJobId, canChat]
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
          {canChat || !supports?.intercept ? (
            <button
              className={styles["btn-send"]}
              disabled={!value || !canChat}
              onClick={handleSubmitClick}
            >
              <WrappedIcon lib="fa" prefix="fas" icon="arrow-up" />
            </button>
          ) : (
            <>
              {actionBeingTaken ? (
                <WrappedIconButton icon={ICON_LOADING} disabled />
              ) : (
                <WrappedIconButton
                  icon={ICON_STOP}
                  disabled={!!actionBeingTaken}
                  tooltip={actionBeingTaken ? undefined : t(K.CANCEL_THE_TASK)}
                  onClick={handleTerminate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
