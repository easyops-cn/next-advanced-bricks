import React, { useCallback, useContext, useEffect, useState } from "react";
import { initializeI18n } from "@next-core/i18n";
import { showDialog, WrappedChatInput } from "../bricks";
import { K, locales, NS, t } from "./i18n";
import { TaskContext } from "../TaskContext";
import type { ConversationState } from "../interfaces";

initializeI18n(NS, locales);

export interface ChatBoxProps {
  state: ConversationState | undefined;
  canChat: boolean;
}

export function ChatBox({ state, canChat }: ChatBoxProps): JSX.Element {
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
        content: "",
      });
    } catch {
      return;
    }
    onTerminate();
    setTerminating(true);
  }, [onTerminate]);

  return (
    <WrappedChatInput
      placeholder={t(K.SEND_MESSAGE)}
      autoFocus
      submitDisabled={!canChat}
      supportsTerminate={supports?.intercept}
      terminating={terminating}
      autoFade
      aiEmployees={aiEmployees}
      commands={commands}
      suggestionsPlacement="top"
      uploadOptions={uploadOptions}
      onChatSubmit={(e) => {
        const { content, ...extra } = e.detail;
        humanInput(content, undefined, extra);
      }}
      onTerminate={handleTerminate}
    />
  );
}
