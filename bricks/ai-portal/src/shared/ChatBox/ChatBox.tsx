import React, { useCallback, useContext, useEffect, useState } from "react";
import { initializeI18n } from "@next-core/i18n";
import { showDialog, WrappedChatInput, WrappedIcon } from "../bricks";
import { K, locales, NS, t } from "./i18n";
import { TaskContext } from "../TaskContext";
import type { ConversationState } from "../interfaces";
import styles from "./ChatBox.module.css";
import { ICON_STOP } from "../constants";

initializeI18n(NS, locales);

export interface ChatBoxProps {
  state: ConversationState | undefined;
  canChat: boolean;
  showInput?: "auto" | "always" | "never";
  className?: string;
}

export function ChatBox({
  state,
  canChat,
  showInput,
  className,
}: ChatBoxProps): JSX.Element {
  const {
    humanInput,
    onTerminate,
    supports,
    aiEmployees,
    commands,
    uploadOptions,
  } = useContext(TaskContext);

  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    setTerminating(false);
  }, [state]);

  const handleTerminate = useCallback(async () => {
    try {
      await showDialog({
        type: "confirm",
        title: t(K.CONFIRM_TO_TERMINATE_THE_TASK_TITLE),
        content: t(K.CONFIRM_TO_TERMINATE_THE_TASK_DESCRIPTION),
      });
    } catch {
      return;
    }
    onTerminate();
    setTerminating(true);
  }, [onTerminate]);

  if (
    showInput === "never" ||
    (!canChat && supports?.intercept && showInput !== "always")
  ) {
    return (
      <button
        className={styles.button}
        onClick={handleTerminate}
        disabled={terminating || canChat}
      >
        <WrappedIcon {...ICON_STOP} />
        {t(K.TERMINATE_THE_TASK)}
      </button>
    );
  }

  return (
    <WrappedChatInput
      placeholder={t(K.SEND_MESSAGE)}
      autoFocus
      autoFade
      aiEmployees={aiEmployees}
      commands={commands}
      suggestionsPlacement="top"
      uploadOptions={uploadOptions}
      className={className}
      onChatSubmit={(e) => {
        const { content, ...extra } = e.detail;
        humanInput(content, undefined, extra);
      }}
      onTerminate={handleTerminate}
    />
  );
}
