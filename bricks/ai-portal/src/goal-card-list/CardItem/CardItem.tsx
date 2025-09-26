import React, { useCallback, useEffect, useRef, useState } from "react";
import { initializeI18n } from "@next-core/i18n";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  EoDropdownActions,
  DropdownActionsProps,
  DropdownActionsEvents,
  DropdownActionsEventsMapping,
} from "@next-bricks/basic/dropdown-actions";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import type { Action, SimpleAction } from "@next-bricks/basic/actions";
import classNames from "classnames";
import { K, NS, locales, t } from "../i18n.js";
import { getContentEditable } from "../../shared/getContentEditable.js";
initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedDropdownActions = wrapBrick<
  EoDropdownActions,
  DropdownActionsProps,
  DropdownActionsEvents,
  DropdownActionsEventsMapping
>("eo-dropdown-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});
const WrappedEasyopsAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);
const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export interface InputEventsMap {
  onValueChange: "change";
}

export type GoalState = "ready" | "working" | "completed";

interface GoalMember {
  instanceId: string;
}

export interface GoalItem {
  title: string;
  description?: string;
  state: GoalState;
  id: number;
  conversations?: number;
  owner?: GoalMember;
  users?: GoalMember[];
  instanceId: string;
  level: number;
  pending?: boolean;
  pendingParentId?: string;
}

interface GoalCardItemProps {
  goalItem: GoalItem;
  idWidth?: number;
  cardStyle?: React.CSSProperties;
  isActive?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onStatusChange?: (newStatus: GoalState) => void;
  onNewChat?: () => void;
  onClick?: () => void;
  onAppendChild?: () => void;
  onRevokeAppendChild?: () => void;
}

const iconMap = {
  ready: "uncheck-status",
  working: "active-status",
  completed: "check-status",
};

const iconActions: Action[] = [
  {
    key: "ready",
    icon: {
      icon: "uncheck-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.UN_START_STATUS),
  },
  {
    key: "working",
    icon: {
      icon: "active-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.RUNNING_STATUS),
  },
  {
    key: "completed",
    icon: {
      icon: "check-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.COMPLETED_STATUS),
  },
];

export function GoalCardItem({
  goalItem,
  idWidth,
  cardStyle,
  onStatusChange,
  onTitleChange,
  onClick,
  onNewChat,
  onAppendChild,
  onRevokeAppendChild,
  isActive,
}: GoalCardItemProps) {
  const {
    state,
    id: serialNumber,
    title,
    conversations,
    owner,
    pending,
  } = goalItem;

  const handleStatusChange = (action: SimpleAction) => {
    onStatusChange?.(action.key as GoalState);
  };

  const compositionRef = useRef(false);

  const handleCompositionStart = useCallback(() => {
    compositionRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    compositionRef.current = false;
  }, []);

  const [editing, setEditing] = useState(false);

  const handleFocus = useCallback(() => {
    setEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      setEditing(false);
      const value = e.currentTarget.textContent;

      if (pending && !value?.trim()) {
        onRevokeAppendChild?.();
        return;
      }

      if (value !== null && title !== value) {
        onTitleChange?.(value);
      }
    },
    [pending, title, onRevokeAppendChild, onTitleChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (compositionRef.current) {
        // Ignore key events during composition
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    []
  );

  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pending) {
      titleRef.current?.focus();
    }
  }, [pending]);

  return (
    <div
      className={classNames(
        "goal-item",
        goalItem.state,
        { editing },
        { active: isActive }
      )}
      style={{
        paddingLeft: `${(goalItem.level + 1) * 24}px`,
        ...cardStyle,
      }}
      onClick={pending ? undefined : onClick}
    >
      <div className="start">
        <WrappedDropdownActions
          actions={iconActions}
          disabled={pending}
          onActionClick={(e) => {
            handleStatusChange(e.detail);
          }}
        >
          <WrappedIcon
            className="icon"
            lib="easyops"
            category="colored-common"
            icon={iconMap[state]}
            onClick={(e) => e.stopPropagation()}
          />
        </WrappedDropdownActions>

        <span className="serial-number" style={{ width: idWidth }}>
          #{pending ? "" : serialNumber}
        </span>
        <span
          className="title"
          ref={titleRef}
          onClick={(e) => e.stopPropagation()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          contentEditable={getContentEditable(true)}
          suppressContentEditableWarning
        >
          {title}
        </span>
      </div>
      <div className="end">
        <div className="info">
          <div className="message">
            <WrappedIcon lib="easyops" category="common" icon="message" />
            <span className="count">{conversations || 0}</span>
          </div>
          <WrappedEasyopsAvatar
            nameOrInstanceId={owner?.instanceId}
            size="small"
          />
        </div>
        <div className="operation" onClick={(e) => e.stopPropagation()}>
          {goalItem.level === 0 && (
            <WrappedButton
              className="append-child"
              themeVariant="elevo"
              type="neutral"
              size="small"
              onClick={onAppendChild}
            >
              <WrappedIcon lib="lucide" icon="plus" />
            </WrappedButton>
          )}
          {!pending && (
            <WrappedButton
              className="new-chat"
              themeVariant="elevo"
              type="neutral"
              size="small"
              onClick={onNewChat}
            >
              {t(K.NEW_CHAT)}
            </WrappedButton>
          )}
        </div>
      </div>
    </div>
  );
}
